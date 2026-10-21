'use client';

import React, { useState } from 'react';
import {
  WorkoutSystem,
  WorkoutDay,
  AppSettings,
  CompletedSessionLog,
} from '@/lib/types';
import {
  Dumbbell,
  Play,
  Layers,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { formatSafeDate } from '@/lib/utils';
import { soundManager } from '@/lib/sound';
import { SystemEditorModal } from './SystemEditorModal';

interface WorkoutRoutineHubProps {
  systems: WorkoutSystem[];
  settings: AppSettings;
  workoutLogs: CompletedSessionLog[];
  onSelectDayToStart: (dayId: string, variant?: 'session1' | 'session2') => void;
  onUpdateSystems: (updated: WorkoutSystem[]) => void;
}

export const WorkoutRoutineHub: React.FC<WorkoutRoutineHubProps> = ({
  systems,
  settings,
  workoutLogs,
  onSelectDayToStart,
  onUpdateSystems,
}) => {
  const currentSystem = systems.find((s) => s.isCurrent) || systems[0] || null;
  const [isSystemEditorOpen, setIsSystemEditorOpen] = useState(false);
  const [isProgramPickerOpen, setIsProgramPickerOpen] = useState(false);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [renameExerciseName, setRenameExerciseName] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, 'session1' | 'session2'>>({});

  const getDayVariant = (day: WorkoutDay): 'session1' | 'session2' => {
    return selectedVariants[day.id] || day.activeVariant || 'session1';
  };

  if (!currentSystem) {
    return <div className="p-8 text-center text-zinc-500">No workout systems found.</div>;
  }

  const handleStartRename = (day: WorkoutDay) => {
    setEditingDayId(day.id);
    setRenameTitle(day.title);
  };

  const handleStartRenameExercise = (exId: string, currentName: string) => {
    setEditingExerciseId(exId);
    setRenameExerciseName(currentName);
    soundManager.playClickPop();
  };

  const handleSaveRenameExercise = (dayId: string, exId: string) => {
    if (!renameExerciseName.trim()) {
      setEditingExerciseId(null);
      return;
    }
    const updatedDays = currentSystem.days.map((d) => {
      if (d.id !== dayId) return d;
      return {
        ...d,
        exercises: d.exercises.map((e) =>
          e.id === exId ? { ...e, name: renameExerciseName.trim() } : e
        ),
      };
    });
    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    soundManager.playClickPop();
    onUpdateSystems(updatedSystems);
    setEditingExerciseId(null);
  };

  const handleSaveRename = (dayId: string) => {
    if (!renameTitle.trim()) {
      setEditingDayId(null);
      return;
    }
    const updatedDays = currentSystem.days.map((d) =>
      d.id === dayId ? { ...d, title: renameTitle.trim() } : d
    );
    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    soundManager.playClickPop();
    onUpdateSystems(updatedSystems);
    setEditingDayId(null);
  };

  const handleSelectSystem = (systemId: string) => {
    const updated = systems.map((s) => ({
      ...s,
      isCurrent: s.id === systemId,
    }));
    onUpdateSystems(updated);
    setIsProgramPickerOpen(false);
  };

  const handleMoveExerciseInDay = (
    dayId: string,
    exIndex: number,
    direction: 'up' | 'down'
  ) => {
    const updatedDays = currentSystem.days.map((d) => {
      if (d.id !== dayId) return d;
      const targetIndex = direction === 'up' ? exIndex - 1 : exIndex + 1;
      if (targetIndex < 0 || targetIndex >= d.exercises.length) return d;
      const nextExercises = [...d.exercises];
      const [moved] = nextExercises.splice(exIndex, 1);
      nextExercises.splice(targetIndex, 0, moved);
      return { ...d, exercises: nextExercises };
    });

    const updatedSystems = systems.map((s) =>
      s.id === currentSystem.id ? { ...s, days: updatedDays } : s
    );
    soundManager.playClickPop();
    onUpdateSystems(updatedSystems);
  };

  const getLastCompletedTime = (dayId: string) => {
    const matchingLog = workoutLogs.find((l) => l.dayId === dayId);
    if (!matchingLog) return null;

    const logDate = formatSafeDate(matchingLog.completedAt);
    return `Last: ${logDate}`;
  };

  return (
    <div className="space-y-4 pb-32">
      {/* App Cover Banner Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121217] shadow-xl group">
        <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/app-cover.jpg"
            alt="Osama The Best Cover"
            className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-[#121217]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#d4b26f]/20 border border-[#d4b26f]/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#eed891] backdrop-blur-md">
                Aesthetic Protocol
              </span>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-md mt-1">
                Osama The Best
              </h2>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-lg bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 text-[11px] font-bold text-zinc-300 drop-shadow">
                {currentSystem.days.length} Days Split
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Weekly Training Protocol Overview */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121217] p-3.5 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#d4b26f] flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4b26f]" />
            Weekly Split & Schedule
          </span>
          <span className="text-[10px] font-bold text-zinc-400">
            3 Core Gym Days • Dual Variations • Friday Boxing
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
          {[
            { day: 'Sun', tag: 'Chest A', color: 'border-[#d4b26f]/40 bg-[#d4b26f]/10 text-[#eed891]' },
            { day: 'Mon', tag: 'Arms A', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
            { day: 'Tue', tag: 'Legs', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
            { day: 'Wed', tag: 'Chest B', color: 'border-sky-500/30 bg-sky-500/10 text-sky-400' },
            { day: 'Thu', tag: 'Arms B*', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
            { day: 'Fri', tag: 'Boxing', color: 'border-red-500/30 bg-red-500/10 text-red-400' },
            { day: 'Sat', tag: 'Rest', color: 'border-zinc-700 bg-zinc-900/60 text-zinc-500' },
          ].map((item) => (
            <div
              key={item.day}
              className={`rounded-xl border p-1 sm:p-1.5 flex flex-col items-center justify-center min-h-[52px] ${item.color}`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider">{item.day}</span>
              <span className="text-[9px] font-bold leading-tight mt-0.5">{item.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Program Selector Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121217] p-4 sm:p-5 shadow-sm">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#d4b26f] block">
          Training Split
        </span>

        <button
          type="button"
          onClick={() => setIsProgramPickerOpen(true)}
          className="mt-1.5 flex w-full items-center justify-between gap-3 text-left group touch-manipulation cursor-pointer"
        >
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug group-hover:text-[#eed891] transition">
            {currentSystem.name}
          </span>
          <ChevronDown className="w-5 h-5 text-zinc-300 shrink-0" />
        </button>

        <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
          Select today&apos;s workout to start training
        </p>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setIsSystemEditorOpen(true)}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-[#d4b26f]/30 bg-[#181820] px-4 py-2 text-xs sm:text-sm font-bold text-zinc-100 hover:text-white hover:border-[#d4b26f]/60 hover:bg-zinc-800 transition touch-manipulation cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#d4b26f] shrink-0" />
            <span>Edit Split</span>
          </button>
        </div>
      </div>

      {/* Routine Days List */}
      <div className="space-y-3">
        <div className="px-1 space-y-0.5">
          <span className="block text-xs font-black uppercase tracking-wider text-zinc-400">
            Workouts ({currentSystem.days.length} Days)
          </span>
          <span className="block text-xs text-zinc-400">
            Pick any day to begin
          </span>
        </div>

        {currentSystem.days.map((day, idx) => {
          const activeVariant = getDayVariant(day);
          const visibleExercises = day.hasVariations
            ? day.exercises.filter((ex) => !ex.variant || ex.variant === 'both' || ex.variant === activeVariant)
            : day.exercises;
          const totalSets = visibleExercises.reduce((acc, e) => acc + e.sets.length, 0);
          const lastTrained = getLastCompletedTime(day.id);
          const isExpanded = expandedDayId === day.id;

          return (
            <div
              key={day.id}
              className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121217] transition-all hover:border-[#d4b26f]/30"
            >
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#181820] border border-[#d4b26f]/20 font-mono text-sm font-bold text-[#d4b26f]">
                      D{idx + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      {editingDayId === day.id ? (
                        <div className="flex items-center gap-1.5 py-0.5">
                          <input
                            type="text"
                            value={renameTitle}
                            onChange={(e) => setRenameTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(day.id);
                              if (e.key === 'Escape') setEditingDayId(null);
                            }}
                            autoFocus
                            placeholder="Workout Day Name..."
                            className="w-full rounded-xl border border-[#d4b26f] bg-black/80 px-2.5 py-1 text-xs sm:text-sm font-bold text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(day.id)}
                            className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-[#d4b26f] text-black hover:bg-[#e2c487] transition active:scale-95 shadow-sm"
                            title="Save title"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingDayId(null)}
                            className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:text-white transition"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                            {day.title}
                          </h3>
                          {day.hasVariations ? (
                            <span className="rounded bg-[#d4b26f]/15 border border-[#d4b26f]/30 px-1.5 py-0.5 font-mono text-[10px] font-black uppercase text-[#eed891]">
                              2x Weekly
                            </span>
                          ) : (
                            <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-zinc-400">
                              1x Weekly
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleStartRename(day)}
                            className="flex items-center gap-1 p-1 rounded-md text-zinc-500 hover:text-[#eed891] hover:bg-white/5 transition"
                            title="Rename workout day"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400 mt-1 flex-wrap">
                        <span>{visibleExercises.length} exercises</span>
                        <span className="text-zinc-600">·</span>
                        <span>{totalSets} sets</span>
                        {lastTrained && (
                          <>
                            <span className="text-zinc-600">·</span>
                            <span suppressHydrationWarning className="text-[#eed891] font-medium">{lastTrained}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectDayToStart(day.id, day.hasVariations ? activeVariant : undefined)}
                    className="flex min-h-[46px] min-w-[88px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#d4b26f] px-4 py-2.5 text-xs sm:text-sm font-black uppercase text-black hover:bg-[#e2c487] active:scale-95 shadow-md transition touch-manipulation cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-black stroke-none" />
                    <span>Start</span>
                  </button>
                </div>

                {/* Variation Switcher for 2x/week days */}
                {day.hasVariations && (
                  <div className="mt-3.5 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Session Variation:
                      </span>
                      <span className="text-[10px] font-bold text-[#eed891]">
                        Continuous Weight Overload
                      </span>
                    </div>
                    <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playClickPop();
                          setSelectedVariants((prev) => ({ ...prev, [day.id]: 'session1' }));
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer ${
                          activeVariant === 'session1'
                            ? 'bg-[#d4b26f] text-black shadow font-black'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{day.session1Label || 'Session 1 (Sunday)'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playClickPop();
                          setSelectedVariants((prev) => ({ ...prev, [day.id]: 'session2' }));
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer ${
                          activeVariant === 'session2'
                            ? 'bg-[#d4b26f] text-black shadow font-black'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{day.session2Label || 'Session 2 (Wednesday)'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Exercises preview */}
                <div className="mt-3.5 border-t border-white/[0.04] pt-2.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-zinc-400 font-medium">
                      {day.hasVariations
                        ? `Included (${activeVariant === 'session1' ? (day.session1Label || 'Session 1') : (day.session2Label || 'Session 2')}):`
                        : 'Included exercises:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedDayId(isExpanded ? null : day.id)}
                      className="flex min-h-[36px] items-center gap-1 text-[#eed891] font-bold touch-manipulation cursor-pointer"
                    >
                      <span>{isExpanded ? 'Done Ordering' : 'View & Order'}</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>

                  {!isExpanded && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {visibleExercises.slice(0, 5).map((ex) => (
                        <span
                          key={ex.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#181820] border border-white/[0.05] px-2.5 py-1 text-xs text-zinc-200 font-medium"
                        >
                          <span>{ex.name}</span>
                          {day.hasVariations && ex.variant && ex.variant !== 'both' && (
                            <span className="text-[10px] text-[#eed891] font-bold">
                              ({ex.variant === 'session1' ? 'S1' : 'S2'})
                            </span>
                          )}
                        </span>
                      ))}
                      {visibleExercises.length > 5 && (
                        <span className="rounded-lg bg-[#181820]/60 px-2.5 py-1 text-xs text-zinc-400 font-medium">
                          +{visibleExercises.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-2.5 space-y-2 animate-in fade-in">
                      {day.exercises.map((ex, eIdx) => (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between gap-2.5 rounded-xl bg-[#181820]/90 px-3 py-2.5 text-sm border border-white/[0.06]"
                        >
                          <div className="min-w-0 flex-1">
                            {editingExerciseId === ex.id ? (
                              <div className="flex items-center gap-1.5 w-full">
                                <input
                                  type="text"
                                  value={renameExerciseName}
                                  onChange={(e) => setRenameExerciseName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSaveRenameExercise(day.id, ex.id);
                                    } else if (e.key === 'Escape') {
                                      setEditingExerciseId(null);
                                    }
                                  }}
                                  autoFocus
                                  className="flex-1 min-w-0 rounded-lg border border-[#d4b26f] bg-zinc-950 px-2.5 py-1 text-xs sm:text-sm font-semibold text-white focus:outline-none"
                                  placeholder="Exercise name..."
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveRenameExercise(day.id, ex.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d4b26f] text-black hover:bg-[#e2c487] transition cursor-pointer shrink-0"
                                  title="Save exercise name"
                                  aria-label="Save exercise name"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingExerciseId(null)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer shrink-0"
                                  title="Cancel"
                                  aria-label="Cancel rename"
                                >
                                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5 group/ex">
                                  <span
                                    onClick={() => handleStartRenameExercise(ex.id, ex.name)}
                                    className="font-semibold text-zinc-100 truncate cursor-pointer hover:text-[#eed891] transition"
                                    title="Click to rename exercise"
                                  >
                                    {eIdx + 1}. {ex.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleStartRenameExercise(ex.id, ex.name)}
                                    className="p-1 rounded text-zinc-500 hover:text-[#eed891] opacity-60 group-hover/ex:opacity-100 transition cursor-pointer"
                                    title="Rename exercise"
                                    aria-label={`Rename ${ex.name}`}
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                </div>
                                <span className="font-mono text-xs text-zinc-400 block mt-0.5">
                                  {ex.targetSets} sets × {ex.targetReps}r @ {ex.defaultWeight}{settings.weightUnit}
                                </span>
                                {ex.cues && (
                                  <span className="text-[11px] text-[#eed891]/80 block truncate mt-0.5">
                                    📌 {ex.cues}
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          {day.exercises.length > 1 && editingExerciseId !== ex.id && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={eIdx === 0}
                                onClick={() => handleMoveExerciseInDay(day.id, eIdx, 'up')}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#121217] text-zinc-300 hover:text-[#d4b26f] disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition touch-manipulation cursor-pointer"
                                title="Move up"
                              >
                                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                              </button>
                              <button
                                type="button"
                                disabled={eIdx === day.exercises.length - 1}
                                onClick={() => handleMoveExerciseInDay(day.id, eIdx, 'down')}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#121217] text-zinc-300 hover:text-[#d4b26f] disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition touch-manipulation cursor-pointer"
                                title="Move down"
                              >
                                <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Program Switcher Modal */}
      {isProgramPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14141a] p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider">Select Training Split</h3>
              <button
                onClick={() => setIsProgramPickerOpen(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {systems.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSystem(s.id)}
                  className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition ${
                    s.isCurrent
                      ? 'bg-[#d4b26f]/15 border border-[#d4b26f]/40 text-[#eed891] font-bold'
                      : 'bg-zinc-900/60 border border-white/[0.04] text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{s.name}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{s.days.length} Days Split</div>
                  </div>
                  {s.isCurrent && <ChevronRight className="w-4 h-4 text-[#d4b26f]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit System Modal */}
      <SystemEditorModal
        isOpen={isSystemEditorOpen}
        onClose={() => setIsSystemEditorOpen(false)}
        system={currentSystem}
        onSaveSystem={(updated) => {
          const next = systems.map((s) => (s.id === updated.id ? updated : s));
          onUpdateSystems(next);
        }}
      />
    </div>
  );
};
