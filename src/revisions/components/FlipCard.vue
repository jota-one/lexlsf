<script setup lang="ts">
import { VueFlip } from 'vue-flip'
import type { QuizMode, QuizModeField } from '@admin/config/quizModes'

type Props = {
  mode: QuizMode
  card: any
  getFileUrl: (collection: string, id: string, filename: string) => string
  isFlipped: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  flip: [flipped: boolean]
}>()

const renderFieldValue = (field: string | undefined) => {
  if (!field || !props.card?.itemData) return ''
  return props.card.itemData[field] ?? ''
}

const renderRelationLabel = (key: string) => {
  const rel = props.card?.itemData?.expand?.[key]
  if (!rel) return ''
  if (Array.isArray(rel)) {
    return rel.map((r: any) => r.label || r.name || r.tag || r.id).filter(Boolean).join(', ')
  }
  return rel.label || rel.name || rel.tag || ''
}

const mediaUrl = (fieldKey: string) => {
  const file = props.card?.itemData?.[fieldKey]
  if (!file) return ''
  return props.getFileUrl(props.mode.itemType === 'sign' ? 'sign' : 'person', props.card.itemId, file)
}

const usesSplitLayout = (fields: QuizModeField[]) => {
  return fields.some(f => f.type === 'video') && fields.some(f => f.type !== 'video')
}

const hasVideo = (fields: QuizModeField[]) => {
  return fields.some(f => f.type === 'video')
}

const videoFields = (fields: QuizModeField[]) => fields.filter(f => f.type === 'video')
const otherFields = (fields: QuizModeField[]) => fields.filter(f => f.type !== 'video')

const handleFlip = (flipped: boolean) => {
  emit('flip', flipped)
}
</script>

<template>
  <VueFlip
    :active-click="true"
    class="w-full"
    width="100%"
    height="300px"
    :model-value="isFlipped"
    @update:model-value="handleFlip"
  >
    <template #front>
      <div class="card bg-base-100 shadow-lg flex flex-col min-h-1/2">
        <div class="card-body overflow-y-auto">
          <h3 class="card-title text-lg">Question</h3>
          <div v-if="usesSplitLayout(mode.faceA)" class="grid gap-4 md:grid-cols-2 md:items-start">
            <div class="space-y-4">
              <div v-for="field in videoFields(mode.faceA)" :key="field.key" class="space-y-2">
                <p class="text-sm font-semibold text-base-content/70">{{ field.label || field.key }}</p>
                <video
                  v-if="mediaUrl(field.key)"
                  :src="mediaUrl(field.key)"
                  controls
                  class="w-full rounded aspect-video object-contain"
                />
                <p v-else class="text-base-content/50 text-sm">Aucune vidéo</p>
              </div>
            </div>
            <div class="space-y-4">
              <div v-for="field in otherFields(mode.faceA)" :key="field.key" class="space-y-2">
                <p class="text-sm font-semibold text-base-content/70">{{ field.label || field.key }}</p>

                <template v-if="field.type === 'text'">
                  <p class="text-lg">{{ renderFieldValue(field.key) }}</p>
                </template>

                <template v-else-if="field.type === 'file'">
                  <img v-if="mediaUrl(field.key)" :src="mediaUrl(field.key)" class="w-full rounded" />
                  <p v-else class="text-base-content/50 text-sm">Aucun média</p>
                </template>

                <template v-else-if="field.type === 'relation'">
                  <p class="text-base-content/80">{{ renderRelationLabel(field.key) }}</p>
                </template>
              </div>
            </div>
          </div>
          <div v-else-if="hasVideo(mode.faceA)" class="grid gap-4 md:grid-cols-2 md:items-start">
            <div class="space-y-4">
              <div v-for="field in videoFields(mode.faceA)" :key="field.key" class="space-y-2">
                <p class="text-sm font-semibold text-base-content/70">{{ field.label || field.key }}</p>
                <video
                  v-if="mediaUrl(field.key)"
                  :src="mediaUrl(field.key)"
                  controls
                  class="w-full rounded aspect-video object-contain"
                />
                <p v-else class="text-base-content/50 text-sm">Aucune vidéo</p>
              </div>
            </div>
          </div>
          <div v-else class="space-y-4">
            <div v-for="field in mode.faceA" :key="field.key" class="space-y-2">
              <p class="text-sm font-semibold text-base-content/70">{{ field.label || field.key }}</p>

              <template v-if="field.type === 'text'">
                <p class="text-lg">{{ renderFieldValue(field.key) }}</p>
              </template>

              <template v-else-if="field.type === 'file'">
                <img v-if="mediaUrl(field.key)" :src="mediaUrl(field.key)" class="w-full rounded" />
                <p v-else class="text-base-content/50 text-sm">Aucun média</p>
              </template>

              <template v-else-if="field.type === 'relation'">
                <p class="text-base-content/80">{{ renderRelationLabel(field.key) }}</p>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #back>
      <div class="card bg-base-100 shadow-lg flex flex-col min-h-1/2">
        <div class="card-body overflow-y-auto">
          <h3 class="card-title text-lg">Réponse</h3>
          <div v-if="usesSplitLayout(mode.faceB)" class="grid gap-4 md:grid-cols-2 md:items-start">
            <div class="space-y-4">
              <div v-for="field in videoFields(mode.faceB)" :key="field.key" class="space-y-2">
                <p class="text-sm font-semibold text-base-content/70">{{ field.label || field.key }}</p>
                <video
                  v-if="mediaUrl(field.key)"
                  :src="mediaUrl(field.key)"
                  controls
                  class="w-full rounded aspect-video object-contain"
                />
                <p v-else class="text-base-content/50 text-sm">Aucune vidéo</p>
              </div>
            </div>
            <div class="space-y-4">
              <div v-for="field in otherFields(mode.faceB)" :key="field.key" class="space-y-2">
                <p class="text-sm font-semibold text-base-content/70">{{ field.label || field.key }}</p>

                <template v-if="field.type === 'text'">
                  <p class="text-lg">{{ renderFieldValue(field.key) }}</p>
                </template>

                <template v-else-if="field.type === 'file'">
                  <img v-if="mediaUrl(field.key)" :src="mediaUrl(field.key)" class="w-full rounded" />
                  <p v-else class="text-base-content/50 text-sm">Aucun média</p>
                </template>

                <template v-else-if="field.type === 'relation'">
                  <p class="text-base-content/80">{{ renderRelationLabel(field.key) }}</p>
                </template>
              </div>
            </div>
          </div>
          <div v-else class="space-y-4">
            <div v-for="field in mode.faceB" :key="field.key" class="space-y-2">
              <p class="text-sm font-semibold text-base-content/70">{{ field.label || field.key }}</p>

              <template v-if="field.type === 'text'">
                <p class="text-lg">{{ renderFieldValue(field.key) }}</p>
              </template>

              <template v-else-if="field.type === 'video'">
                <video v-if="mediaUrl(field.key)" :src="mediaUrl(field.key)" controls class="w-full rounded" />
                <p v-else class="text-base-content/50 text-sm">Aucune vidéo</p>
              </template>

              <template v-else-if="field.type === 'file'">
                <img v-if="mediaUrl(field.key)" :src="mediaUrl(field.key)" class="w-full rounded" />
                <p v-else class="text-base-content/50 text-sm">Aucun média</p>
              </template>

              <template v-else-if="field.type === 'relation'">
                <p class="text-base-content/80">{{ renderRelationLabel(field.key) }}</p>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
  </VueFlip>
</template>