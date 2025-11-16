import type { App } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import Rating from "primevue/rating";

export default (app: App) => {
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
    },
  });
  app.component("Rating", Rating);
};
