package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"

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

		log.Printf("🎬 Optimizing video: %s", inputPath)

		// Crée un nom de sortie temporaire
		tmpOutputPath := inputPath + ".tmp.mp4"

		cmd := exec.Command(ffmpegBin,
			"-i", inputPath,
			"-vf", "scale=640:-2:force_divisible_by=2",
			"-c:v", "libx264",
			"-crf", "23",
			"-preset", "veryfast",
			"-an", // supprime la piste audio
			"-movflags", "faststart",
			"-y", // Overwrite
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
