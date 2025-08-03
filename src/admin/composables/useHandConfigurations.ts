import { ref } from "vue";
import config from '../../config';
import PocketBase from 'pocketbase';

export default function useHandConfigurations() {
    const pb = new PocketBase(config.apiBaseUrl);
    const handConfigurations = ref([]);
    const loadingHandConfigurations = ref(false);

    const loadHandConfigurations = async () => {
        loadingHandConfigurations.value = true;
        handConfigurations.value = await pb.collection('hand_configurations').getFullList({
            fields: 'id,hand_type,name,illustration',
            sort: '-created'
        });
        loadingHandConfigurations.value = false;
    };

    const addHandConfiguration = async (payload) => {
        loadingHandConfigurations.value = true;
        const formData = new FormData();

        // set regular text field
        formData.append('hand_type', payload.hand_type);
        formData.append('name', payload.name);
        formData.append('illustration', payload.illustration);

        // upload and create new record
        return pb.collection('hand_configurations').create(formData);
    }

    return {
        addHandConfiguration,
        handConfigurations,
        loadingHandConfigurations,
        loadHandConfigurations
    };
}
