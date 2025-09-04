import { apiService } from './api';

export async function listTasks() {
  try {
    const response = await apiService.getTasks();
    return { data: response.data, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
}

export async function createTask(input: {
  title: string;
  dueAt?: string | null;
  category?: string | null;
  isStarred?: boolean;
  parentId?: string | null;
}) {
  try {
    const response = await apiService.createTask(input);
    return { data: response.data, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
}

export async function setStatus(id: string, status: 'pending' | 'done') {
  try {
    await apiService.updateTask(id, { status });
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
}

export async function toggleStar(id: string, current: boolean) {
  try {
    await apiService.toggleTaskStar(id);
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
}

export async function updateTask(id: string, updates: any) {
  try {
    const response = await apiService.updateTask(id, updates);
    return { data: response.data, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
}

export async function deleteTask(id: string) {
  try {
    await apiService.deleteTask(id);
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
}