<template>
  <FloatLabel
    variant="in"
    class="flex items-center flex-1 pr-4 gap-2"
    :class="{ 'w-3/4 m-auto': mode === 'hero' }"
  >
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AutoComplete from 'primevue/autocomplete';
import FloatLabel from 'primevue/floatlabel';
import config from '../config';
import PocketBase from 'pocketbase';

type Props = {
    mode?: 'hero' | 'inline';
};
const props = withDefaults(defineProps<Props>(), {
    mode: 'inline',
});

const pb = new PocketBase(config.apiBaseUrl);

const selectedSign = ref<any>(null);
const suggestions = ref<any[]>([]);
const loading = ref(false);

const onSearch = async (event: any) => {
    const query = event.query?.trim() || '';

    if (!query || query.length < 2) {
        suggestions.value = [];
        return;
    }

    loading.value = true;
    try {
        const signFilter = `name~"${query}"`;
        const cultureFilter = `(name~"${query}" || firstname~"${query}")`;

        const [signsRes, cultureRes, lexicalRes, lexicalTermsRes, frenchRes, piDeafRes] = await Promise.all([
            pb.collection('sign').getList(1, 10, { filter: signFilter, fields: 'id,name,definition,slug', sort: 'name' }),
            pb.collection('person').getList(1, 10, { filter: cultureFilter, fields: 'id,name,firstname,organism,definition,slug', sort: 'name,firstname' }),
            pb.collection('lexical_field').getList(1, 5, { filter: signFilter, fields: 'id,name,slug', sort: 'name' }),
            pb.collection('lexical_term').getList(1, 10, { filter: `term~"${query}"`, expand: 'LexicalField', fields: 'id,term,expand.LexicalField.id,expand.LexicalField.name,expand.LexicalField.slug', sort: 'term' }),
            pb.collection('french_expression').getList(1, 5, { filter: `expression~"${query}"`, fields: 'id,expression,slug', sort: 'expression' }),
            pb.collection('pi_deaf_expression').getList(1, 5, { filter: signFilter, fields: 'id,name,slug', sort: 'name' }),
        ]);

        const signs = (signsRes.items || []).map((item: any) => ({ ...item, type: 'sign', label: item.name }));
        const culture = (cultureRes.items || []).map((item: any) => ({
            ...item,
            type: item.organism ? 'organism' : 'person',
            label: item.organism ? item.name : [item.firstname, item.name].filter(Boolean).join(' '),
        }));
        const lexical = (lexicalRes.items || []).map((item: any) => ({ ...item, type: 'lexical_field', label: item.name }));
        const lexicalTerms = (lexicalTermsRes.items || [])
            .filter((item: any) => item.expand?.LexicalField)
            .map((item: any) => ({
                ...item.expand.LexicalField,
                type: 'lexical_field',
                label: item.term,
                definition: `dans : ${item.expand.LexicalField.name}`,
            }));
        const french = (frenchRes.items || []).map((item: any) => ({ ...item, type: 'french_expression', label: item.expression }));
        const piDeaf = (piDeafRes.items || []).map((item: any) => ({ ...item, type: 'pi_deaf_expression', label: item.name }));

        suggestions.value = [...signs, ...culture, ...lexical, ...lexicalTerms, ...french, ...piDeaf].sort((a: any, b: any) => a.label.localeCompare(b.label));
    } catch (err) {
        console.error('Search error', err);
        suggestions.value = [];
    } finally {
        loading.value = false;
    }
};

const onSelect = (event: any) => {
    const selected = event.value;
    if (!selected?.slug) return;
    const routes: Record<string, string> = {
        sign: '/signs',
        organism: '/persons',
        person: '/persons',
        lexical_field: '/outils/champs-lexicaux',
        french_expression: '/outils/expressions-francaises',
        pi_deaf_expression: '/outils/expressions-pi-sourdes',
    };
    const base = routes[selected.type] || '/signs';
    window.location.href = `${base}/${selected.slug}`;
};

const badgeClass = (type: string) => {
    const classes: Record<string, string> = {
        sign: 'badge-primary',
        organism: 'badge-info',
        person: 'badge-accent',
        lexical_field: 'badge-warning',
        french_expression: 'badge-success',
        pi_deaf_expression: 'badge-secondary',
    };
    return classes[type] ?? 'badge-ghost';
};

const badgeLabel = (type: string) => {
    const labels: Record<string, string> = {
        sign: 'Signe',
        organism: 'Organisme',
        person: 'Personne',
        lexical_field: 'Champ lexical',
        french_expression: 'Expr. française',
        pi_deaf_expression: 'Expr. pi-sourde',
    };
    return labels[type] ?? type;
};
</script>
