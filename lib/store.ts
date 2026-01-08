import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Student, Task, FeedbackSession, Submission } from '../types';
import { generateUniqueTaskCode, saveTaskCodeMapping, getAllTaskCodes } from './taskCodes';

// Initial Mock Data
const INITIAL_TASKS: Task[] = [
  {
    id: 'default-task',
    title: 'Creative Writing 101: The Forest',
    prompt: 'Write a descriptive paragraph about walking through a mysterious forest. Focus on sensory details (sight, sound, smell).',
    successCriteria: [
      'Include at least 3 distinct sensory details',
      'Use strong adjectives',
      'Create a clear mood or atmosphere'
    ],
    universalExpectations: true
  }
];

export interface AppState {
  tasks: Task[];
  students: Student[];
  submissions: Record<string, Submission>;
  currentTaskId: string;
}

// Get storage key for a teacher (or demo mode)
function getStorageKey(teacherId?: string): string {
  if (!teacherId) {
    return 'lara-demo-store-v2'; // Demo mode
  }
  return `lara-teacher-${teacherId}`;
}

export function useAppStore(teacherId?: string) {
  const storageKey = getStorageKey(teacherId);

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load store", e);
    }
    return {
      tasks: INITIAL_TASKS,
      students: [],
      submissions: {},
      currentTaskId: 'default-task'
    };
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const addTask = (task: Task) => {
    // Generate unique task code if not provided
    if (!task.taskCode) {
      const existingCodes = getAllTaskCodes(teacherId);
      const taskCode = generateUniqueTaskCode(Object.keys(existingCodes));
      task.taskCode = taskCode;

      // Save the mapping
      saveTaskCodeMapping(teacherId, taskCode, task.id);
    }

    setState(prev => ({
      ...prev,
      tasks: [task, ...prev.tasks],
      currentTaskId: task.id
    }));
  };

  const addStudent = (name: string): Student => {
    const newStudent: Student = {
      id: uuidv4(),
      name,
      status: 'active',
      joinedAt: Date.now()
    };
    setState(prev => ({
      ...prev,
      students: [...prev.students, newStudent]
    }));
    return newStudent;
  };

  const submitWork = (studentId: string, taskId: string, content: string, feedback: FeedbackSession) => {
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === studentId ? { ...s, status: 'submitted' } : s),
      submissions: {
        ...prev.submissions,
        [studentId]: {
          studentId,
          taskId,
          content,
          feedback,
          timestamp: Date.now()
        }
      }
    }));
  };

  const approveFeedback = (studentId: string) => {
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === studentId ? { ...s, status: 'feedback_ready' } : s)
    }));
  };

  const updateFeedback = (studentId: string, updatedFeedback: FeedbackSession) => {
    setState(prev => ({
      ...prev,
      submissions: {
        ...prev.submissions,
        [studentId]: {
          ...prev.submissions[studentId],
          feedback: updatedFeedback
        }
      }
    }));
  };

  const getStudentStatus = (studentId: string) => {
    const student = state.students.find(s => s.id === studentId);
    return student?.status;
  };

  const selectTask = (taskId: string) => {
    setState(prev => ({
      ...prev,
      currentTaskId: taskId
    }));
  };

  const resetDemo = () => {
    localStorage.removeItem(storageKey);
    window.location.reload();
  };

  return {
    state,
    addTask,
    addStudent,
    submitWork,
    approveFeedback,
    updateFeedback,
    getStudentStatus,
    selectTask,
    resetDemo
  };
}