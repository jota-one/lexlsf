<script setup lang="ts">
import type { QuizMode } from '@admin/config/quizModes'

type Props = {
  mode: QuizMode
  card: any
  getFileUrl: (collection: string, id: string, filename: string) => string
  isFlipped: boolean
}

const props = defineProps<Props>()

const renderFieldValue = (field: string | undefined) => {
  if (!field || !props.card?.itemData) return ''
  return props.card.itemData[field] ?? ''
}

const mediaUrl = (fieldKey: string) => {
  const file = props.card?.itemData?.[fieldKey]
  if (!file) return ''
  return props.getFileUrl(props.mode.itemType === 'sign' ? 'sign' : 'person', props.card.itemId, file)
}
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <!-- Question (toujours visible) -->
    <div class="card bg-base-100 shadow-lg flex flex-col">
      <div class="card-body min-h-[330px]">
        <h3 class="card-title text-base text-base-content/50 uppercase tracking-wide">Question</h3>
        <div class="flex-1 flex flex-col justify-center gap-3">
          <div v-for="field in mode.faceA" :key="field.key">
            <template v-if="field.type === 'video'">
              <video
                v-if="mediaUrl(field.key)"
                :src="mediaUrl(field.key)"
                controls
                autoplay
                muted
                class="w-full rounded aspect-video object-contain"
              />
              <p v-else class="text-base-content/50 text-sm">Aucune vidéo</p>
            </template>

            <template v-else-if="field.type === 'file'">
              <img
                v-if="mediaUrl(field.key)"
                :src="mediaUrl(field.key)"
                class="w-full rounded object-contain max-h-64"
              />
              <p v-else class="text-base-content/50 text-sm">Aucun média</p>
            </template>

            <template v-else-if="field.type === 'text'">
              <p class="text-3xl font-bold">{{ renderFieldValue(field.key) }}</p>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Réponse (révélée au flip) -->
    <div
      class="card shadow-lg flex flex-col transition-all duration-300"
      :class="isFlipped ? 'bg-base-100' : 'bg-base-200'"
    >
      <div class="card-body min-h-[330px]">
        <h3 class="card-title text-base uppercase tracking-wide" :class="isFlipped ? 'text-base-content/50' : 'text-base-content/20'">Réponse</h3>
        <div class="flex-1 flex flex-col justify-center gap-3">
          <template v-if="isFlipped">
            <div v-for="field in mode.faceB" :key="field.key">
              <template v-if="field.type === 'video'">
                <video
                  v-if="mediaUrl(field.key)"
                  :src="mediaUrl(field.key)"
                  controls
                  autoplay
                  muted
                  class="w-full rounded aspect-video object-contain"
                />
                <p v-else class="text-base-content/50 text-sm">Aucune vidéo</p>
              </template>

              <template v-else-if="field.type === 'file'">
                <img
                  v-if="mediaUrl(field.key)"
                  :src="mediaUrl(field.key)"
                  class="w-full rounded object-contain max-h-64"
                />
                <p v-else class="text-base-content/50 text-sm">Aucun média</p>
              </template>

              <template v-else-if="field.type === 'text'">
                <p class="text-3xl font-bold">{{ renderFieldValue(field.key) }}</p>
              </template>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
