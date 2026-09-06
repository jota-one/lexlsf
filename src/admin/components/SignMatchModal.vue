<template>
  <Dialog
    :visible="modelValue"
    modal
    :closable="!applying"
    :style="{ width: '52rem' }"
    @update:visible="$emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <span class="i-ic-round-sign-language text-xl"></span>
        <span class="font-bold">Rapprochement des signes</span>
      </div>
    </template>

    <div v-if="loading" class="flex flex-col items-center gap-3 py-12">
      <span class="loading loading-spinner loading-lg"></span>
      <span class="text-sm text-base-content/60">Chargement du catalogue des signes…</span>
    </div>

    <div v-else class="space-y-4">
      <p class="text-sm text-base-content/70">
        {{ withoutSign }} terme{{ withoutSign > 1 ? 's' : '' }} sans signe —
        <strong>{{ rows.length }}</strong> proposition{{ rows.length > 1 ? 's' : '' }}.
        <span v-if="unmatched === 1">
          Le terme restant n'a aucun signe approchant : il reste à renseigner à la main.
        </span>
        <span v-else-if="unmatched > 1">
          Les {{ unmatched }} autres n'ont aucun signe approchant : ils restent à renseigner à la
          main.
        </span>
      </p>

      <div v-if="rows.length === 0" class="text-center text-base-content/50 py-8">
        Aucun signe à proposer.
      </div>

      <template v-else>
        <table class="table table-sm w-full">
          <thead>
            <tr>
              <th class="w-10">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  :checked="allSelected"
                  :indeterminate="someSelected && !allSelected"
                  aria-label="Tout sélectionner"
                  @change="toggleAll"
                />
              </th>
              <th>Terme</th>
              <th>Signe proposé</th>
              <th class="w-24">Confiance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.termId">
              <td>
                <input
                  v-model="row.apply"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  :aria-label="`Associer un signe à ${row.term}`"
                />
              </td>
              <td class="font-medium">{{ row.term }}</td>
              <td>
                <Select
                  v-model="row.selectedSignId"
                  :options="row.candidates"
                  optionLabel="name"
                  optionValue="id"
                  class="w-full"
                  size="small"
                />
              </td>
              <td>
                <span class="badge badge-sm" :class="confidenceClass(row)">
                  {{ confidenceLabel(row) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <p class="text-xs text-base-content/50">
          Rien n'est enregistré tant que tu n'as pas validé. Les termes qui ont déjà un signe ne
          sont jamais touchés.
        </p>
      </template>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Annuler"
          severity="secondary"
          :disabled="applying"
          @click="$emit('update:modelValue', false)"
        />
        <Button
          :label="`Associer ${selectedCount} signe${selectedCount > 1 ? 's' : ''}`"
          :loading="applying"
          :disabled="applying || selectedCount === 0"
          @click="apply"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import useSignCatalogue from '../composables/useSignCatalogue'
import useLexicalTerms from '../composables/useLexicalTerms'
import usePbErrorToast from '../composables/usePbErrorToast'
import { findMatches, type TSignMatch } from '../helpers/signMatcher'
import type { TLexicalTerm } from '../../types'

type Props = {
  modelValue: boolean
  terms: TLexicalTerm.TRecord[]
}
const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  applied: []
}>()

type TRow = {
  termId: string
  term: string
  candidates: TSignMatch[]
  selectedSignId: string
  apply: boolean
}

const toast = useToast()
const { loading, loadIndex } = useSignCatalogue()
const { setTermSign } = useLexicalTerms()
const { showPbError } = usePbErrorToast()

const rows = ref<TRow[]>([])
const withoutSign = ref(0)
const applying = ref(false)

const selectedCount = computed(() => rows.value.filter(row => row.apply).length)
const allSelected = computed(
  () => rows.value.length > 0 && selectedCount.value === rows.value.length,
)
const someSelected = computed(() => selectedCount.value > 0)
const unmatched = computed(() => withoutSign.value - rows.value.length)

const scoreOf = (row: TRow) =>
  row.candidates.find(candidate => candidate.id === row.selectedSignId)?.score ?? 0

const confidenceLabel = (row: TRow) => (scoreOf(row) === 1 ? 'Exact' : 'Approchant')
const confidenceClass = (row: TRow) => (scoreOf(row) === 1 ? 'badge-success' : 'badge-ghost')

const toggleAll = () => {
  const next = !allSelected.value
  rows.value.forEach(row => (row.apply = next))
}

const build = async () => {
  rows.value = []
  const pending = props.terms.filter(term => !term.Sign)
  withoutSign.value = pending.length
  if (pending.length === 0) {
    return
  }

  try {
    const index = await loadIndex()
    rows.value = pending
      .map(term => {
        const candidates = findMatches(index, term.term)
        return {
          termId: term.id,
          term: term.term,
          candidates,
          selectedSignId: candidates[0]?.id || '',
          apply: candidates.length > 0,
        }
      })
      .filter(row => row.candidates.length > 0)
  } catch (error) {
    showPbError(error)
  }
}

watch(
  () => props.modelValue,
  async visible => {
    if (visible) {
      await build()
    }
  },
  { immediate: true },
)

const apply = async () => {
  applying.value = true
  let done = 0
  try {
    for (const row of rows.value) {
      if (!row.apply || !row.selectedSignId) {
        continue
      }
      await setTermSign(row.termId, row.selectedSignId)
      done += 1
    }
    toast.add({
      severity: 'success',
      summary: 'Signes associés',
      detail: `${done} terme(s) mis à jour.`,
      life: 4000,
    })
    emit('applied')
    emit('update:modelValue', false)
  } catch (error) {
    showPbError(error)
  } finally {
    applying.value = false
  }
}
</script>
