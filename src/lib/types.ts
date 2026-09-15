export type Status = "todo" | "in_progress" | "done";
export type Priority = "high" | "normal" | "low";
export type ActivityKind = "change" | "note";

export type Section = {
  id: string;
  name: string;
  position: number;
  created_at: string;
};

export type Card = {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  section_id: string;
  status: Status;
  priority: Priority;
  position: number;
  done_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ChecklistItem = {
  id: string;
  card_id: string;
  text: string;
  is_done: boolean;
  position: number;
  created_at: string;
};

export type Person = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type CardPerson = {
  card_id: string;
  person_id: string;
};

export type Activity = {
  id: string;
  card_id: string;
  kind: ActivityKind;
  text: string;
  created_at: string;
};

export type BoardCard = Card & {
  section_name: string;
  checklist_done: number;
  checklist_total: number;
  people: Person[];
};

export type Board = {
  sections: Section[];
  cards: BoardCard[];
};

export type CardDetail = {
  card: Card;
  checklist: ChecklistItem[];
  people: Person[];
  activities: Activity[];
};

export type UpdateCardInput = {
  title?: string;
  description?: string | null;
  link?: string | null;
  priority?: Priority;
  sectionId?: string;
};
