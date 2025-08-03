import { ref } from "vue";
import config from '../../config'
import PocketBase from 'pocketbase'

const translateNumericLevel = (level: number) => {
    const levels = ['a1', 'a2', 'b1', 'b2', 'c1'];
    return levels[level - 1] || '';
}

const learningSourceOptions = [
    { label: 'Dictionnaire', value: 'dictionary' },
    { label: 'Enseignant', value: 'teacher' },
    { label: 'Communauté', value: 'community' },
    { label: 'Famille', value: 'family' },
    { label: 'Média', value: 'media' },
    { label: 'Recherche', value: 'research' },
    { label: 'Autre', value: 'other' }
];
const primaryLanguageOptions = [
    { label: 'LSF', value: 'LSF' },
    { label: 'LSR', value: 'LSR' },
    { label: 'ASL', value: 'ASL' },
    { label: 'Autre', value: 'other' }
];

const verificationStatusOptions = [
    { label: 'À vérifier', value: 'unverified' },
    { label: 'Officiel', value: 'verified' },
    { label: 'Contesté', value: 'disputed' }
];

export default function useSigns() {
    const pb = new PocketBase(config.apiBaseUrl)

    const signs = ref([]);
    const loadSigns = async () => {
        signs.value = await pb.collection('sign').getFullList({
            fields: 'id, name, video, slug, level, expand.ConfigurationRight.*, expand.ConfigurationLeft.*, expand.Category.*',
            expand: 'Category,ConfigurationRight,ConfigurationLeft',
            sort: '-created',
        })
    }

    const addSign = async (payload) => {
        const formData = new FormData();

        // set regular text field
        formData.append('video', payload.video);
        formData.append('name', payload.name);
        formData.append('slug', payload.name.toLowerCase().replace(/\s+/g, '-'));
        formData.append('level', translateNumericLevel(payload.level));
        formData.append('verification_status', payload.verification_status);
        formData.append('ConfigurationRight', payload.ConfigurationRight);
        formData.append('ConfigurationLeft', payload.ConfigurationLeft);
        formData.append('location_right', payload.location_right);
        formData.append('location_left', payload.location_left);
        // formData.append('category', payload.category);
        formData.append('learning_source', payload.learning_source);
        formData.append('learning_source_detail', payload.learning_source_detail);
        formData.append('primary_language', payload.primary_language);

        // upload and create new record
        return pb.collection('sign').create(formData);
    }

    return {
        signs,
        loadSigns,
        addSign,
        learningSourceOptions,
        primaryLanguageOptions,
        verificationStatusOptions
    }
}