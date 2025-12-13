<template>
  <div class="face-zones-overlay" ref="container">
    <img :src="imageSrc" class="face-image" alt="face diagram" @load="onImageLoad" />
    <svg
      v-if="imageLoaded"
      class="overlay"
      :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`"
      preserveAspectRatio="xMidYMid meet"
      @click.stop
    >
      <defs>
        <linearGradient id="hand-mix" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" :stop-color="props.colorLeft" />
          <stop offset="100%" :stop-color="props.colorRight" />
        </linearGradient>
      </defs>
      <g>
        <template v-for="zone in zones" :key="zone.id">
          <ellipse
            :cx="zone.cx"
            :cy="zone.cy"
            :rx="zone.rx"
            :ry="zone.ry"
            :transform="transformFor(zone)"
            :fill="fillFor(zone.id)"
            :stroke="strokeFor(zone.id)"
            stroke-width="1.2"
            :style="{ cursor: interactive ? 'pointer' : 'default', opacity: zoneOpacity(zone.id) }"
            @click.stop="toggleZone(zone.id)"
          />
          <text
            v-if="isSelected(zone.id)"
            :x="zone.cx"
            :y="zone.cy"
            text-anchor="middle"
            alignment-baseline="central"
            font-size="7"
            font-weight="bold"
            fill="#fff"
            pointer-events="none"
          >
            {{ selectionOrder(zone.id) }}
          </text>
        </template>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
// Helper: is zone selected by at least one hand
function isSelected(id: string) {
    return activeLocalRight.value.includes(id) || activeLocalLeft.value.includes(id);
}

// Helper: get order string for zone (ex: "1", "2", "1/2")
function selectionOrder(id: string) {
    const rightIdx = activeLocalRight.value.indexOf(id);
    const leftIdx = activeLocalLeft.value.indexOf(id);
    const right = rightIdx !== -1 ? (rightIdx + 1).toString() : '';
    const left = leftIdx !== -1 ? (leftIdx + 1).toString() : '';
    if (right && left) return `${right}/${left}`;
    return right || left;
}
import { computed, ref, watch } from 'vue';

const VIEW_W = 100;
const VIEW_H = 120;

type Props = {
    image: string;
    zones: Array<{ id: string; label: string; cx: number; cy: number; rx: number; ry: number; rotate: number }>;
    activeZonesRight: string[];
    activeZonesLeft: string[];
    interactive: boolean;
    colorRight: string;
    colorLeft: string;
    activeHand: 'right' | 'left';
}


const props = defineProps<Props>();
const emit = defineEmits(['update:activeZonesRight', 'update:activeZonesLeft', 'change']);

const container = ref<HTMLElement | null>(null);
const imageLoaded = ref(false);
const activeLocalRight = ref<string[]>(Array.isArray(props.activeZonesRight) ? [...props.activeZonesRight] : []);
const activeLocalLeft = ref<string[]>(Array.isArray(props.activeZonesLeft) ? [...props.activeZonesLeft] : []);

const imageSrc = computed(() => {
    if (props.image.startsWith('/')) {
        // Chemin public (Astro/public)
        return props.image;
    }
    // Asset local (SPA)
    return new URL(props.image, import.meta.url).href;
});

watch(() => props.activeZonesRight, (v) => {
    activeLocalRight.value = [...(v || [])];
});
watch(() => props.activeZonesLeft, (v) => {
    activeLocalLeft.value = [...(v || [])];
});

function onImageLoad() { imageLoaded.value = true; }

function transformFor(zone: any) {
    if (!zone.rotate || zone.rotate === 0) return undefined;
    // rotate(angle cx cy)
    return `rotate(${zone.rotate} ${zone.cx} ${zone.cy})`;
}


function fillFor(id: string) {
    const right = activeLocalRight.value.includes(id);
    const left = activeLocalLeft.value.includes(id);
    if (right && left) {
        // Use SVG gradient for both hands
        return 'url(#hand-mix)';
    } else if (right) {
        return props.colorRight;
    } else if (left) {
        return props.colorLeft;
    }
    return 'transparent';
}
function strokeFor(id: string) {
    const right = activeLocalRight.value.includes(id);
    const left = activeLocalLeft.value.includes(id);
    if (right && left) {
        return 'url(#hand-mix)';
    } else if (right) {
        return props.colorRight;
    } else if (left) {
        return props.colorLeft;
    }
    return 'rgba(255,0,0,0.28)';
}
function zoneOpacity(id: string) {
    const right = activeLocalRight.value.includes(id);
    const left = activeLocalLeft.value.includes(id);
    if (right && left) return 0.95;
    if (right || left) return 0.85;
    return 0.6;
}


function toggleZone(id: string) {
    if (!props.interactive) return;
    if (props.activeHand === 'right') {
        const rightSelected = activeLocalRight.value.includes(id);
        if (rightSelected) {
            activeLocalRight.value = activeLocalRight.value.filter(z => z !== id);
        } else {
            activeLocalRight.value = [...activeLocalRight.value, id];
        }
        emit('update:activeZonesRight', activeLocalRight.value);
    } else if (props.activeHand === 'left') {
        const leftSelected = activeLocalLeft.value.includes(id);
        if (leftSelected) {
            activeLocalLeft.value = activeLocalLeft.value.filter(z => z !== id);
        } else {
            activeLocalLeft.value = [...activeLocalLeft.value, id];
        }
        emit('update:activeZonesLeft', activeLocalLeft.value);
    }
    emit('change', { right: activeLocalRight.value, left: activeLocalLeft.value });
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
