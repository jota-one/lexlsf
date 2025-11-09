import PocketBase from "pocketbase";
import config from "../../config";
import { ref } from "vue";
import type { TCategory } from "../../types";

export default function useCategories() {
  const pb = new PocketBase(config.apiBaseUrl);
  const categories = ref<TCategory.TRecord[]>([]);
  const loadingCategories = ref(false);

  const loadCategories = async () => {
    loadingCategories.value = true;
    categories.value = await pb
      .collection<TCategory.TRecord>("category")
      .getFullList({
        fields: "id, tag, slug, expand.category_via_Parent.*",
        sort: "tag",
        filter: "Parent = null",
        expand: "category_via_Parent",
      });

    // Sort categories by tag and then by parent category tag
    categories.value.map((parentCat) => {
      if (parentCat.expand?.category_via_Parent) {
        parentCat.expand.category_via_Parent.sort((a, b) =>
          a.tag.localeCompare(b.tag),
        );
      }
    });

    loadingCategories.value = false;
  };

  const saveCategory = async (payload: {
    tag: string;
    slug: string;
    Parent: string | null;
  }) => {
    const data: any = {
      tag: payload.tag,
      slug: payload.slug,
    };
    if (payload.Parent) {
      data.Parent = payload.Parent;
    }
    await pb.collection("category").create(data);
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
