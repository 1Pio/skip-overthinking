export type DraftOption = {
  id: string;
  title: string;
  order: number;
  description?: string;
  icon?: string;
};

export type OptionMetadata = {
  description?: string;
  icon?: string;
};

export type OptionDraftInput = {
  title: string;
} & OptionMetadata;
