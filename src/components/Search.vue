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
        <div class="flex items-start gap-2">
          <span
            class="badge badge-sm mt-1"
            :class="slotProps.option.type === 'sign' ? 'badge-primary' : (slotProps.option.type === 'organism' ? 'badge-info' : 'badge-accent')"
          >
            {{ slotProps.option.type === 'sign' ? 'Signe' : (slotProps.option.type === 'organism' ? 'Organisme' : 'Personne') }}
          </span>
          <div class="flex-1">
            <div class="font-medium">{{ slotProps.option.label }}</div>
            <div class="text-sm opacity-75">{{ slotProps.option.definition }}</div>
          </div>
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

        // Recherche dans les signes
        const signsPromise = pb.collection('sign').getList(1, 10, {
            filter: signFilter,
            fields: 'id,name,definition,slug',
            sort: 'name',
        });

        // Recherche dans les personnes (culture)
        const culturePromise = pb.collection('person').getList(1, 10, {
          filter: cultureFilter,
          fields: 'id,name,firstname,organism,definition,slug',
          sort: 'name,firstname',
        });

        const [signsRes, cultureRes] = await Promise.all([signsPromise, culturePromise]);

        // Combiner les résultats avec un type
        const signs = (signsRes.items || []).map((item: any) => ({
          ...item,
          type: 'sign',
          label: item.name,
        }));
        const culture = (cultureRes.items || []).map((item: any) => ({
          ...item,
          type: item.organism ? 'organism' : 'person',
          label: item.organism ? item.name : [item.firstname, item.name].filter(Boolean).join(' '),
        }));

        suggestions.value = [...signs, ...culture].sort((a: any, b: any) => a.label.localeCompare(b.label));
    } catch (err) {
        console.error('Search error', err);
        suggestions.value = [];
    } finally {
        loading.value = false;
    }
};

const onSelect = (event: any) => {
    const selected = event.value;
    if (selected && selected.slug) {
        const basePath = selected.type === 'sign' ? '/signs' : '/persons';
        window.location.href = `${basePath}/${selected.slug}`;
    }
};
</script>
