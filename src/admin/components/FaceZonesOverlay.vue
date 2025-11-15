<template>
    <ImageZonesOverlay :active-hand="activeHand" :image="headSrc" :zones="zones" :activeZonesRight="modelRightHand"
        :activeZonesLeft="modelLeftHand" :interactive="interactive" :colorRight="colorConfig.right"
        :colorLeft="colorConfig.left" @update:activeZonesRight="modelRightHand = $event"
        @update:activeZonesLeft="modelLeftHand = $event"
        @change="$emit('change', { right: modelRightHand, left: modelLeftHand })" />
</template>

<script setup lang="ts">
import type { Ui } from '../../types';
import ImageZonesOverlay from './ImageZonesOverlay.vue';

type Props = {
    activeHand: 'right' | 'left';
    interactive: boolean;
    colorConfig: Ui.ColorConfig;
}

const headSrc = new URL('../../assets/img/places/head.png', import.meta.url).href;

defineProps<Props>();
const emit = defineEmits(['update:activeZonesRight', 'update:activeZonesLeft', 'change']);

const modelRightHand = defineModel<string[]>('right', { required: true });
const modelLeftHand = defineModel<string[]>('left', { required: true });

const zones = [
    { id: 'left_brow_area', label: 'Tempe G', cx: 32, cy: 38, rx: 3, ry: 7, rotate: 0 },
    { id: 'right_brow_area', label: 'Tempe D', cx: 70, cy: 35, rx: 3, ry: 8, rotate: 0 },
    { id: 'right_ear', label: 'Oreille D', cx: 24, cy: 55, rx: 8, ry: 14, rotate: 0 },
    { id: 'left_ear', label: 'Oreille G', cx: 77, cy: 55, rx: 7, ry: 13, rotate: 0 },
    { id: 'right_chick', label: 'Joue D', cx: 35, cy: 75, rx: 4, ry: 10, rotate: 0 },
    { id: 'left_chick', label: 'Joue G', cx: 68, cy: 75, rx: 5, ry: 10, rotate: 0 },
    { id: 'left_eye_area', label: 'Oeil G', cx: 40, cy: 52, rx: 5, ry: 9, rotate: 0 },
    { id: 'right_eye_area', label: 'Oeil D', cx: 63.5, cy: 52, rx: 4.5, ry: 9, rotate: 0 },
    { id: 'forehead', label: 'Front', cx: 49, cy: 27, rx: 14, ry: 7, rotate: -10 },
    { id: 'nose', label: 'Nez', cx: 52, cy: 64, rx: 7, ry: 6, rotate: 0 },
    { id: 'mouth', label: 'Bouche', cx: 52, cy: 78, rx: 9, ry: 5, rotate: 0 },
    { id: 'chin', label: 'Menton', cx: 52, cy: 89, rx: 10, ry: 4, rotate: 0 }
];
</script>