import { useState } from 'react';
import { Plus, Check, Trash2, Target } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { cn } from '@/lib/utils';
import type { DailyTask } from '@/hooks/useGamification';

interface DailyTasksProps {
  tasks: DailyTask[];
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  className?: string;
}

export function DailyTasks({ 
  tasks, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask,
  className 
}: DailyTasksProps) {
  const [newTask, setNewTask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = tasks.filter(t => t.is_completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAddTask(newTask.trim());
      setNewTask('');
      setIsAdding(false);
    }
  };

  return (
    <GlassCard className={cn('', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Daily Tasks</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{tasks.length}
        </span>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto scrollbar-hide">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'group flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
              'bg-background/50 hover:bg-background/80',
              task.is_completed && 'opacity-60'
            )}
          >
            <button
              onClick={() => onToggleTask(task.id)}
              className={cn(
                'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                task.is_completed 
                  ? 'bg-success border-success' 
                  : 'border-muted-foreground hover:border-primary'
              )}
            >
              {task.is_completed && <Check className="w-3 h-3 text-success-foreground" />}
            </button>
            
            <span className={cn(
              'flex-1 text-sm transition-all',
              task.is_completed && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </span>

            <button
              onClick={() => onDeleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {tasks.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tasks yet. Add one to get started!
          </p>
        )}
      </div>

      {/* Add task */}
      {isAdding ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <GlassInput
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What's your focus today?"
            autoFocus
            className="flex-1"
          />
          <GlassButton type="submit" variant="primary" size="sm">
            Add
          </GlassButton>
          <GlassButton 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setIsAdding(false);
              setNewTask('');
            }}
          >
            Cancel
          </GlassButton>
        </form>
      ) : (
        <GlassButton
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </GlassButton>
      )}
    </GlassCard>
  );
}
