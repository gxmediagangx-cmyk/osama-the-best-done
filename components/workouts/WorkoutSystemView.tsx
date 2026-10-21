'use client';

import React, { useState } from 'react';
import {
  WorkoutSystem,
  WorkoutDay,
  Exercise,
  AppSettings,
  CompletedSessionLog,
} from '@/lib/types';
import { WorkoutRoutineHub } from './WorkoutRoutineHub';
import { ActiveWorkoutSession } from './ActiveWorkoutSession';

interface WorkoutSystemViewProps {
  systems: WorkoutSystem[];
  settings: AppSettings;
  workoutLogs: CompletedSessionLog[];
  onUpdateSystems: (updated: WorkoutSystem[]) => void;
  onSaveSessionLog: (log: CompletedSessionLog) => void;
  onTriggerRestTimer: (seconds: number, label?: string) => void;
  onOpenTimer?: () => void;
  onOpenAIExport: () => void;
  onActiveSessionChange?: (isActive: boolean) => void;
}

export const WorkoutSystemView: React.FC<WorkoutSystemViewProps> = ({
  systems,
  settings,
  workoutLogs,
  onUpdateSystems,
  onSaveSessionLog,
  onTriggerRestTimer,
  onOpenTimer,
  onOpenAIExport,
  onActiveSessionChange,
}) => {
  const currentSystem = systems.find((s) => s.isCurrent) || systems[0] || null;
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [activeVariant, setActiveVariant] = useState<'session1' | 'session2'>('session1');

  // Notify parent if active session state changes
  React.useEffect(() => {
    onActiveSessionChange?.(activeDayId !== null);
  }, [activeDayId, onActiveSessionChange]);

  if (!currentSystem) {
    return <div className="p-8 text-center text-zinc-500">No workout systems found.</div>;
  }

  const activeDay = currentSystem.days.find((d) => d.id === activeDayId) || null;

  const handleUpdateExercise = (updatedEx: Exercise) => {
    if (!activeDay) return;
    const updatedDays = currentSystem.days.map((d) => {
      if (d.id === activeDay.id) {
        const nextExercises = d.exercises.map((e) =>
          e.id === updatedEx.id ? updatedEx : e
        );
        return { ...d, exercises: nextExercises };
      }
      return d;
    });

    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    onUpdateSystems(updatedSystems);
  };

  const handleDeleteExercise = (exId: string) => {
    if (!activeDay) return;
    const updatedDays = currentSystem.days.map((d) => {
      if (d.id === activeDay.id) {
        return {
          ...d,
          exercises: d.exercises.filter((e) => e.id !== exId),
        };
      }
      return d;
    });

    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    onUpdateSystems(updatedSystems);
  };

  const handleAddExercise = (newEx: Exercise) => {
    if (!activeDay) return;
    const updatedDays = currentSystem.days.map((d) => {
      if (d.id === activeDay.id) {
        return {
          ...d,
          exercises: [...d.exercises, newEx],
        };
      }
      return d;
    });

    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    onUpdateSystems(updatedSystems);
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (!activeDay) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeDay.exercises.length) return;

    const updatedDays = currentSystem.days.map((d) => {
      if (d.id === activeDay.id) {
        const nextExercises = [...d.exercises];
        const [moved] = nextExercises.splice(index, 1);
        nextExercises.splice(targetIndex, 0, moved);
        return {
          ...d,
          exercises: nextExercises,
        };
      }
      return d;
    });

    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    onUpdateSystems(updatedSystems);
  };

  const handleResetChecks = () => {
    if (!activeDay) return;
    const updatedDays = currentSystem.days.map((d) => {
      if (d.id === activeDay.id) {
        const uncheckExercises = d.exercises.map((ex) => ({
          ...ex,
          notes: '', // Clear temporary session notes on reset
          sets: ex.sets.map((s) => ({ ...s, completed: false })),
        }));
        return { ...d, exercises: uncheckExercises };
      }
      return d;
    });

    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    onUpdateSystems(updatedSystems);
  };

  const handleSaveWorkoutSession = (log: CompletedSessionLog) => {
    // 1. Save completed session log into history
    onSaveSessionLog(log);

    // 2. Automatically reset completed sets and temporary session notes for this day in the split,
    // so the next workout starts with fresh uncompleted sets and clean notes, keeping permanent cues intact!
    if (activeDay) {
      const updatedDays = currentSystem.days.map((d) => {
        if (d.id === activeDay.id) {
          return {
            ...d,
            exercises: d.exercises.map((ex) => ({
              ...ex,
              notes: '', // Reset today's session note for the next workout!
              sets: ex.sets.map((s) => ({ ...s, completed: false })),
            })),
          };
        }
        return d;
      });

      const updatedSystems = systems.map((s) =>
        s.id === currentSystem.id ? { ...s, days: updatedDays } : s
      );
      onUpdateSystems(updatedSystems);
    }
  };

  const handleRenameActiveDay = (newTitle: string) => {
    if (!activeDay || !newTitle.trim()) return;
    const updatedDays = currentSystem.days.map((d) => {
      if (d.id === activeDay.id) {
        return { ...d, title: newTitle.trim() };
      }
      return d;
    });

    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    onUpdateSystems(updatedSystems);
  };

  // If in an active session, render the dedicated ActiveWorkoutSession screen
  if (activeDay) {
    return (
      <ActiveWorkoutSession
        system={currentSystem}
        day={activeDay}
        initialVariant={activeVariant}
        settings={settings}
        onExit={() => {
          setActiveDayId(null);
          if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
        }}
        onRenameDay={handleRenameActiveDay}
        onUpdateExercise={handleUpdateExercise}
        onDeleteExercise={handleDeleteExercise}
        onAddExercise={handleAddExercise}
        onMoveExercise={handleMoveExercise}
        onResetChecks={handleResetChecks}
        onSaveSession={handleSaveWorkoutSession}
        onTriggerRestTimer={onTriggerRestTimer}
        onOpenTimer={onOpenTimer}
      />
    );
  }

  // Otherwise, render the Workout Routine Hub
  return (
    <WorkoutRoutineHub
      systems={systems}
      settings={settings}
      workoutLogs={workoutLogs}
      onSelectDayToStart={(dayId, variant) => {
        setActiveDayId(dayId);
        if (variant) setActiveVariant(variant);
        if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
      }}
      onUpdateSystems={onUpdateSystems}
    />
  );
};
