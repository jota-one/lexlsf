<template>
    <form class="space-y-4">
        <!-- Nom -->
        <div class="flex items-center gap-4">
            <label for="name" class="font-semibold w-40">Nom</label>
            <InputText v-model="form.name" id="name" class="w-full" required />
        </div>
        <!-- Illustration -->
        <div class="flex items-center gap-4">
            <label for="illustration" class="font-semibold w-40">Illustration</label>
            <input type="file" id="illustration" class="file-input file-input-bordered w-full" @change="onFileChange" />
        </div>
    </form>
</template>
<script setup lang="ts">
import InputText from 'primevue/inputtext';

const form = defineModel<any>({ required: true });

const onFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    form.value.illustration = target.files && target.files.length > 0 ? target.files[0] : null;
};
</script>
