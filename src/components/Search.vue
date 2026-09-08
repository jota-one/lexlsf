<template>
  <div
    ref="root"
    class="flex-1"
    :class="mode === 'hero' ? 'w-3/4 m-auto' : 'relative flex items-center pr-4 gap-2'"
  >
    <FloatLabel variant="in" class="flex items-center flex-1 gap-2">
      <AutoComplete
        v-model="selectedSign"
        :suggestions="suggestions"
        @complete="onSearch"
        @item-select="onSelect"
        option-label="label"
        class="flex-1"
        fluid
        :loading="loading"
        :size="mode === 'hero' ? 'large' : 'small'"
      >
        <template #option="slotProps">
          <div class="flex items-start gap-2 w-full">
            <div class="flex-1">
              <div class="font-medium">{{ slotProps.option.label }}</div>
              <div class="text-sm opacity-75">{{ slotProps.option.definition }}</div>
            </div>
            <span class="badge badge-sm mt-1" :class="badgeClass(slotProps.option.type)">
              {{ badgeLabel(slotProps.option.type) }}
            </span>
          </div>
        </template>
      </AutoComplete>
      <label>Chercher quelque-chose...</label>
    </FloatLabel>

    <!--
      The header has no room for the filters, so they hide behind a button; the
      home page field is wide enough to show them as toggles.
    -->
    <template v-if="mode === 'inline'">
      <button
        type="button"
        class="btn btn-ghost btn-sm text-white gap-1 shrink-0"
        :aria-expanded="filtersOpen"
        aria-label="Filtrer les collections cherchées"
        @click="filtersOpen = !filtersOpen"
      >
        <span class="i-fa-solid-filter"></span>
        <span v-if="!allSelected" class="text-xs font-semibold">
          {{ selectedCollections.length }}/{{ SEARCH_COLLECTIONS.length }}
        </span>
      </button>

      <div
        v-if="filtersOpen"
        class="absolute right-0 top-full mt-2 z-50 w-60 card bg-base-100 border border-base-300 shadow-xl p-3"
      >
        <p class="text-xs uppercase tracking-wide text-base-content/50 mb-2">Chercher dans</p>
        <label
          v-for="collection in SEARCH_COLLECTIONS"
          :key="collection.key"
          class="flex items-center gap-2 py-1 cursor-pointer"
        >
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            :checked="isSelected(collection.key)"
            :disabled="isLastSelected(collection.key)"
            @change="toggleCollection(collection.key)"
          />
          <span class="text-sm">{{ collection.label }}</span>
        </label>
      </div>
    </template>

    <div v-else class="flex flex-wrap justify-center gap-2 mt-3">
      <button
        v-for="collection in SEARCH_COLLECTIONS"
        :key="collection.key"
        type="button"
        class="badge badge-lg cursor-pointer"
        :class="isSelected(collection.key) ? collection.badge : 'badge-ghost opacity-60'"
        :aria-pressed="isSelected(collection.key)"
        @click="toggleCollection(collection.key)"
      >
        {{ collection.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import AutoComplete from 'primevue/autocomplete'
import FloatLabel from 'primevue/floatlabel'
import { pb } from '@lib/pb'
import {
  SEARCH_COLLECTIONS,
  allCollections,
  readStoredCollections,
  writeStoredCollections,
  type TSearchCollection,
} from '@lib/searchCollections'

type Props = {
  mode?: 'hero' | 'inline'
}
const props = withDefaults(defineProps<Props>(), {
  mode: 'inline',
})

const selectedSign = ref<Record<string, unknown> | null>(null)
const suggestions = ref<Array<Record<string, unknown>>>([])
const loading = ref(false)

/* ---- Collections searched ---- */

const rootRef = useTemplateRef<HTMLElement>('root')
const filtersOpen = ref(false)
// Server-rendered first, so the stored value can only be read once mounted.
const selectedCollections = ref<TSearchCollection[]>(allCollections())

const allSelected = computed(() => selectedCollections.value.length === SEARCH_COLLECTIONS.length)
const isSelected = (key: TSearchCollection) => selectedCollections.value.includes(key)
/** The last remaining collection cannot be unticked: an empty search finds nothing. */
const isLastSelected = (key: TSearchCollection) =>
  selectedCollections.value.length === 1 && isSelected(key)

const toggleCollection = (key: TSearchCollection) => {
  if (isLastSelected(key)) {
    return
  }
  selectedCollections.value = isSelected(key)
    ? selectedCollections.value.filter(collection => collection !== key)
    : [...selectedCollections.value, key]
}

onMounted(() => (selectedCollections.value = readStoredCollections()))
watch(selectedCollections, writeStoredCollections)
onClickOutside(rootRef, () => (filtersOpen.value = false))

const onSearch = async (event: { query?: string }) => {
  const query = event.query?.trim() || ''

  if (!query || query.length < 2) {
    suggestions.value = []
    return
  }

  loading.value = true
  try {
    const signFilter = `name~"${query}"`
    const cultureFilter = `(name~"${query}" || firstname~"${query}")`
    // An unticked collection is not queried at all, rather than filtered out of
    // the results: fewer round trips per keystroke.
    type TResults = { items?: Array<Record<string, unknown>> }
    const none: TResults = { items: [] }
    const when = (key: TSearchCollection, request: () => Promise<TResults>) =>
      isSelected(key) ? request() : none

    const [signsRes, cultureRes, lexicalRes, lexicalTermsRes, frenchRes, piDeafRes] =
      await Promise.all([
        when('sign', () =>
          pb.collection('sign').getList(1, 10, {
            filter: signFilter,
            fields: 'id,name,definition,slug',
            sort: 'name',
          }),
        ),
        when('culture', () =>
          pb.collection('person').getList(1, 10, {
            filter: cultureFilter,
            fields: 'id,name,firstname,organism,definition,slug',
            sort: 'name,firstname',
          }),
        ),
        when('lexical', () =>
          pb
            .collection('lexical_field')
            .getList(1, 5, { filter: signFilter, fields: 'id,name,slug', sort: 'name' }),
        ),
        when('lexical', () =>
          pb.collection('lexical_term').getList(1, 10, {
            filter: pb.filter('term ~ {:query}', { query }),
            expand: 'LexicalField',
            fields:
              'id,term,expand.LexicalField.id,expand.LexicalField.name,expand.LexicalField.slug',
            sort: 'term',
          }),
        ),
        when('french_expression', () =>
          pb.collection('french_expression').getList(1, 5, {
            filter: pb.filter('expression ~ {:query}', { query }),
            fields: 'id,expression,slug',
            sort: 'expression',
          }),
        ),
        when('pi_deaf_expression', () =>
          pb
            .collection('pi_deaf_expression')
            .getList(1, 5, { filter: signFilter, fields: 'id,name,slug', sort: 'name' }),
        ),
      ])

    const signs = (signsRes.items || []).map((item: Record<string, unknown>) => ({
      ...item,
      type: 'sign',
      label: item.name,
    }))
    const culture = (cultureRes.items || []).map((item: Record<string, unknown>) => ({
      ...item,
      type: item.organism ? 'organism' : 'person',
      label: item.organism ? item.name : [item.firstname, item.name].filter(Boolean).join(' '),
    }))
    const lexical = (lexicalRes.items || []).map((item: Record<string, unknown>) => ({
      ...item,
      type: 'lexical_field',
      label: item.name,
    }))
    const lexicalTerms = (lexicalTermsRes.items || [])
      .filter((item: Record<string, unknown>) => item.expand?.LexicalField)
      .map((item: Record<string, unknown>) => ({
        ...item.expand.LexicalField,
        type: 'lexical_field',
        label: item.term,
        definition: `dans : ${item.expand.LexicalField.name}`,
        // Land on the term itself — unfolded and highlighted — the way a link
        // between two terms does, rather than at the top of its field.
        hash: `#term-${item.id}`,
      }))
    const french = (frenchRes.items || []).map((item: Record<string, unknown>) => ({
      ...item,
      type: 'french_expression',
      label: item.expression,
    }))
    const piDeaf = (piDeafRes.items || []).map((item: Record<string, unknown>) => ({
      ...item,
      type: 'pi_deaf_expression',
      label: item.name,
    }))

    suggestions.value = [
      ...signs,
      ...culture,
      ...lexical,
      ...lexicalTerms,
      ...french,
      ...piDeaf,
    ].sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label))
  } catch (err) {
    console.error('Search error', err)
    suggestions.value = []
  } finally {
    loading.value = false
  }
}

