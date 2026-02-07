package main

import (
	"log"
	"os"

	"github.com/jota-one/lexlsf/commands"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()

	// Enable migrate command (JS migrations)
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangJS,
	})

	// Register custom commands
	app.RootCmd.AddCommand(commands.VideoOptimizeCommand(app))

	// Setup video optimization hooks
	SetupVideoOptimizationHooks(app)

	// Serve static files from pb_public (same as default pocketbase binary)
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))
		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
