import { ref } from "vue";
import config from '../../config'
import PocketBase from 'pocketbase'

export default function useSigns() {
    const pb = new PocketBase(config.apiBaseUrl)

    const signs = ref([]);
    const loadSigns = async () => {
        signs.value = await pb.collection('sign').getFullList({
            fields: 'id, name, video, slug, level, configuration, expand.Category.*',
            expand: 'Category',
            sort: '-created',
        })
    }

    return {
        signs,
        loadSigns
    }
}