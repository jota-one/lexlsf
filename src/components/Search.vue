<template>
    <FloatLabel variant="in" class="flex items-center flex-1 pr-4 gap-2" :class="{ 'w-3/4 m-auto': mode === 'hero' }">
        <AutoComplete v-model="selectedSign" :suggestions="suggestions" @complete="onSearch" @item-select="onSelect"
            option-label="name" class="flex-1" fluid :loading="loading" :size="mode === 'hero' ? 'large' : 'small'">
            <template #option="slotProps">
                <div>
                    <div class="font-medium">{{ slotProps.option.name }}</div>
                    <div class="text-sm opacity-75">{{ slotProps.option.definition }}</div>
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
        const filter = `name~"${query}"`;
        const res = await pb.collection('sign').getList(1, 10, {
            filter,
            fields: 'id,name,definition,slug',
            sort: 'name',
        });

        suggestions.value = res.items || [];
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
        window.location.href = `/signs/${selected.slug}`;
    }
};
</script>