const onSelect = (event: { value?: { slug?: string; type?: string; hash?: string } }) => {
  const selected = event.value
  if (!selected?.slug) {
    return
  }
  const routes: Record<string, string> = {
    sign: '/lexique/sign',
    organism: '/culture/person',
    person: '/culture/person',
    lexical_field: '/outils/champs-lexicaux',
    french_expression: '/outils/expressions-francaises',
    pi_deaf_expression: '/outils/expressions-pi-sourdes',
  }
  const base = routes[selected.type] || '/signs'
  window.location.href = `${base}/${selected.slug}${selected.hash || ''}`
}

const badgeClass = (type: string) => {
  const classes: Record<string, string> = {
    sign: 'badge-primary',
    organism: 'badge-info',
    person: 'badge-accent',
    lexical_field: 'badge-warning',
    french_expression: 'badge-success',
    pi_deaf_expression: 'badge-secondary',
  }
  return classes[type] ?? 'badge-ghost'
}

const badgeLabel = (type: string) => {
  const labels: Record<string, string> = {
    sign: 'Signe',
    organism: 'Organisme',
    person: 'Personne',
    lexical_field: 'Champ lexical',
    french_expression: 'Expr. française',
    pi_deaf_expression: 'Expr. pi-sourde',
  }
  return labels[type] ?? type
}
</script>
