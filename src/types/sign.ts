import type { TCategory, THandConfiguration } from ".";

export type TPlacement = {
  right: string[];
  left: string[];
};

export type TRecord = {
  id: string;
  name: string;
  slug: string;
  video: string;
  level: string;
  verification_status: string;
  Category?: string[];
  ConfigurationRight?: string;
  ConfigurationLeft?: string;
  dominant_hand_movement?: string;
  non_dominant_hand_movement?: string;
  hand_coordination?: string;
  learning_source?: string;
  learning_source_detail?: string;
  primary_language?: string;
  placement?: TPlacement;
  expand?: {
    Category?: TCategory.TRecord[];
    ConfigurationRight?: {
      id: string;
      name: string;
      illustration: string;
    };
    ConfigurationLeft?: {
      id: string;
      name: string;
      illustration: string;
    };
  };
  updated: string;
};

export type TForm = Omit<
  TRecord,
  | "id"
  | "level"
  | "slug"
  | "video"
  | "updated"
  | "ConfigurationRight"
  | "ConfigurationLeft"
> & {
  id?: string;
  level: number;
  ConfigurationRight: Partial<THandConfiguration.TRecord>;
  ConfigurationLeft: Partial<THandConfiguration.TRecord>;
};
