import PocketBase from "pocketbase";
import config from "../../config";
import { ref } from "vue";
import type { TCategory } from "../../types";

export default function useCategories() {
  const pb = new PocketBase(config.apiBaseUrl);
  const categories = ref<TCategory.TRecord[]>([]);
  const loadingCategories = ref(false);

  const loadCategories = async (entity?: string) => {
    loadingCategories.value = true;
    const catsFromDb = await pb.collection<TCategory.TRecord>("category").getFullList({
      fields: "id, tag, slug, expand.category_via_Parent.*",
      sort: "tag",
      filter: "Parent = null",
      expand: "category_via_Parent",
    });

    // Sort categories by tag and then by parent category tag
    categories.value = catsFromDb
      .map((parentCat) => {
        if (parentCat.expand?.category_via_Parent) {
          parentCat.expand.category_via_Parent = parentCat.expand.category_via_Parent
            .map((cat) => {
              return {
                ...cat,
                entities: (cat.entities as string).split(",").filter((e) => e !== ""),
              };
            })
            .filter((cat) => {
              if (entity) {
                return (cat.entities as string[]).includes(entity);
              }
              return true;
            })
            .sort((a, b) => a.tag.localeCompare(b.tag));
        }
        return parentCat as TCategory.TRecord;
      })
      .filter((parentCat) => {
        if (entity && parentCat.expand?.category_via_Parent) {
          return parentCat.expand.category_via_Parent.length > 0;
        }
        return true;
      });

    loadingCategories.value = false;
  };

  const saveCategory = async (payload: {
    id?: string;
    tag: string;
    slug: string;
    Parent: string | null;
    entities?: string[];
  }) => {
    const data: any = {
      tag: payload.tag,
      slug: payload.slug,
    };
    if (payload.Parent) {
      data.Parent = payload.Parent;
    }
    if (payload.entities) {
      data.entities = payload.entities;
    }

    if (payload.id) {
      // Update existing category
      await pb.collection("category").update(payload.id, data);
    } else {
      // Create new category
      await pb.collection("category").create(data);
    }
    await loadCategories();
  };

  const deleteCategory = async (id: string) => {
    await pb.collection("category").delete(id);
    await loadCategories();
  };

  return {
    categories,
    loadingCategories,
    loadCategories,
    saveCategory,
    deleteCategory,
  };
}
