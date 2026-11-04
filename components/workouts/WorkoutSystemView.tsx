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
  const [activeDayId, setActiveDayId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('osama_active_workout_day_id') || null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [activeVariant, setActiveVariant] = useState<'session1' | 'session2'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('osama_active_workout_variant');
        if (saved === 'session1' || saved === 'session2') return saved;
      } catch {
        return 'session1';
      }
    }
    return 'session1';
  });

  const handleSelectActiveDay = (dayId: string | null, variant?: 'session1' | 'session2') => {
    setActiveDayId(dayId);
    if (variant) setActiveVariant(variant);
    if (typeof window !== 'undefined') {
      try {
        if (dayId) {
          localStorage.setItem('osama_active_workout_day_id', dayId);
        } else {
          localStorage.removeItem('osama_active_workout_day_id');
        }
        if (variant) {
          localStorage.setItem('osama_active_workout_variant', variant);
        }
      } catch {
        // Ignore storage errors
      }
    }
  };

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

  const handleMoveExercise = (exerciseIdOrIndex: string | number, direction: 'up' | 'down') => {
    if (!activeDay) return;
    const currentExercises = activeDay.exercises;
    let curIndex = -1;
    if (typeof exerciseIdOrIndex === 'string') {
      curIndex = currentExercises.findIndex((e) => e.id === exerciseIdOrIndex);
    } else {
      curIndex = exerciseIdOrIndex;
    }
    if (curIndex === -1 || curIndex >= currentExercises.length) return;

    let targetIndex = -1;
    if (activeDay.hasVariations) {
      const visible = currentExercises.filter(
        (ex) => !ex.variant || ex.variant === 'both' || ex.variant === activeVariant
      );
      const targetExId = currentExercises[curIndex].id;
      const vIdx = visible.findIndex((e) => e.id === targetExId);
      if (vIdx === -1) return;
      const targetVIdx = direction === 'up' ? vIdx - 1 : vIdx + 1;
      if (targetVIdx < 0 || targetVIdx >= visible.length) return;
      const adjacentEx = visible[targetVIdx];
      targetIndex = currentExercises.findIndex((e) => e.id === adjacentEx.id);
    } else {
      targetIndex = direction === 'up' ? curIndex - 1 : curIndex + 1;
    }

    if (targetIndex < 0 || targetIndex >= currentExercises.length || targetIndex === curIndex) return;

    const nextExercises = [...currentExercises];
    const [moved] = nextExercises.splice(curIndex, 1);
    nextExercises.splice(targetIndex, 0, moved);

    const updatedDays = currentSystem.days.map((d) =>
      d.id === activeDay.id ? { ...d, exercises: nextExercises } : d
    );

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

    // 2. Automatically reset completed sets and temporary session notes for this day in the split.
    // 1-WEEK CAUTION WARNING AUTO-DELETION RULE:
    // - If the user added or edited a warning during THIS session (ex.warningSessionLogId === log.id), PROTECT IT! Keep it!
    // - If the warning was created in a previous session and this is the matching day & variant cycle:
    //   (ex.warningCreatedDayId === activeDay.id && (!activeDay.hasVariations || ex.warningCreatedVariant === log.variant)),
    //   then this second completion of the same day completes the 1-week cycle -> AUTO-DELETE IT!
    // - Otherwise (e.g. warning created on Sunday, currently saving Wednesday), KEEP IT!
    if (activeDay) {
      const updatedDays = currentSystem.days.map((d) => {
        if (d.id === activeDay.id) {
          return {
            ...d,
            exercises: d.exercises.map((ex) => {
              let updatedWarning = ex.warning;
              let updatedWarningCreatedAt = ex.warningCreatedAt;
              let updatedWarningCreatedDayId = ex.warningCreatedDayId;
              let updatedWarningCreatedVariant = ex.warningCreatedVariant;
              let updatedWarningSessionLogId = ex.warningSessionLogId;

              if (ex.warning) {
                const isCreatedInThisSession = ex.warningSessionLogId === log.id;
                const isMatchingDay = !ex.warningCreatedDayId || ex.warningCreatedDayId === activeDay.id;
                const isMatchingVariant =
                  !activeDay.hasVariations ||
                  !ex.warningCreatedVariant ||
                  ex.warningCreatedVariant === log.variant;

                // Auto-delete only when it has lived across a full week cycle (not created in this session, and saving matching day)
                if (!isCreatedInThisSession && isMatchingDay && isMatchingVariant) {
                  updatedWarning = undefined;
                  updatedWarningCreatedAt = undefined;
                  updatedWarningCreatedDayId = undefined;
                  updatedWarningCreatedVariant = undefined;
                  updatedWarningSessionLogId = undefined;
                }
              }

              return {
                ...ex,
                notes: '', // Reset today's session note for the next workout!
                warning: updatedWarning,
                warningCreatedAt: updatedWarningCreatedAt,
                warningCreatedDayId: updatedWarningCreatedDayId,
                warningCreatedVariant: updatedWarningCreatedVariant,
                warningSessionLogId: updatedWarningSessionLogId,
                sets: ex.sets.map((s) => ({ ...s, completed: false })),
              };
            }),
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
          handleSelectActiveDay(null);
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
        handleSelectActiveDay(dayId, variant);
        if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
      }}
      onUpdateSystems={onUpdateSystems}
    />
  );
};
