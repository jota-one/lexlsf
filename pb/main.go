package main

import (
	"log"
	"os"

	"github.com/jota-one/lexlsf/commands"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()

	// Register jsvm plugin FIRST to load JS migrations from pb_migrations/
	jsvm.MustRegister(app, jsvm.Config{
		// Defaults to pb_data/../pb_migrations for migrations
		// Defaults to pb_data/../pb_hooks for hooks
	})

	// Enable migrate command (JS migrations)
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangJS,
		Automigrate:  true, // Auto-generate migration files from UI changes
	})

	// Register custom commands
	app.RootCmd.AddCommand(commands.VideoOptimizeCommand(app))

	// Setup video optimization hooks
	SetupVideoOptimizationHooks(app)

	// Setup slug validation hooks
	SetupSlugHooks(app)

	// Run migrations automatically after bootstrap
	app.OnBootstrap().BindFunc(func(e *core.BootstrapEvent) error {
		// First, initialize DB and resources
		if err := e.Next(); err != nil {
			return err
		}

		// Now run migrations after DB is ready
		if err := app.RunAllMigrations(); err != nil {
			return err
		}

		return nil
	})

	// Serve static files from pb_public (same as default pocketbase binary)
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))
		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
