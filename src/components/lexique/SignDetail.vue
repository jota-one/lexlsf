<template>
  <transition name="fade">
    <div v-if="record">
      <div class="px-6 mb-4">
        <h1 class="text-5xl mb-8 font-display text-primary">
          {{ record.name }}
          <a
            v-if="personRecord"
            :href="`/culture/person/${personRecord.slug}`"
            class="btn btn-primary hover:bg-pink-600 ml-2"
            :aria-label="`Voir la personne ${personRecord.firstname ? personRecord.firstname + ' ' : ''}${personRecord.name}`"
          >
            <span class="i-fa-solid-user"></span>
          </a>
        </h1>
        <p>
          <span v-if="record.definition" class="italic">Déf. </span>{{ record.definition }}
        </p>
      </div>

      <div class="grid grid-cols-12 gap-4">
        <div class="card card-md col-span-12 md:col-span-7 shadow-sm">
          <div class="card-body">
            <video autoplay controls>
              <source :src="videoUrl" type="video/mp4" />
            </video>
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div v-for="cat in signCategories" :key="cat.id" class="flex items-center gap-4 pb-2 mb-2">
                  <h2 class="flex-1 self-start">{{ cat.tag }}</h2>
                  <ul>
                    <li v-for="subcat in cat.subcategories" :key="subcat.id" class="py-1 flex justify-end">
                      <div class="badge badge-outline badge-primary hover:badge-ghost justify-end">
                        <button class="cursor-pointer" @click="goToCategory(cat.slug, subcat.slug)">
                          {{ subcat.tag }}
                        </button>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <div class="flex items-center gap-4 mb-3">
                  <h2 class="flex-1">Niveau</h2>
                  <div class="flex gap-1">
                    <span
                      v-for="i in 5"
                      :key="i"
                      class="text-xl"
                      :class="i <= level ? 'text-primary' : 'text-base-300'"
                    >★</span>
                  </div>
                  <span class="text-sm">({{ record.level?.toUpperCase() }})</span>
                </div>
                <div class="flex items-center gap-4">
                  <h2 class="flex-1">Statut du signe</h2>
                  <span class="badge badge-outline badge-primary hover:badge-ghost">
                    {{ verificationStatusLabel }}
                  </span>
                </div>
                <div class="flex items-center gap-4 mt-3">
                  <h2 class="flex-1">Source d'apprentissage</h2>
                  <span class="badge badge-outline badge-primary hover:badge-ghost">
                    {{ learningSourceLabel }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-12 md:col-span-5">
          <div class="card shadow-sm h-full">
            <div
              class="card-body gap-6 grid grid-cols-2"
              :class="hasLeftConfiguration ? 'md:grid-cols-4' : 'md:grid-cols-3'"
            >
              <div v-if="hasLeftConfiguration" class="flex flex-col items-center gap-3">
                <div class="text-lg text-info font-semibold">M. gauche</div>
                <div class="flex items-center justify-center h-40 w-full">
                  <img
                    :src="configurationLeftUrl"
                    alt="Configuration Main Gauche"
                    class="max-h-36 w-auto object-contain rounded-lg shadow"
                  />
                </div>
                <div class="w-full border rounded-lg bg-base-200 py-4 px-3 text-sm text-gray-600 text-center">
                  Mouvement main gauche (bientôt disponible)
                </div>
              </div>

              <div v-if="hasConfiguration" class="flex flex-col items-center gap-3">
                <div class="text-lg text-primary font-semibold">M. droite</div>
                <div class="flex items-center justify-center h-40 w-full">
                  <img
                    :src="configurationUrl"
                    alt="Configuration Main Droite"
                    class="max-h-36 w-auto object-contain rounded-lg shadow"
                  />
                </div>
                <div class="w-full border rounded-lg bg-base-200 py-4 px-3 text-sm text-gray-600 text-center">
                  Mouvement main droite (bientôt disponible)
                </div>
              </div>

              <div class="col-span-2 text-center">
                <h3 class="text-lg font-semibold mb-4">Emplacements</h3>
                <div class="flex justify-center bg-white">
                  <FaceZonesOverlay
                    :right="record.placement?.right"
                    :left="record.placement?.left"
                    :color-config="colors"
                    active-hand="right"
                    :interactive="false"
                  />
                </div>
                <div class="flex justify-center pl-5 bg-white">
                  <BodyZonesOverlay
                    :right="record.placement?.right"
                    :left="record.placement?.left"
                    :color-config="colors"
                    active-hand="right"
                    :interactive="false"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-20 opacity-70">
      Signe introuvable.
    </div>

    <div v-else class="text-center py-20 opacity-70">
      Chargement…
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useAuth from '@admin/composables/useAuth'
import FaceZonesOverlay from '@admin/components/FaceZonesOverlay.vue'
import BodyZonesOverlay from '@admin/components/BodyZonesOverlay.vue'
import config from '@config'
import type { TCategory } from '../../types'

const props = defineProps<{ slug: string }>()

const { pb, isAuthenticated } = useAuth()
const router = useRouter()

const record = ref<any>(null)
const mainCategories = ref<TCategory.TRecord[]>([])
const error = ref(false)

const verificationStatusOptions = [
  { label: 'À vérifier', value: 'unverified' },
  { label: 'Officiel', value: 'verified' },
  { label: 'Contesté', value: 'disputed' },
]
const learningSourceOptions = [
  { label: 'Dictionnaire', value: 'dictionary' },
  { label: 'Enseignant', value: 'teacher' },
  { label: 'Communauté', value: 'community' },
  { label: 'Média', value: 'media' },
  { label: 'Autre', value: 'other' },
]

const colors = { right: '#f4309865', left: '#00bafe74' }

onMounted(async () => {
  if (!isAuthenticated.value) {
    window.location.href = '/'
    return
  }

  try {
    const [signRecord, cats] = await Promise.all([
      pb.collection('sign').getFirstListItem(`slug="${props.slug}"`, {
        expand: 'Category,ConfigurationRight,ConfigurationLeft,person_via_Sign',
      }),
      pb.collection<TCategory.TRecord>('category').getFullList({
        fields: 'id, tag, slug',
        sort: 'tag',
        filter: 'Parent = null',
      }),
    ])
    record.value = signRecord
    mainCategories.value = cats
  } catch {
    error.value = true
  }
})

const personRecord = computed(() => record.value?.expand?.person_via_Sign?.[0] ?? null)

const videoUrl = computed(() =>
  record.value
    ? `${config.apiBaseUrl}/api/files/sign/${record.value.id}/${record.value.video}`
    : '',
)

const hasConfiguration = computed(
  () => record.value?.expand?.ConfigurationRight?.illustration,
)
const hasLeftConfiguration = computed(
  () => record.value?.expand?.ConfigurationLeft?.illustration,
)

const configurationUrl = computed(() => {
  const r = record.value?.expand?.ConfigurationRight
  return r ? `${config.apiBaseUrl}/api/files/hand_configurations/${r.id}/${r.illustration}` : ''
})
const configurationLeftUrl = computed(() => {
  const l = record.value?.expand?.ConfigurationLeft
  return l ? `${config.apiBaseUrl}/api/files/hand_configurations/${l.id}/${l.illustration}` : ''
})

const signCategories = computed(() => {
  if (!record.value || !mainCategories.value.length) return []
  return mainCategories.value
    .map(mainCat => ({
      ...mainCat,
      subcategories: (record.value.expand?.Category || []).filter(
        (cat: TCategory.TRecord) => cat.Parent === mainCat.id,
      ),
    }))
    .filter(cat => cat.subcategories.length > 0)
})

const level = computed(() => ['a1', 'a2', 'b1', 'b2', 'c1'].indexOf(record.value?.level) + 1)

const verificationStatusLabel = computed(
  () =>
    verificationStatusOptions.find(o => o.value === record.value?.verification_status)?.label ??
    'Non spécifié',
)
const learningSourceLabel = computed(
  () =>
    learningSourceOptions.find(o => o.value === record.value?.learning_source)?.label ??
    'Non spécifié',
)

function goToCategory(parentSlug: string, subcatSlug: string) {
  router.push({ path: `/${parentSlug}/${subcatSlug}` })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
