<template>
  <div class="max-w-3xl mx-auto">
    <div class="card bg-white shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-3xl mb-6">Mon compte</h2>

        <PbErrorToast />

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Nom -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Nom</span>
            </label>
            <input
              v-model="profile.name"
              type="text"
              placeholder="Votre nom"
              class="input input-bordered w-full"
              required
            />
          </div>

          <!-- Email (lecture seule) -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Email</span>
            </label>
            <input
              :value="profile.email"
              type="email"
              class="input input-bordered w-full bg-base-200"
              disabled
            />
            <label class="label">
              <span class="label-text-alt text-gray-500">L'email ne peut pas être modifié</span>
            </label>
          </div>

          <!-- Avatar -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Avatar</span>
            </label>
            <div class="flex flex-col gap-4">
              <div v-if="avatarPreview" class="flex justify-center">
                <img
                  :src="avatarPreview"
                  alt="Avatar preview"
                  class="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                class="file-input file-input-bordered w-full"
                @change="handleAvatarChange"
              />
              <label class="label">
                <span class="label-text-alt text-gray-500">Format: JPG, PNG, GIF (max 5MB)</span>
              </label>
            </div>
          </div>

          <!-- Section changement de mot de passe -->
          <div class="divider">Changer le mot de passe</div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Ancien mot de passe</span>
            </label>
            <input
              v-model="passwordData.oldPassword"
              type="password"
              placeholder="Ancien mot de passe"
              class="input input-bordered w-full"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Nouveau mot de passe</span>
            </label>
            <input
              v-model="passwordData.password"
              type="password"
              placeholder="Nouveau mot de passe"
              class="input input-bordered w-full"
            />
            <label class="label">
              <span class="label-text-alt text-gray-500">Laisser vide pour ne pas changer</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Confirmer le nouveau mot de passe</span>
            </label>
            <input
              v-model="passwordData.passwordConfirm"
              type="password"
              placeholder="Confirmer le nouveau mot de passe"
              class="input input-bordered w-full"
            />
          </div>

          <!-- Boutons d'action -->
          <div class="card-actions justify-end gap-3 pt-4">
            <button type="button" class="btn btn-ghost" @click="goBack">Annuler</button>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
              <span v-else>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import PbErrorToast from '@admin/components/PbErrorToast.vue'
import usePbErrorToast from '@admin/composables/usePbErrorToast'
import useAuth from '@admin/composables/useAuth'
import config from '@config'

const { user, pb } = useAuth()
const toast = useToast()
const { showPbError } = usePbErrorToast()
const isLoading = ref(false)

const profile = reactive({
  name: '',
  email: ''
})

const passwordData = reactive({
  oldPassword: '',
  password: '',
  passwordConfirm: ''
})

const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string>('')

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Vérifier la taille
    if (file.size > 5 * 1024 * 1024) {
      toast.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'L\'image ne doit pas dépasser 5MB',
        life: 5000
      })
      return
    }

    avatarFile.value = file

    // Créer une prévisualisation
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const getAvatarUrl = (): string => {
  if (!user.value?.avatar) return ''
  return `${config.apiBaseUrl}/api/files/users/${user.value.id}/${user.value.avatar}`
}

onMounted(() => {
  if (user.value) {
    profile.name = user.value.name || ''
    profile.email = user.value.email || ''
    // Charger l'avatar existant
    if (user.value.avatar) {
      avatarPreview.value = getAvatarUrl()
    }
  }
})

const goBack = () => {
  window.history.back()
}

const handleSubmit = async () => {
  isLoading.value = true

  try {
    const formData = new FormData()
    formData.append('name', profile.name)

    // Ajouter l'avatar s'il a été sélectionné
    if (avatarFile.value) {
      formData.append('avatar', avatarFile.value)
    }

    // Validation du changement de mot de passe
    if (passwordData.password || passwordData.passwordConfirm || passwordData.oldPassword) {
      if (!passwordData.oldPassword) {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Veuillez saisir votre ancien mot de passe',
          life: 5000
        })
        isLoading.value = false
        return
      }

      if (!passwordData.password) {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Veuillez saisir un nouveau mot de passe',
          life: 5000
        })
        isLoading.value = false
        return
      }

      if (passwordData.password !== passwordData.passwordConfirm) {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Les nouveaux mots de passe ne correspondent pas',
          life: 5000
        })
        isLoading.value = false
        return
      }

      if (passwordData.password.length < 8) {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Le mot de passe doit contenir au moins 8 caractères',
          life: 5000
        })
        isLoading.value = false
        return
      }

      formData.append('oldPassword', passwordData.oldPassword)
      formData.append('password', passwordData.password)
      formData.append('passwordConfirm', passwordData.passwordConfirm)
    }

    // Mise à jour du profil
    await pb.collection('users').update(user.value.id, formData)

    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Votre profil a été mis à jour avec succès',
      life: 5000
    })

    // Réinitialiser les champs
    avatarFile.value = null
    passwordData.oldPassword = ''
    passwordData.password = ''
    passwordData.passwordConfirm = ''

    // Recharger l'avatar après mise à jour
    if (user.value?.avatar) {
      avatarPreview.value = getAvatarUrl()
    }

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    showPbError(error)
  } finally {
    isLoading.value = false
  }
}
</script>
