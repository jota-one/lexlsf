<template>
    <Dialog v-model:visible="visible" modal header="Ajouter un mouvement de main" class="w-[60%]">
        <form @submit.prevent="save" class="space-y-4">
            <!-- Type de main -->
            <div class="flex items-center gap-4">
                <label for="hand_type" class="font-semibold w-40">Type de main</label>
                <Select v-model="form.hand_type" :options="handTypeOptions" id="hand_type" class="w-full"
                    placeholder="Sélectionner" optionLabel="label" optionValue="value" required />
            </div>
            <!-- Mouvement de chemin présent -->
            <div class="flex items-center gap-4">
                <label for="path_movement_present" class="font-semibold w-40">Mouvement de chemin</label>
                <Checkbox v-model="form.path_movement_present" id="path_movement_present" :binary="true" />
            </div>
            <!-- Direction -->
            <div class="flex items-center gap-4">
                <label for="direction" class="font-semibold w-40">Direction</label>
                <Select v-model="form.direction" :options="directionOptions" id="direction" class="w-full"
                    placeholder="Sélectionner" optionLabel="label" optionValue="value" />
            </div>
            <!-- Trajectoire -->
            <div class="flex items-center gap-4">
                <label for="trajectory" class="font-semibold w-40">Trajectoire</label>
                <Select v-model="form.trajectory" :options="trajectoryOptions" id="trajectory" class="w-full"
                    placeholder="Sélectionner" optionLabel="label" optionValue="value" />
            </div>
            <!-- Amplitude -->
            <div class="flex items-center gap-4">
                <label for="amplitude" class="font-semibold w-40">Amplitude</label>
                <Select v-model="form.amplitude" :options="amplitudeOptions" id="amplitude" class="w-full"
                    placeholder="Sélectionner" optionLabel="label" optionValue="value" />
            </div>
            <!-- Vitesse -->
            <div class="flex items-center gap-4">
                <label for="speed" class="font-semibold w-40">Vitesse</label>
                <Select v-model="form.speed" :options="speedOptions" id="speed" class="w-full"
                    placeholder="Sélectionner" optionLabel="label" optionValue="value" />
            </div>
            <!-- Répétitions -->
            <div class="flex items-center gap-4">
                <label for="repetitions" class="font-semibold w-40">Répétitions</label>
                <InputNumber v-model="form.repetitions" id="repetitions" class="w-full" :min="1" :max="20" />
            </div>
            <!-- Mouvement interne présent -->
            <div class="flex items-center gap-4">
                <label for="internal_movement_present" class="font-semibold w-40">Mouvement interne</label>
                <Checkbox v-model="form.internal_movement_present" id="internal_movement_present" :binary="true" />
            </div>
            <!-- Type de mouvement interne -->
            <div class="flex items-center gap-4">
                <label for="internal_movement_type" class="font-semibold w-40">Type mouvement interne</label>
                <Select v-model="form.internal_movement_type" :options="internalMovementTypeOptions"
                    id="internal_movement_type" class="w-full" placeholder="Sélectionner" optionLabel="label"
                    optionValue="value" />
            </div>
            <!-- Détails mouvement interne -->
            <div class="flex items-center gap-4">
                <label for="internal_movement_details" class="font-semibold w-40">Détails mouvement interne</label>
                <InputText v-model="form.internal_movement_details" id="internal_movement_details" class="w-full" />
            </div>
            <!-- Mouvement fluide -->
            <div class="flex items-center gap-4">
                <label for="smooth" class="font-semibold w-40">Fluide</label>
                <Checkbox v-model="form.smooth" id="smooth" :binary="true" />
            </div>
            <!-- Mouvement tendu -->
            <div class="flex items-center gap-4">
                <label for="tense" class="font-semibold w-40">Tendu</label>
                <Checkbox v-model="form.tense" id="tense" :binary="true" />
            </div>
            <!-- Mouvement rythmique -->
            <div class="flex items-center gap-4">
                <label for="rhythmic" class="font-semibold w-40">Rythmique</label>
                <Checkbox v-model="form.rhythmic" id="rhythmic" :binary="true" />
            </div>
            <!-- Features mouvement (JSON) -->
            <div class="flex items-center gap-4">
                <label for="movement_features" class="font-semibold w-40">Features mouvement (JSON)</label>
                <Textarea v-model="form.movement_features" id="movement_features" class="w-full" rows="2"
                    placeholder='{"feature":"value"}' />
            </div>
            <div class="flex justify-end gap-2 pt-4">
                <Button type="button" label="Annuler" severity="secondary" @click="visible = false"></Button>
                <Button type="submit" label="Enregistrer"></Button>
            </div>
        </form>
    </Dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

const visible = defineModel<boolean>({ required: true });

const handTypeOptions = [
    { label: 'Dominante', value: 'dominant' },
    { label: 'Non-dominante', value: 'non_dominant' }
];

const directionOptions = [
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Vertical', value: 'vertical' },
    { label: 'Circulaire', value: 'circular' },
    { label: 'Zigzag', value: 'zigzag' },
    { label: 'Arc', value: 'arc' },
    { label: 'Diagonale', value: 'diagonal' }
];

const trajectoryOptions = [
    { label: 'Droite', value: 'straight' },
    { label: 'Courbe', value: 'curved' },
    { label: 'Circulaire', value: 'circular' },
    { label: 'Aller-retour', value: 'back_and_forth' },
    { label: 'Spirale', value: 'spiral' }
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

const internalMovementTypeOptions = [
    { label: 'Agitation des doigts', value: 'finger_wiggling' },
    { label: 'Rotation du poignet', value: 'wrist_rotation' },
    { label: 'Ouverture/Fermeture', value: 'opening_closing' },
    { label: 'Flexion/Extension', value: 'bending_straightening' }
];

const form = ref({
    hand_type: '',
    path_movement_present: false,
    direction: '',
    trajectory: '',
    amplitude: '',
    speed: '',
    repetitions: null,
    internal_movement_present: false,
    internal_movement_type: '',
    internal_movement_details: '',
    smooth: false,
    tense: false,
    rhythmic: false,
    movement_features: ''
});

const save = () => {
    let parsedForm: any = { ...form.value };
    try {
        parsedForm.movement_features = form.value.movement_features
            ? JSON.parse(form.value.movement_features)
            : null;
    } catch { }
    // Logic to save the hand movement
    console.log('Saving hand movement:', parsedForm);
    visible.value = false;
};
</script>
