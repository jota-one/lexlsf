<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import MultiSelect from 'primevue/multiselect'
import PocketBase from 'pocketbase'
import config from '../../config'
import useUsers from '@admin/composables/useUsers'
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
const { loadQuiz, shareQuiz } = useQuizzes()
const { showPbError } = usePbErrorToast()

const pb = new PocketBase(config.apiBaseUrl)
const currentUserId = computed(() => pb.authStore.record?.id)

const sharedUserIds = ref<string[]>([])
const loading = ref(false)
const saving = ref(false)

const selectableUsers = computed(() =>
  users.value.filter(u => u.id !== currentUserId.value)
)

const userOptionLabel = (user: TUser) =>
  user.name ? `${user.name} (${user.email})` : user.email

watch(visible, async (val) => {
  if (!val) return
  loading.value = true
  try {
    const [{ quiz }] = await Promise.all([
      loadQuiz(props.quizId),
      loadUsers(),
    ])
    sharedUserIds.value = (quiz.shared_with_users ?? []) as string[]
  } catch (e) {
    showPbError(e)
  } finally {
    loading.value = false
  }
}, { immediate: true })

const save = async () => {
  saving.value = true
  try {
    await shareQuiz(props.quizId, sharedUserIds.value)
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
        Sélectionnez les utilisateurs avec qui partager ce quiz. Ils pourront le consulter et
        démarrer des sessions de révision.
      </p>

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

      <p v-if="sharedUserIds.length > 0" class="text-xs text-base-content/50">
        {{ sharedUserIds.length }} utilisateur{{ sharedUserIds.length > 1 ? 's' : '' }} avec accès
      </p>
      <p v-else class="text-xs text-base-content/50">Ce quiz n'est partagé avec personne.</p>
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
