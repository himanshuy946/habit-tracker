import { useState, useEffect } from "react";
import type { DailyTask as Task, Category } from "../types";

export const useHabits = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("habit-data");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("habit-data", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (label: string, category: Category) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      label,
      category,
      completions: Array(7).fill(false),
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTask = (taskId: string, dayIndex: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const nextCompletions = [...task.completions];
          nextCompletions[dayIndex] = !nextCompletions[dayIndex];
          return { ...task, completions: nextCompletions };
        }
        return task;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return { tasks, addTask, toggleTask, deleteTask };
};
