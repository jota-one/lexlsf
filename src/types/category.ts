export type TRecord = {
  id: string;
  tag: string;
  slug: string;
  Parent?: string;
  expand?: {
    category_via_Parent?: TRecord[];
  };
};
