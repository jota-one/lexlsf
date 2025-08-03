<template>
    <Dialog v-model:visible="visible" modal header="Ajouter un signe" class="w-[60%]">
        <form @submit.prevent="save" class="space-y-4">
            <div class="flex items-center gap-4">
                <label for="video" class="font-semibold w-40">Vidéo</label>
                <input type="file" id="video" class="file-input file-input-bordered w-full" @change="onFileChange" />
            </div>
            <!-- Gloss -->
            <div class="flex items-center gap-4">
                <label for="name" class="font-semibold w-40">Terme</label>
                <InputText v-model="form.name" id="name" class="w-full" required />
            </div>
            <!-- Statut de vérification -->
            <div class="flex items-center gap-4">
                <label for="verification_status" class="font-semibold w-40">Statut</label>
                <Dropdown v-model="form.verification_status" :options="verificationStatusOptions"
                    id="verification_status" class="w-full" placeholder="Sélectionner" optionLabel="label"
                    optionValue="value" required />
            </div>
            <!-- Niveau -->
            <div class="flex items-center gap-4">
                <label for="verification_status" class="font-semibold w-40">Niveau</label>
                <Rating v-model="form.level" /> ({{ levelLabel }})
            </div>
            <!-- Right hand configuration -->
            <div class="flex items-center gap-4">
                <label for="dominant_hand_config" class="font-semibold w-40">Config main droite</label>
                <Dropdown v-model="form.ConfigurationRight" :options="handConfigOptions" id="dominant_hand_config"
                    class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value"
                    :loading="loadingHandConfigurations" required />
            </div>
            <!-- Left hand configuration -->
            <div class="flex items-center gap-4">
                <label for="non_dominant_hand_config" class="font-semibold w-40">Config main gauche</label>
                <Dropdown v-model="form.ConfigurationLeft" :options="handConfigOptions" id="non_dominant_hand_config"
                    class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value"
                    :loading="loadingHandConfigurations" />
            </div>
            <!-- Right hand location -->
            <div class="flex items-center gap-4">
                <label for="dominant_hand_location" class="font-semibold w-40">Placement main droite</label>
                <Dropdown v-model="form.location_right" :options="handLocationOptions" id="dominant_hand_location"
                    class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value" required />
            </div>
            <!-- Non-dominant hand location -->
            <div class="flex items-center gap-4">
                <label for="non_dominant_hand_location" class="font-semibold w-40">Placement main
                    gauche</label>
                <Dropdown v-model="form.location_left" :options="handLocationOptions" id="non_dominant_hand_location"
                    class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value" />
            </div>
            <!-- Dominant hand movement -->
            <div class="flex items-center gap-4">
                <label for="dominant_hand_movement" class="font-semibold w-40">Mouvement main droite</label>
                <Dropdown v-model="form.dominant_hand_movement" :options="dominantHandMovementOptions"
                    id="dominant_hand_movement" class="w-full" placeholder="Sélectionner" optionLabel="label"
                    optionValue="value" :loading="loadingHandMovements" required />
            </div>
            <!-- Non-dominant hand movement -->
            <div class="flex items-center gap-4">
                <label for="non_dominant_hand_movement" class="font-semibold w-40">Mouvement main gauche</label>
                <Dropdown v-model="form.non_dominant_hand_movement" :options="nonDominantHandMovementOptions"
                    id="non_dominant_hand_movement" class="w-full" placeholder="Sélectionner" optionLabel="label"
                    optionValue="value" :loading="loadingHandMovements" />
            </div>
            <!-- Coordination des mains -->
            <div class="flex items-center gap-4">
                <label for="hand_coordination" class="font-semibold w-40">Coordination des mains</label>
                <Dropdown v-model="form.hand_coordination" :options="handCoordinationOptions" id="hand_coordination"
                    class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value" required />
            </div>
            <!-- Source d'apprentissage -->
            <div class="flex items-center gap-4">
                <label for="learning_source" class="font-semibold w-40">Source d'apprentissage</label>
                <Dropdown v-model="form.learning_source" :options="learningSourceOptions" id="learning_source"
                    class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value" required />
            </div>
            <div class="flex items-center gap-4">
                <label for="learning_source_detail" class="font-semibold w-40">Personne en particulier</label>
                <InputText v-model="form.learning_source_detail" id="learning_source_detail" class="w-full" required />
            </div>
            <!-- Langue principale -->
            <div class="flex items-center gap-4">
                <label for="primary_language" class="font-semibold w-40">Langue principale</label>
                <Dropdown v-model="form.primary_language" :options="primaryLanguageOptions" id="primary_language"
                    class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value" required />
            </div>
            <div class="flex justify-end gap-2 pt-4">
                <Button type="button" label="Annuler" severity="secondary" @click="visible = false"></Button>
                <Button type="submit" label="Enregistrer"></Button>
            </div>
        </form>
    </Dialog>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import useHandConfigurations from '../composables/useHandConfigurations';
import useHandLocations from '../composables/useHandLocations';
import useHandMovements from '../composables/useHandMovements';
import useSigns from '../composables/useSigns';

type Events = {
    saved: []
};
const emit = defineEmits<Events>();

const visible = defineModel<boolean>({ required: true });

// Static options
const handCoordinationOptions = [
    { label: 'Main droite', value: 'one_handed_dominant' },
    { label: 'Main gauche', value: 'one_handed_non_dominant' },
    { label: 'Deux mains synchrones', value: 'two_handed_synchronous' },
    { label: 'Deux mains alternées', value: 'two_handed_alternating' },
    { label: 'Deux mains séquentielles', value: 'two_handed_sequential' }
];

// --- Use composables for relations ---
const {
    handConfigurations,
    loadingHandConfigurations,
    loadHandConfigurations
} = useHandConfigurations();

const {
    handLocationOptions,
} = useHandLocations();
const {
    handMovements,
    loadingHandMovements,
    loadHandMovements
} = useHandMovements();

const { addSign, learningSourceOptions, primaryLanguageOptions, verificationStatusOptions } = useSigns();

// Filtered options for dominant/non-dominant
const handConfigOptions = computed(() =>
    handConfigurations.value
        .map((c: any) => ({
            label: c.name,
            value: c.id
        }))
);

const dominantHandMovementOptions = computed(() =>
    handMovements.value
        .filter((m: any) => m.hand_type === 'dominant')
        .map((m: any) => ({
            label: `${m.hand_type} - ${m.direction || '—'}`,
            value: m.id
        }))
);
const nonDominantHandMovementOptions = computed(() =>
    handMovements.value
        .filter((m: any) => m.hand_type === 'non_dominant')
        .map((m: any) => ({
            label: `${m.hand_type} - ${m.direction || '—'}`,
            value: m.id
        }))
);

onMounted(() => {
    loadHandConfigurations();
    loadHandMovements();
});

const levelLabel = computed(() => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    return levels[form.value.level - 1] || '';
});

const form = ref({
    video: null as File | null,
    name: '',
    level: 1,
    verification_status: '',
    ConfigurationRight: null,
    ConfigurationLeft: null,
    location_right: null,
    location_left: null,
    dominant_hand_movement: null,
    non_dominant_hand_movement: null,
    hand_coordination: '',
    learning_source: '',
    learning_source_detail: '',
    primary_language: 'LSF',
});

const onFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    form.value.video = target.files && target.files.length > 0 ? target.files[0] : null;
};

const save = async () => {
    await addSign(form.value);
    emit('saved');
    visible.value = false;
};
</script>
