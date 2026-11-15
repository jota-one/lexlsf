<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import MultiSelect from 'primevue/multiselect'
import { pb } from '@lib/pb'
import useUsers from '@admin/composables/useUsers'
import useRoles from '@admin/composables/useRoles'
import useQuizzes from '@admin/composables/useQuizzes'
import usePbErrorToast from '@admin/composables/usePbErrorToast'
import type { TUser } from '@admin/composables/useUsers'

const props = defineProps<{
  quizId: string
  quizTitle?: string
}>()

const emit = defineEmits<{
  (e: 'saved'): void
}>()

const visible = defineModel<boolean>({ required: true })

const { users, loadUsers } = useUsers()
const { roles, loadRoles } = useRoles()
const { loadQuiz, shareQuiz } = useQuizzes()
const { showPbError } = usePbErrorToast()

const currentUserId = computed(() => pb.authStore.record?.id)

const sharedUserIds = ref<string[]>([])
const sharedRoleIds = ref<string[]>([])
const loading = ref(false)
const saving = ref(false)

const selectableUsers = computed(() => users.value.filter(u => u.id !== currentUserId.value))

const userOptionLabel = (user: TUser) => (user.name ? `${user.name} (${user.email})` : user.email)

watch(
  visible,
  async val => {
    if (!val) {
      return
    }
    loading.value = true
    try {
      const [{ quiz }] = await Promise.all([loadQuiz(props.quizId), loadUsers(), loadRoles()])
      sharedUserIds.value = (quiz.shared_with_users ?? []) as string[]
      sharedRoleIds.value = (quiz.shared_with_roles ?? []) as string[]
    } catch (e) {
      showPbError(e)
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

/** "Partagé avec : Etudiant, 2 utilisateurs", or that nobody has it yet. */
const sharingSummary = computed(() => {
  const parts = roles.value
    .filter(role => sharedRoleIds.value.includes(role.id))
    .map(role => role.name)
  const userCount = sharedUserIds.value.length
  if (userCount > 0) {
    parts.push(`${userCount} utilisateur${userCount > 1 ? 's' : ''}`)
  }
  return parts.length
    ? `Partagé avec : ${parts.join(', ')}`
    : "Ce quiz n'est partagé avec personne."
})

const save = async () => {
  saving.value = true
  try {
    await shareQuiz(props.quizId, sharedUserIds.value, sharedRoleIds.value)
    emit('saved')
    visible.value = false
  } catch (e) {
    showPbError(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="`Partager « ${quizTitle ?? 'ce quiz'} »`"
    class="w-[32rem]"
  >
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-md"></span>
    </div>

    <div v-else class="space-y-4 py-4">
      <p class="text-sm text-base-content/70">
        Partagez ce quiz avec un rôle entier ou avec des utilisateurs choisis. Ils pourront le
        consulter et démarrer des sessions de révision.
      </p>

      <div class="space-y-2">
        <h3 class="text-sm font-semibold">Rôles</h3>
        <div class="flex flex-wrap gap-4">
          <label
            v-for="role in roles"
            :key="role.id"
            class="flex items-center gap-2 cursor-pointer text-sm"
          >
            <input
              v-model="sharedRoleIds"
              type="checkbox"
              class="checkbox checkbox-sm"
              :value="role.id"
            />
            {{ role.name }}
          </label>
        </div>
        <p class="text-xs text-base-content/50">
          Tous les utilisateurs du rôle, y compris ceux qui le recevront plus tard.
        </p>
      </div>

      <h3 class="text-sm font-semibold">Utilisateurs</h3>

      <MultiSelect
        v-model="sharedUserIds"
        :options="selectableUsers"
        :optionLabel="userOptionLabel"
        optionValue="id"
        placeholder="Choisir des utilisateurs…"
        display="chip"
        filter
        filterPlaceholder="Rechercher un utilisateur…"
        class="w-full"
        emptyMessage="Aucun utilisateur disponible"
        emptyFilterMessage="Aucun résultat"
      />

      <p class="text-xs text-base-content/50">{{ sharingSummary }}</p>
    </div>

    <div class="flex justify-end gap-2 pt-4">
      <Button type="button" label="Annuler" severity="secondary" @click="visible = false" />
      <Button
        type="button"
        label="Enregistrer"
        :loading="saving"
        :disabled="loading"
        @click="save"
      />
    </div>
  </Dialog>
</template>
