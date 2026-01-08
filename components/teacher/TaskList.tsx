import React from 'react';
import { Task, Submission, Student } from '../../types';
import { FileText, Users, CheckCircle, Clock, Calendar } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  submissions: Record<string, Submission>;
  students: Student[];
  selectedTaskId: string;
  onSelectTask: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  submissions,
  students,
  selectedTaskId,
  onSelectTask,
}) => {
  // Calculate statistics for each task
  const getTaskStats = (taskId: string) => {
    const taskSubmissions = Object.values(submissions).filter(
      (sub) => sub.taskId === taskId
    );
    const taskStudents = students.filter((student) =>
      taskSubmissions.some((sub) => sub.studentId === student.id)
    );
    const completedCount = taskStudents.filter(
      (s) => s.status === 'feedback_ready' || s.status === 'revising'
    ).length;
    const pendingCount = taskStudents.filter(
      (s) => s.status === 'submitted'
    ).length;
    const totalCount = taskStudents.length;

    return { completedCount, pendingCount, totalCount };
  };

  // Format date
  const formatDate = (taskId: string) => {
    // For demo purposes, we'll just show relative dates
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === 0) return 'Today';
    if (index === 1) return 'Yesterday';
    return `${index} days ago`;
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg font-medium mb-2">No tasks yet</p>
        <p className="text-slate-400 text-sm">
          Create your first task to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const { completedCount, pendingCount, totalCount } = getTaskStats(task.id);
        const isSelected = task.id === selectedTaskId;

        return (
          <button
            key={task.id}
            onClick={() => onSelectTask(task.id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
              isSelected
                ? 'border-brand-500 bg-brand-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/30'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold text-base mb-1 truncate ${
                    isSelected ? 'text-brand-700' : 'text-slate-900'
                  }`}
                >
                  {task.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {task.prompt}
                </p>
              </div>
              {isSelected && (
                <CheckCircle className="w-5 h-5 text-brand-500 ml-2 flex-shrink-0" />
              )}
            </div>

            {/* Task Statistics */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(task.id)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Users className="w-3.5 h-3.5" />
                <span>{totalCount} student{totalCount !== 1 ? 's' : ''}</span>
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-1.5 text-amber-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{pendingCount} pending</span>
                </div>
              )}
              {completedCount > 0 && (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{completedCount} completed</span>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
