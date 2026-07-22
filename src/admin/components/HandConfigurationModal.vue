<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="configurationId ? 'Modifier une configuration de main' : 'Ajouter une configuration de main'"
    class="w-[60%]"
  >
    <HandConfigurationForm v-model="form" />
    <!-- Toast container for PocketBase errors -->
    <PbErrorToast />
    <div class="flex justify-end gap-2 pt-4">
      <Button type="button" label="Annuler" severity="secondary" @click="visible = false"></Button>
      <Button type="button" label="Enregistrer" :loading="saving" @click="save"></Button>
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import useHandConfigurations from '../composables/useHandConfigurations';
import HandConfigurationForm from './HandConfigurationForm.vue';
import PbErrorToast from './PbErrorToast.vue';
import usePbErrorToast from '../composables/usePbErrorToast';

type Props = {
    // undefined = create mode
    configurationId?: string
}
type Events = {
    saved: []
};

const props = defineProps<Props>();
const emit = defineEmits<Events>();
const visible = defineModel<boolean>({ required: true });

const { addHandConfiguration, updateHandConfiguration, loadHandConfiguration } = useHandConfigurations();
const saving = ref(false)
const { showPbError } = usePbErrorToast();

const emptyForm = () => ({
    name: '',
    illustration: null as File | null
});

const form = ref(emptyForm());

const save = async () => {
    saving.value = true;
    try {
        if (props.configurationId) {
            await updateHandConfiguration(props.configurationId, form.value);
        } else {
            await addHandConfiguration(form.value);
        }
        emit('saved');
        visible.value = false;
    } catch (err) {
        // show formatted PocketBase error(s)
        showPbError(err);
    } finally {
        saving.value = false;
    }
};

watch(visible, async (isVisible) => {
    if (!isVisible) {
        return;
    }
    if (!props.configurationId) {
        // Reset form when modal is opened in create mode
        form.value = emptyForm();
        return;
    }
    // Load the existing configuration data when modal opens
    const handConfiguration = await loadHandConfiguration(props.configurationId);
    form.value = {
        name: handConfiguration.name,
        illustration: handConfiguration.illustration || null
    };
}, { immediate: true });
</script>
