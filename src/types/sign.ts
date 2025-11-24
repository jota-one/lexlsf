import type { TCategory, THandConfiguration } from ".";

export type TPlacement = {
  right: string[];
  left: string[];
};

export type TMovement = {
  type?: string;
  orientation?: string;
  amplitude?: string;
  speed?: string;
  precision?: string;
  repetitions?: string;
};

export type TMovements = {
  right: TMovement;
  left: TMovement;
};

export type TRecord = {
  id: string;
  name: string;
  slug: string;
  definition: string;
  video: string;
  level: string;
  verification_status: string;
  Category: string[];
  ConfigurationRight: string;
  ConfigurationLeft: string;
  learning_source: string;
  learning_source_detail: string;
  primary_language: string;
  placement: TPlacement;
  movements: TMovements;
  expand: {
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
  created: string;
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
  | "expand"
  | "created"
> & {
  id?: string;
  video?: File | null;
  level: number;
  ConfigurationRight: Partial<THandConfiguration.TRecord>;
  ConfigurationLeft: Partial<THandConfiguration.TRecord>;
};
