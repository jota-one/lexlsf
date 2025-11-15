<template>
    <ImageZonesOverlay :active-hand="activeHand" :image="bodySrc" :zones="zones" :activeZonesRight="rightZones"
        :activeZonesLeft="leftZones" :interactive="interactive" :colorRight="colorConfig.right"
        :colorLeft="colorConfig.left" @update:activeZonesRight="modelRightHand = $event"
        @update:activeZonesLeft="modelLeftHand = $event"
        @change="$emit('change', { right: rightZones, left: leftZones })" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Ui } from '../../types';
import ImageZonesOverlay from './ImageZonesOverlay.vue';

type Props = {
    activeHand: 'right' | 'left';
    interactive: boolean;
    colorConfig: Ui.ColorConfig;
    right?: string[];
    left?: string[];
}

const props = defineProps<Props>();
const emit = defineEmits(['update:activeZonesRight', 'update:activeZonesLeft', 'change']);

const modelRightHand = defineModel<string[]>('right');
const modelLeftHand = defineModel<string[]>('left');

const rightZones = computed(() => modelRightHand.value ?? props.right ?? []);
const leftZones = computed(() => modelLeftHand.value ?? props.left ?? []);

const bodySrc = '/img/places/body.png';

const zones = [
    { id: 'left_shoulder', label: 'Epaule G', cx: 29, cy: 11, rx: 7, ry: 5, rotate: -12 },
    { id: 'right_shoulder', label: 'Epaule D', cx: 62, cy: 11, rx: 6, ry: 5, rotate: 12 },
    { id: 'upper_breast_right', label: 'Haut Poitrine D', cx: 33, cy: 25, rx: 8, ry: 7, rotate: 0 },
    { id: 'upper_breast_left', label: 'Haut Poitrine G', cx: 59, cy: 25, rx: 7.5, ry: 7.5, rotate: 0 },
    { id: 'chest', label: 'Poitrine', cx: 47, cy: 36, rx: 5, ry: 10, rotate: 0 },
    { id: 'stomach_right', label: 'Ventre D', cx: 37, cy: 68, rx: 8, ry: 6, rotate: 0 },
    { id: 'stomach_left', label: 'Ventre G', cx: 58, cy: 68, rx: 8, ry: 6, rotate: 0 },
    { id: 'right_upper_arm', label: 'Bras D (haut)', cx: 17, cy: 50, rx: 5, ry: 18.5, rotate: 11 },
    { id: 'left_upper_arm', label: 'Bras G (haut)', cx: 77, cy: 47, rx: 5, ry: 17.5, rotate: -15 },
    { id: 'right_forearm', label: 'Avant-bras D', cx: 13, cy: 78, rx: 5, ry: 8, rotate: -6 },
    { id: 'left_forearm', label: 'Avant-bras G', cx: 84, cy: 76, rx: 5, ry: 8, rotate: 6 },
];
</script>
