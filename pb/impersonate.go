package main

import (
	"log"
	"net/http"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

// SetupImpersonateRoute enregistre la route POST /api/custom/impersonate/{userId}
// Accessible uniquement aux utilisateurs ayant le rôle admin.
func SetupImpersonateRoute(app *pocketbase.PocketBase) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.POST("/api/custom/impersonate/{userId}", func(re *core.RequestEvent) error {
			if re.Auth == nil {
				return apis.NewUnauthorizedError("Non authentifié", nil)
			}

			// Récupère le rôle admin par slug
			adminRole, err := app.FindFirstRecordByFilter("roles", "slug = 'admin'")
			if err != nil {
				return apis.NewForbiddenError("Rôle admin introuvable", nil)
			}

			// Vérifie que l'utilisateur connecté possède le rôle admin
			isAdmin := false
			for _, roleId := range re.Auth.GetStringSlice("roles") {
				if roleId == adminRole.Id {
					isAdmin = true
					break
				}
			}
			if !isAdmin {
				return apis.NewForbiddenError("Accès réservé aux administrateurs", nil)
			}

			// Récupère l'utilisateur cible
			targetUser, err := app.FindRecordById("users", re.Request.PathValue("userId"))
			if err != nil {
				return apis.NewNotFoundError("Utilisateur introuvable", nil)
			}

			// Génère un token d'authentification pour l'utilisateur cible
			token, err := targetUser.NewAuthToken()
			if err != nil {
				return apis.NewApiError(http.StatusInternalServerError, "Erreur lors de la génération du token", nil)
			}

			return re.JSON(http.StatusOK, map[string]any{
				"token":  token,
				"record": targetUser,
			})
		})

		return se.Next()
	})

	log.Println("✅ Impersonate route registered at POST /api/custom/impersonate/{userId}")
}
