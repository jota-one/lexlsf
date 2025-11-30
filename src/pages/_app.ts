import type { App } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import Rating from "primevue/rating";
import { definePreset } from "@primeuix/themes";

const pinkSemantic = {
  primary: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f8b4d6",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
    950: "#500724",
  },
};

const customAura = definePreset(Aura, {
  semantic: pinkSemantic,
});

export default (app: App) => {
  app.use(PrimeVue, {
    theme: {
      preset: customAura,
    },
  });
  app.component("Rating", Rating);
};
