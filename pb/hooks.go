package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

// SetupVideoOptimizationHooks configure les hooks pour compresser les vidéos
func SetupVideoOptimizationHooks(app *pocketbase.PocketBase) {
	// Après succès de création (transaction déjà commit)
	app.OnRecordAfterCreateSuccess("sign").BindFunc(func(e *core.RecordEvent) error {
		go func() {
			if err := optimizeVideoRecord(app, e.Record); err != nil {
				log.Printf("❌ optimizeVideoRecord (create) failed: %v", err)
			}
		}()
		return nil
	})

	// Après succès de mise à jour (transaction déjà commit)
	app.OnRecordAfterUpdateSuccess("sign").BindFunc(func(e *core.RecordEvent) error {
		go func() {
			if err := optimizeVideoRecord(app, e.Record); err != nil {
				log.Printf("❌ optimizeVideoRecord (update) failed: %v", err)
			}
		}()
		return nil
	})

	log.Println("✅ Video optimization hooks registered for 'sign' collection")
}

// optimizeVideoRecord compresse les vidéos trouvées dans le répertoire du record
func optimizeVideoRecord(app *pocketbase.PocketBase, record *core.Record) error {
	collectionPath := filepath.Join(app.DataDir(), "storage", record.Collection().Id)
	recordPath := filepath.Join(collectionPath, record.Id)

	// Scanne le répertoire pour trouver les fichiers vidéo
	entries, err := os.ReadDir(recordPath)
	if err != nil {
		if os.IsNotExist(err) {
			// Normal si pas de fichiers uploadés
			return nil
		}
		log.Printf("⚠️ failed to read record dir: %v", err)
		return nil
	}

	videoExtensions := map[string]bool{
		".mp4": true, ".mkv": true, ".webm": true, ".mov": true,
		".avi": true, ".flv": true, ".m4v": true, ".wmv": true,
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		ext := filepath.Ext(entry.Name())
		if !videoExtensions[ext] {
			continue
		}

		// Trouvé une vidéo à optimiser
		inputPath := filepath.Join(recordPath, entry.Name())

		// Vérifie que ffmpeg est disponible
		ffmpegBin, err := exec.LookPath("ffmpeg")
		if err != nil {
			// fallback Homebrew path (common on macOS arm64)
			fallback := "/opt/homebrew/bin/ffmpeg"
			if _, statErr := os.Stat(fallback); statErr == nil {
				ffmpegBin = fallback
			} else {
				// FFmpeg absent: on skip l'optimisation sans bloquer l'enregistrement
				log.Printf("⚠️ ffmpeg not available, skipping video optimization for: %s", inputPath)
				return nil
			}
		}

		// Vérifie que ffprobe est disponible
		ffprobeBin, err := exec.LookPath("ffprobe")
		if err != nil {
			// fallback Homebrew path (common on macOS arm64)
			fallback := "/opt/homebrew/bin/ffprobe"
			if _, statErr := os.Stat(fallback); statErr == nil {
				ffprobeBin = fallback
			} else {
				// FFprobe absent: on continue quand même (pas critique)
				log.Printf("⚠️ ffprobe not available, skipping codec check for: %s", inputPath)
				ffprobeBin = "" // Marque comme indisponible
			}
		}

		// Vérifie si la vidéo est déjà optimisée (codec hevc)
		if ffprobeBin != "" {
			probeCmd := exec.Command(ffprobeBin,
				"-v", "error",
				"-select_streams", "v:0",
				"-show_entries", "stream=codec_name",
				"-of", "default=noprint_wrappers=1:nokey=1",
				inputPath,
			)
			output, probeErr := probeCmd.Output()
			if probeErr == nil && strings.TrimSpace(string(output)) == "hevc" {
				log.Printf("✅ Video already optimized (hevc), skipping: %s", inputPath)
				return nil
			}
		}

		log.Printf("🎬 Optimizing video: %s", inputPath)

		// Crée un nom de sortie temporaire
		tmpOutputPath := inputPath + ".tmp.mp4"

		cmd := exec.Command(ffmpegBin,
			"-i", inputPath,
			"-vf", "crop=ih*4/3:ih,scale=720:-2:flags=lanczos:force_divisible_by=2,fps=24",
			"-c:v", "libx265",
			"-crf", "24",
			"-preset", "slower",
			"-tag:v", "hvc1",
			"-an",
			"-movflags", "+faststart",
			"-y",
			tmpOutputPath,
		)

		// Capture les logs FFmpeg
		stdout, _ := cmd.StdoutPipe()
		stderr, _ := cmd.StderrPipe()

		if err := cmd.Start(); err != nil {
			log.Printf("⚠️ failed to start ffmpeg: %v", err)
			return nil // Ne bloque pas l'enregistrement
		}

		// Consomme les logs en arrière-plan
		go io.Copy(os.Stdout, stdout)
		go io.Copy(os.Stderr, stderr)

		if err := cmd.Wait(); err != nil {
			log.Printf("⚠️ ffmpeg encoding failed: %v", err)
			return nil // Ne bloque pas l'enregistrement
		}

		// Remplace le fichier original
		if err := os.Rename(tmpOutputPath, inputPath); err != nil {
			log.Printf("⚠️ failed to replace original video: %v", err)
			// Nettoie le fichier temporaire
			os.Remove(tmpOutputPath)
			return nil
		}

		log.Printf("✅ Video optimized: %s", inputPath)
	}

	return nil
}

