package commands

import (
	"github.com/pocketbase/pocketbase"
	"github.com/spf13/cobra"
)

// VideoOptimizeCommand crée un placeholder pour les hooks de compression vidéo
func VideoOptimizeCommand(app *pocketbase.PocketBase) *cobra.Command {
	return &cobra.Command{
		Use:   "video:optimize",
		Short: "Setup video optimization hooks",
		Run: func(cmd *cobra.Command, args []string) {
			cmd.Println("Video optimization hooks are registered during startup")
		},
	}
}
