<template>
    <div class="face-zones-overlay" ref="container">
        <img :src="faceSrc" class="face-image" alt="face diagram" @load="onImageLoad" />
        <svg v-if="imageLoaded" class="overlay" :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`" preserveAspectRatio="xMidYMid meet"
            @click.stop>
            <g>
                <template v-for="zone in zones" :key="zone.id">
                    <ellipse :cx="zone.cx" :cy="zone.cy" :rx="zone.rx" :ry="zone.ry" :transform="transformFor(zone)"
                        :fill="fillFor(zone.id)" :stroke="strokeFor(zone.id)" stroke-width="1.2"
                        :style="{ cursor: interactive ? 'pointer' : 'default' }" @click.stop="toggleZone(zone.id)" />
                </template>
            </g>
        </svg>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const VIEW_W = 100;
const VIEW_H = 120;

type Props = {
    image: string;
    zones: Array<{ id: string; label: string; cx: number; cy: number; rx: number; ry: number; rotate: number }>;
    activeZones: string[];
    interactive: boolean;
    color: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:activeZones', 'change']);

const container = ref<HTMLElement | null>(null);
const imageLoaded = ref(false);
const activeLocal = ref<string[]>([...props.activeZones]);

const faceSrc = computed(() => new URL(props.image, import.meta.url).href)

watch(() => props.activeZones, (v) => {
    activeLocal.value = [...(v || [])];
});

function onImageLoad() { imageLoaded.value = true; }

function transformFor(zone: any) {
    if (!zone.rotate || zone.rotate === 0) return undefined;
    // rotate(angle cx cy)
    return `rotate(${zone.rotate} ${zone.cx} ${zone.cy})`;
}

function fillFor(id: string) {
    const idx = activeLocal.value.indexOf(id);
    if (idx === -1) return 'transparent';
    return props.color;
}
function strokeFor(id: string) {
    const idx = activeLocal.value.indexOf(id);
    if (idx === -1) return 'rgba(255,0,0,0.28)';
    // use the single color prop for active stroke
    return props.color;
}

function toggleZone(id: string) {
    if (!props.interactive) return;
    const pos = activeLocal.value.indexOf(id);
    if (pos !== -1) {
        activeLocal.value.splice(pos, 1);
    } else {
        // allow unlimited selections — just add
        activeLocal.value.push(id);
    }
    activeLocal.value = [...activeLocal.value];
    emit('update:activeZones', activeLocal.value);
    emit('change', activeLocal.value);
}
</script>

<style scoped>
.face-zones-overlay {
    position: relative;
    width: 100%;
    max-width: 200px;
    user-select: none;
}

.face-image {
    max-width: 100%;
    max-height: 100%;
    display: block;
}

.overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.overlay ellipse {
    pointer-events: auto;
    transition: fill 150ms ease, stroke 150ms ease, opacity 150ms;
    opacity: 0.95;
}
</style>