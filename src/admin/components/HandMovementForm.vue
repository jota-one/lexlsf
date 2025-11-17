<template>
    <div class="space-y-4">
        <div class="flex items-center gap-4">
            <label for="orientation" class="font-semibold w-40">Orientation</label>
            <Select v-model="form.orientation" :options="directionOptions" id="orientation" class="w-full"
                placeholder="Sélectionner" optionLabel="label" optionValue="value" />
        </div>
        <div class="flex items-center gap-4">
            <label for="direction" class="font-semibold w-40">Direction</label>
            <Select v-model="form.direction" :options="directionOptions" id="direction" class="w-full"
                placeholder="Sélectionner" optionLabel="label" optionValue="value" />
        </div>
        <div class="flex items-center gap-4">
            <label for="amplitude" class="font-semibold w-40">Amplitude</label>
            <Select v-model="form.amplitude" :options="amplitudeOptions" id="amplitude" class="w-full"
                placeholder="Sélectionner" optionLabel="label" optionValue="value" />
        </div>
        <div class="flex items-center gap-4">
            <label for="speed" class="font-semibold w-40">Vitesse</label>
            <Select v-model="form.speed" :options="speedOptions" id="speed" class="w-full" placeholder="Sélectionner"
                optionLabel="label" optionValue="value" />
        </div>
        <div class="flex items-center gap-4">
            <label for="precision" class="font-semibold w-40">Précision</label>
            <Textarea v-model="form.precision" id="precision" class="w-full" required />
        </div>
        <div class="flex items-center gap-4">
            <label for="repetitions" class="font-semibold w-40">Répétitions</label>
            <InputNumber v-model="form.repetitions" id="repetitions" class="w-full" :min="1" :max="20" />
        </div>
    </div>
</template>
<script setup lang="ts">
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';

const form = defineModel<any>({ required: true });

const directionOptions = [
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Vertical', value: 'vertical' },
    { label: 'Circulaire', value: 'circular' },
    { label: 'Zigzag', value: 'zigzag' },
    { label: 'Arc', value: 'arc' },
    { label: 'Diagonale', value: 'diagonal' }
];

const amplitudeOptions = [
    { label: 'Petite', value: 'small' },
    { label: 'Moyenne', value: 'medium' },
    { label: 'Grande', value: 'large' }
];

const speedOptions = [
    { label: 'Lente', value: 'slow' },
    { label: 'Normale', value: 'normal' },
    { label: 'Rapide', value: 'fast' }
];
</script>
