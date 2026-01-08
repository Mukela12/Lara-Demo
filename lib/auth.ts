// Teacher Authentication Utilities
// Handles teacher login, signup, and session management using localStorage

import { v4 as uuidv4 } from 'uuid';

export interface Teacher {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface TeacherCredentials {
  email: string;
  passwordHash: string;
  teacher: Teacher;
}

const TEACHERS_STORAGE_KEY = 'lara-teachers';
const CURRENT_TEACHER_KEY = 'lara-current-teacher';

// Simple hash function (for demo purposes - in production use proper hashing)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Get all registered teachers
function getAllTeachers(): Record<string, TeacherCredentials> {
  const stored = localStorage.getItem(TEACHERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

// Save teachers to localStorage
function saveTeachers(teachers: Record<string, TeacherCredentials>): void {
  localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(teachers));
}

// Sign up a new teacher
export function signUp(email: string, password: string, name: string): { success: boolean; teacher?: Teacher; error?: string } {
  if (!email || !password || !name) {
    return { success: false, error: 'All fields are required' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  const teachers = getAllTeachers();

  if (teachers[email]) {
    return { success: false, error: 'Email already registered' };
  }

  const teacher: Teacher = {
    id: uuidv4(),
    email,
    name,
    createdAt: new Date().toISOString(),
  };

  teachers[email] = {
    email,
    passwordHash: simpleHash(password),
    teacher,
  };

  saveTeachers(teachers);
  setCurrentTeacher(teacher);

  return { success: true, teacher };
}

// Log in an existing teacher
export function logIn(email: string, password: string): { success: boolean; teacher?: Teacher; error?: string } {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  const teachers = getAllTeachers();
  const credentials = teachers[email];

  if (!credentials) {
    return { success: false, error: 'Invalid email or password' };
  }

  const passwordHash = simpleHash(password);
  if (credentials.passwordHash !== passwordHash) {
    return { success: false, error: 'Invalid email or password' };
  }

  setCurrentTeacher(credentials.teacher);
  return { success: true, teacher: credentials.teacher };
}

// Log out current teacher
export function logOut(): void {
  localStorage.removeItem(CURRENT_TEACHER_KEY);
}

// Set current teacher session
export function setCurrentTeacher(teacher: Teacher): void {
  localStorage.setItem(CURRENT_TEACHER_KEY, JSON.stringify(teacher));
}

// Get current logged-in teacher
export function getCurrentTeacher(): Teacher | null {
  const stored = localStorage.getItem(CURRENT_TEACHER_KEY);
  return stored ? JSON.parse(stored) : null;
}

// Check if a teacher is currently logged in
export function isLoggedIn(): boolean {
  return getCurrentTeacher() !== null;
}

// Update teacher profile
export function updateTeacherProfile(updates: Partial<Omit<Teacher, 'id' | 'createdAt'>>): { success: boolean; teacher?: Teacher; error?: string } {
  const currentTeacher = getCurrentTeacher();
  if (!currentTeacher) {
    return { success: false, error: 'Not logged in' };
  }

  const teachers = getAllTeachers();
  const credentials = teachers[currentTeacher.email];

  if (!credentials) {
    return { success: false, error: 'Teacher not found' };
  }

  const updatedTeacher = { ...credentials.teacher, ...updates };
  credentials.teacher = updatedTeacher;

  // If email changed, update the key
  if (updates.email && updates.email !== currentTeacher.email) {
    delete teachers[currentTeacher.email];
    teachers[updates.email] = credentials;
  }

  saveTeachers(teachers);
  setCurrentTeacher(updatedTeacher);

  return { success: true, teacher: updatedTeacher };
}
