<template>
  <transition name="fade">
    <div v-if="record" class="max-w-5xl mx-auto">
      <!-- En-tête avec hero -->
      <div class="hero bg-base-200 rounded-box mb-8 place-items-start">
        <div class="hero-content flex-col lg:flex-row gap-8 py-12">
          <picture v-if="imageUrl" class="flex-shrink-0">
            <source :srcset="imageThumbUrl" media="(max-width: 600px)" />
            <img
              :src="imageUrl"
              :alt="record.name"
              class="max-w-sm w-full rounded-lg shadow-2xl object-cover aspect-square"
            />
          </picture>

          <div class="flex-1">
            <h1 class="text-5xl font-bold mb-4" :class="{ 'text-info': record.deaf }">
              {{ displayName }}
              <a
                v-if="record.expand?.Sign"
                :href="`/lexique/sign/${record.expand.Sign.slug}`"
                class="btn btn-info hover:bg-sky-500 ml-2"
                :aria-label="`Voir le signe ${record.expand.Sign.name}`"
              >
                <span class="i-ic-round-sign-language"></span>
              </a>
            </h1>

            <div class="space-y-3 mb-6">
              <div v-if="record.birthdate || record.birthplace" class="flex items-start gap-2">
                <span class="i-fa-solid-baby text-base"></span>
                <div class="text-sm">
                  <span class="font-semibold">{{ record.organism ? 'Crée le:' : 'Né(e) le:' }}</span>
                  <span v-if="record.birthdate"> {{ formatDate(record.birthdate) }}</span>
                  <template v-if="record.birthplace">
                    <br /><span>{{ record.birthplace }}</span>
                  </template>
                </div>
              </div>

              <div v-if="record.deceased" class="flex items-start gap-2">
                <span class="i-fa-solid-cross text-base"></span>
                <div class="text-sm">
                  <span class="font-semibold">{{ record.organism ? 'Dissout' : 'Décédé·e' }}</span>
                  <span v-if="record.deathdate"> le {{ formatDate(record.deathdate) }}</span>
                </div>
              </div>

              <div
                v-if="!record.organism && (typeof record.deafFamily !== 'undefined' || record.family)"
                class="flex items-start gap-2"
              >
                <span class="i-fa-solid-users text-base"></span>
                <div class="text-sm">
                  <div v-if="typeof record.deafFamily !== 'undefined'" class="font-semibold">
                    {{ record.deafFamily ? 'Famille sourde' : 'Famille entendante' }}
                  </div>
                  <div v-if="record.family" class="opacity-80">{{ record.family }}</div>
                </div>
              </div>

              <template v-if="activitiesList.length > 0">
                <hr />
                <div class="flex items-start gap-2">
                  <span class="i-fa-solid-bank text-base"></span>
                  <div class="text-sm">
                    <span class="font-semibold">Activité(s):</span>
                    <span> {{ activitiesList.join(', ') }}</span>
                  </div>
                </div>
              </template>
            </div>

            <div
              v-if="record.expand?.Category && record.expand.Category.length > 0"
              class="flex flex-wrap gap-2 mb-4"
            >
              <button
                v-for="cat in record.expand.Category"
                :key="cat.id"
                class="badge badge-primary badge-lg hover:badge-primary-focus transition-colors cursor-pointer"
                @click="goToCategory(cat)"
              >
                {{ cat.tag }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Grille principale : timeline + infos détaillées -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div
          v-if="record.timeline && record.timeline.length > 0"
          class="card bg-base-100 shadow-xl lg:col-span-1"
        >
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">
              <span class="i-fa-solid-scroll"></span>
              Timeline
            </h2>
            <div class="timeline timeline-vertical timeline-snap-icon timeline-compact">
              <li v-for="highlight in record.timeline" :key="highlight.title">
                <div class="timeline-middle">
                  <span class="i-fa-solid-circle text-primary"></span>
                </div>
                <div class="timeline-start mb-10">
                  <time class="font-bold text-[16px]">{{ highlight.title }}</time>
                  <p class="mt-2 text-base-content/80">{{ highlight.description }}</p>
                </div>
                <hr class="bg-primary" />
              </li>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl lg:col-span-2">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">
              <span class="i-fa-solid-info-circle"></span>
              Présentation
            </h2>
            <div class="space-y-4">
              <div
                v-if="descriptionHtml"
                class="prose prose-sm md:prose-base max-w-none text-base-content prose-headings:text-base-content prose-strong:text-base-content prose-p:text-base-content/80 person-prose"
              >
                <!-- eslint-disable-next-line vue/no-v-html -->
                <article v-html="descriptionHtml"></article>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section vidéos -->
      <div
        v-if="record.expand?.Videos && record.expand.Videos.length > 0"
        class="card bg-base-100 shadow-xl mt-8"
      >
        <div class="card-body">
          <h2 class="card-title text-3xl mb-6">
            <span class="i-fa-solid-play"></span>
            Vidéos
          </h2>
          <div class="carousel carousel-center w-full gap-4 rounded-box bg-base-200 p-4">
            <template v-for="(video, index) in record.expand.Videos" :key="index">
              <div
                v-if="getYouTubeId(video.url)"
                class="carousel-item w-full sm:w-96 flex-shrink-0"
              >
                <div class="w-full aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    :src="`https://www.youtube.com/embed/${getYouTubeId(video.url)}`"
                    :title="video.title"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    class="rounded-lg"
                  ></iframe>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-20 opacity-70">
      Personne introuvable.
    </div>

    <div v-else class="text-center py-20 opacity-70">
      Chargement…
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import dayjs from 'dayjs'
import useAuth from '@admin/composables/useAuth'
import config from '@config'

const props = defineProps<{ slug: string }>()

const { pb, isAuthenticated } = useAuth()
const router = useRouter()

const record = ref<any>(null)
const error = ref(false)

onMounted(async () => {
  if (!isAuthenticated.value) {
    window.location.href = '/'
    return
  }

  try {
    record.value = await pb.collection('person').getFirstListItem(`slug="${props.slug}"`, {
      expand: 'Category,Category.Parent,Sign,Videos,Activities',
    })
  } catch {
    error.value = true
  }
})

const displayName = computed(() => {
  if (!record.value) return ''
  if (!record.value.organism && record.value.firstname) {
    return `${record.value.firstname} ${record.value.name}`
  }
  return record.value.name
})

const imageUrl = computed(() =>
  record.value?.illustration
    ? `${config.apiBaseUrl}/api/files/person/${record.value.id}/${record.value.illustration}`
    : null,
)

const imageThumbUrl = computed(() =>
  record.value?.illustration
    ? `${config.apiBaseUrl}/api/files/person/${record.value.id}/${record.value.illustration}?thumb=600x600`
    : null,
)

const descriptionHtml = computed(() =>
  record.value?.description ? String(marked.parse(String(record.value.description))) : '',
)

const activitiesList = computed(() => {
  if (!record.value) return []
  if (Array.isArray(record.value.expand?.Activities)) {
    return record.value.expand.Activities.map(
      (a: any) => a.name ?? a.title ?? a.tag ?? a.label ?? String(a),
    ).filter(Boolean)
  }
  return Array.isArray(record.value.activities) ? record.value.activities : []
})

function formatDate(date: string) {
  return dayjs(date).format('DD.MM.YYYY')
}

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

function goToCategory(cat: any) {
  if (cat.expand?.Parent) {
    router.push({ path: `/${cat.expand.Parent.slug}/${cat.slug}` })
  } else {
    router.push({ path: `/${cat.slug}` })
  }
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
