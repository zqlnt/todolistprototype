import { Task, TaskSection } from './types';

export function bucketSection(task: Task, now: Date): TaskSection {
  if (!task.dueAt) {
    return 'Upcoming';
  }
  
  const due = new Date(task.dueAt);
  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  if (diffDays < 0) {
    return 'Today'; // Overdue shows under Today
  } else if (diffDays <= 1) {
    return 'Today';
  } else if (diffDays <= 2) {
    return 'Tomorrow';
  } else if (diffDays <= 7) {
    return 'This Week';
  } else {
    return 'Upcoming';
  }
}

export function groupTasksBySection(tasks: Task[]): Record<TaskSection, Task[]> {
  const now = new Date();
  const sections: Record<TaskSection, Task[]> = {
    Today: [],
    Tomorrow: [],
    'This Week': [],
    Upcoming: []
  };
  
  // Only group top-level tasks (no parent)
  const topLevelTasks = tasks.filter(task => !task.parent_id);
  
  topLevelTasks.forEach(task => {
    const section = bucketSection(task, now);
    sections[section].push(task);
  });
  
  // Sort each section by isStarred (desc) then by due date (asc)
  Object.keys(sections).forEach(sectionKey => {
    const section = sectionKey as TaskSection;
    sections[section].sort((a, b) => {
      // First sort by starred status
      if (a.isStarred !== b.isStarred) {
        return b.isStarred ? 1 : -1;
      }
      // Then sort by due date
      if (a.dueAt && b.dueAt) {
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      }
      if (a.dueAt && !b.dueAt) return -1;
      if (!a.dueAt && b.dueAt) return 1;
      return 0;
    });
  });
  
  return sections;
}

export function groupTasksByCategory(tasks: Task[]): Record<string, Task[]> {
  const categories: Record<string, Task[]> = {};
  
  // Only group top-level tasks (no parent)
  const topLevelTasks = tasks.filter(task => !task.parent_id);
  
  topLevelTasks.forEach(task => {
    const category = task.category || 'No Category';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(task);
  });
  
  // Sort each category by isStarred (desc) then by due date (asc)
  Object.keys(categories).forEach(categoryKey => {
    categories[categoryKey].sort((a, b) => {
      // First sort by starred status
      if (a.isStarred !== b.isStarred) {
        return b.isStarred ? 1 : -1;
      }
      // Then sort by due date
      if (a.dueAt && b.dueAt) {
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      }
      if (a.dueAt && !b.dueAt) return -1;
      if (!a.dueAt && b.dueAt) return 1;
      return 0;
    });
  });
  
  return categories;
}