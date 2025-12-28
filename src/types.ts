export type Category = "Lifestyle" | "Career";

export interface DailyTask {
  id: string;
  label: string;
  timeSlot?: string;
  category: Category;
  completions: boolean[];
}

export interface CareerGoal {
  id: string;
  label: string;
  isCompleted: boolean;
}
