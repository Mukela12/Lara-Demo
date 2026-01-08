import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Task, FeedbackSession } from '../../types';
import { User, BookOpen, Clock } from 'lucide-react';
import { generateFeedback } from '../../lib/gemini';

interface StudentEntryProps {
  task: Task;
  onJoin: (name: string) => void;
  onSubmitWork: (content: string, feedback: FeedbackSession) => void;
  isPending: boolean; // Is waiting for teacher approval
  studentId?: string; // Student ID for generating shareable link
  taskCode?: string; // Task code from URL (for task-specific access)
}

export const StudentEntry: React.FC<StudentEntryProps> = ({
  task,
  onJoin,
  onSubmitWork,
  isPending,
  studentId,
  taskCode
}) => {
  const [step, setStep] = useState<'name' | 'work' | 'analyzing' | 'waiting'>('name');
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  // Update internal step if parent says we are pending
  useEffect(() => {
    if (isPending) {
      setStep('waiting');
    }
  }, [isPending]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name);
      setStep('work');
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setStep('analyzing');

    try {
      // Call Gemini API
      const feedback = await generateFeedback(task.prompt, task.successCriteria, content);

      // Submit to store (which sets status to 'submitted')
      onSubmitWork(content, feedback);
      // Parent component will re-render and might keep us in 'waiting' if not approved
    } catch (error) {
      console.error('Failed to generate feedback:', error);
      setStep('work'); // Return to work state so student can retry

      // Show user-friendly error message
      alert(
        'Sorry, we could not generate feedback at this time. ' +
        'Please check your internet connection and try again. ' +
        'If the problem persists, contact your teacher.'
      );
    }
  };

  if (step === 'name') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full p-8 space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Student Login</h2>
            <p className="text-slate-500 text-sm mt-1">Join the session to start writing</p>
          </div>

          {/* Show task info if joining via task code */}
          {taskCode && task && (
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-brand-900">{task.title}</p>
                  <p className="text-xs text-brand-700 mt-1 line-clamp-2">{task.prompt}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
              <input 
                autoFocus
                required
                type="text" 
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base" size="lg">
              Join Session
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-semibold text-slate-900">Analyzing your work...</h2>
        <p className="text-slate-500 mt-2 text-center max-w-xs">
          LARA is checking your writing against the success criteria.
        </p>
      </div>
    );
  }

  if (step === 'waiting' || isPending) {
    const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;

    // Generate shareable link with both taskCode and studentId when available
    let shareableLink = '';
    if (taskCode && studentId) {
      shareableLink = `${baseUrl}?taskCode=${taskCode}&studentId=${studentId}`;
    } else if (studentId) {
      shareableLink = `${baseUrl}?studentId=${studentId}`;
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Waiting for Approval</h2>
              <p className="text-slate-600">
                Your teacher has received your work and is reviewing the feedback.
              </p>
            </div>

            {/* Shareable Link */}
            {shareableLink && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Save this link to check your feedback later:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareableLink}
                    className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(shareableLink);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
       <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 shadow-sm">
         <div className="max-w-2xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="p-1.5 bg-brand-50 rounded text-brand-700">
                <BookOpen className="w-4 h-4" />
             </div>
             <span className="font-semibold text-slate-900 text-sm">{task.title}</span>
           </div>
           <span className="text-xs text-slate-500">{name}</span>
         </div>
       </div>

       <main className="max-w-2xl mx-auto p-4 space-y-6">
         <div className="bg-brand-50 border border-brand-100 rounded-xl p-5">
           <h3 className="text-sm font-bold text-brand-800 uppercase tracking-wide mb-2">Prompt</h3>
           <p className="text-slate-800 leading-relaxed">{task.prompt}</p>
         </div>

         <div className="space-y-2">
           <label className="block text-sm font-medium text-slate-700 ml-1">Your Response</label>
           <textarea 
              className="w-full h-96 p-5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-lg leading-relaxed shadow-sm resize-none font-serif"
              placeholder="Start typing here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
           />
         </div>

         <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-20">
            <div className="max-w-2xl mx-auto">
              <Button 
                onClick={handleSubmit} 
                className="w-full h-12 text-lg shadow-xl shadow-brand-500/20"
                disabled={content.length < 10}
              >
                Submit for Feedback
              </Button>
            </div>
         </div>
       </main>
    </div>
  );
};