// SetupSlugHooks configure les hooks pour valider et gérer l'unicité des slugs
func SetupSlugHooks(app *pocketbase.PocketBase) {
	slugPattern := regexp.MustCompile(`^[a-z0-9-]+$`)

	// Hook avant la création d'un enregistrement
	app.OnRecordCreate("sign", "person").BindFunc(func(e *core.RecordEvent) error {
		slug := e.Record.GetString("slug")

		// Valide le format du slug
		if slug == "" {
			return fmt.Errorf("slug cannot be empty")
		}
		if !slugPattern.MatchString(slug) {
			return fmt.Errorf("slug must contain only lowercase letters, numbers, and hyphens")
		}

		// Vérifie l'unicité du slug
		slug = ensureUniqueSlug(app, e.Record.Collection().Name, slug, "")
		e.Record.Set("slug", slug)

		// Continue avec l'opération de création
		return e.Next()
	})

	// Hook avant la mise à jour d'un enregistrement
	app.OnRecordUpdate("sign", "person").BindFunc(func(e *core.RecordEvent) error {
		slug := e.Record.GetString("slug")

		// Valide le format du slug
		if slug == "" {
			return fmt.Errorf("slug cannot be empty")
		}
		if !slugPattern.MatchString(slug) {
			return fmt.Errorf("slug must contain only lowercase letters, numbers, and hyphens")
		}

		// Vérifie l'unicité du slug (en excluant l'enregistrement actuel)
		slug = ensureUniqueSlug(app, e.Record.Collection().Name, slug, e.Record.Id)
		e.Record.Set("slug", slug)

		// Continue avec l'opération de mise à jour
		return e.Next()
	})

	log.Println("✅ Slug validation hooks registered for 'sign' and 'person' collections")
}

// ensureUniqueSlug vérifie qu'un slug est unique et ajoute un suffixe numérique si nécessaire
func ensureUniqueSlug(app *pocketbase.PocketBase, collectionName, slug, excludeId string) string {
	baseSlug := slug
	counter := 2

	for {
		// Cherche un enregistrement avec ce slug
		filter := fmt.Sprintf("slug = '%s'", slug)
		if excludeId != "" {
			filter = fmt.Sprintf("slug = '%s' && id != '%s'", slug, excludeId)
		}

		record, err := app.FindFirstRecordByFilter(collectionName, filter)
		if err != nil || record == nil {
			// Slug disponible
			return slug
		}

		// Slug déjà utilisé, on ajoute un numéro
		slug = fmt.Sprintf("%s-%d", baseSlug, counter)
		counter++

		// Sécurité: évite une boucle infinie
		if counter > 1000 {
			log.Printf("⚠️ Too many slug conflicts for: %s", baseSlug)
			return slug
		}
	}
}
