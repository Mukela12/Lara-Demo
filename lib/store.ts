import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Student, Task, FeedbackSession, Submission } from '../types';

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

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('lara-demo-store-v2');
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
    localStorage.setItem('lara-demo-store-v2', JSON.stringify(state));
  }, [state]);

  const addTask = (task: Task) => {
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

  const getStudentStatus = (studentId: string) => {
    const student = state.students.find(s => s.id === studentId);
    return student?.status;
  };

  const resetDemo = () => {
    localStorage.removeItem('lara-demo-store-v2');
    window.location.reload();
  };

  return {
    state,
    addTask,
    addStudent,
    submitWork,
    approveFeedback,
    getStudentStatus,
    resetDemo
  };
}