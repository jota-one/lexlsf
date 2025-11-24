<template>
    <div class="space-y-4">
        <div class="flex items-center gap-4">
            <label for="orientation" class="font-semibold w-40">Orientation</label>
            <template v-for="(child, index) in orientationOptions" :key="index">
                <input type="radio" v-model="form.orientation" :id="`orientation-${uniqueId}-${index}`" :value="child.value"
                    class="sr-only" />
                <label :for="`orientation-${uniqueId}-${index}`" class="cursor-pointer flex flex-col items-center">
                    <img :src="`/img/orientations/${child.value}.jpg`" :alt="child.label"
                        class="w-12 h-12 object-contain mb-1"
                        :class="form.orientation === child.value ? 'border-2 border-primary' : 'border border-base-300'"
                        style="border-radius: 0.5rem;" />
                    <span class="text-xs">{{ child.label }}</span>
                </label>
            </template>
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
            <label for="precision" class="font-semibold w-40">Explications complémentaires</label>
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
import { getCurrentInstance } from 'vue';

const form = defineModel<any>({ required: true });

const instance = getCurrentInstance();
const uniqueId = instance ? instance.uid : Math.random().toString(36).slice(2, 10);

const orientationOptions = [
    { label: 'Haut dos', value: 'top' },
    { label: 'Haut 3/4', value: 'top-45deg' },
    { label: 'Haut paume', value: 'top-front' },
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
