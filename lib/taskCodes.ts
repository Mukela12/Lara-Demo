// Task Code Generation and Validation Utilities
// Generates unique 6-digit alphanumeric codes for tasks

/**
 * Generates a 6-digit alphanumeric code
 * Format: ABC123 (uppercase letters and numbers)
 */
export function generateTaskCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

/**
 * Validates if a task code matches the expected format
 * Must be 6 alphanumeric characters
 */
export function isValidTaskCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }

  // Must be exactly 6 characters
  if (code.length !== 6) {
    return false;
  }

  // Must only contain alphanumeric characters
  const alphanumericRegex = /^[A-Z0-9]+$/;
  return alphanumericRegex.test(code.toUpperCase());
}

/**
 * Formats a task code for display (adds hyphen in the middle)
 * Example: ABC123 -> ABC-123
 */
export function formatTaskCode(code: string): string {
  if (code.length !== 6) {
    return code;
  }
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/**
 * Generates a unique task code that doesn't conflict with existing codes
 */
export function generateUniqueTaskCode(existingCodes: string[]): string {
  const maxAttempts = 100;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const code = generateTaskCode();
    if (!existingCodes.includes(code)) {
      return code;
    }
    attempts++;
  }

  // Fallback: append timestamp if we can't generate unique code
  const code = generateTaskCode();
  console.warn('Could not generate unique code after 100 attempts, using timestamp fallback');
  return code;
}

/**
 * Stores task code mapping in localStorage
 * Maps: taskCode -> taskId
 */
export function saveTaskCodeMapping(teacherId: string | undefined, taskCode: string, taskId: string): void {
  const storageKey = `lara-task-codes-${teacherId || 'demo'}`;

  try {
    const stored = localStorage.getItem(storageKey);
    const mappings = stored ? JSON.parse(stored) : {};

    mappings[taskCode] = taskId;

    localStorage.setItem(storageKey, JSON.stringify(mappings));
  } catch (error) {
    console.error('Failed to save task code mapping:', error);
  }
}

/**
 * Gets task ID from task code
 */
export function getTaskIdFromCode(teacherId: string | undefined, taskCode: string): string | null {
  const storageKey = `lara-task-codes-${teacherId || 'demo'}`;

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return null;
    }

    const mappings = JSON.parse(stored);
    return mappings[taskCode.toUpperCase()] || null;
  } catch (error) {
    console.error('Failed to get task code mapping:', error);
    return null;
  }
}

/**
 * Gets all task codes for a teacher
 */
export function getAllTaskCodes(teacherId: string | undefined): Record<string, string> {
  const storageKey = `lara-task-codes-${teacherId || 'demo'}`;

  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to get all task codes:', error);
    return {};
  }
}
