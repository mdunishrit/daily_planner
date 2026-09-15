import type { BoardCard, Person, Priority, Section } from "@/lib/types";

/** Board filter state. Mirrors the URL query string keys. */
export type BoardFilters = {
  person?: string;
  section?: string;
  priority?: Priority;
  today: boolean;
  archived: boolean;
  q: string;
  view: "board" | "list";
};

export type CommandShellProps = {
  sections: Section[];
  people: Person[];
  cards: BoardCard[];
};

export type BoardViewProps = {
  cards: BoardCard[];
  sections: Section[];
  onOpen: (card: BoardCard) => void;
};

export type ListViewProps = {
  cards: BoardCard[];
  sections: Section[];
  onOpen: (card: BoardCard) => void;
};

export type CardDialogProps = {
  card: BoardCard;
  sections: Section[];
  onClose: () => void;
};
