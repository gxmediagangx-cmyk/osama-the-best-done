'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AppSettings,
  BoxingDrill,
  BoxingMode,
  BoxingWorkout,
  CompletedBoxingLog,
} from '@/lib/types';
import {
  BoxingRoundTimer,
  ActiveBoxingTimerConfig,
  LiveBoxingTimerState,
} from './BoxingRoundTimer';
import { BoxingDrillCard } from './BoxingDrillCard';
import { AddBoxingDrillModal } from './AddBoxingDrillModal';
import { BoxingWorkoutEditorModal } from './BoxingWorkoutEditorModal';
import {
  Swords,
  Play,
  Plus,
  User,
  Users,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  Timer,
} from 'lucide-react';
import { formatSafeDate } from '@/lib/utils';
import { soundManager } from '@/lib/sound';

interface BoxingSystemViewProps {
  workouts: BoxingWorkout[];
  boxingLogs: CompletedBoxingLog[];
  settings: AppSettings;
  onUpdateWorkouts: (updated: BoxingWorkout[]) => void;
  onSaveBoxingLog: (log: CompletedBoxingLog) => void;
  onDeleteBoxingLog: (logId: string) => void;
  onActiveSessionChange?: (isActive: boolean) => void;
}

export const BoxingSystemView: React.FC<BoxingSystemViewProps> = ({
  workouts,
  boxingLogs,
  settings,
  onUpdateWorkouts,
  onSaveBoxingLog,
  onDeleteBoxingLog,
  onActiveSessionChange,
}) => {
  const [modeFilter, setModeFilter] = useState<'all' | BoxingMode>('all');
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [isAddDrillOpen, setIsAddDrillOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<BoxingWorkout | null>(null);
  const [isCreateWorkoutOpen, setIsCreateWorkoutOpen] = useState(false);
  const [timerConfig, setTimerConfig] = useState<ActiveBoxingTimerConfig | null>(null);
  const [forceOpenTimerTrigger, setForceOpenTimerTrigger] = useState<number | undefined>(
    undefined
  );
  const [liveTimerState, setLiveTimerState] = useState<LiveBoxingTimerState | null>(null);
  const [timerExternalCommand, setTimerExternalCommand] = useState<{
    id: string;
    action: 'togglePlay' | 'skipPhase' | 'adjustSeconds' | 'stop' | 'reset' | 'updateDurations';
    delta?: number;
    roundSeconds?: number;
    restSeconds?: number;
    changedField?: 'roundDurationSeconds' | 'restSeconds';
  } | null>(null);
  const [expandedHubWorkoutId, setExpandedHubWorkoutId] = useState<string | null>(null);

  // Completion modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(45);
  const [partnerName, setPartnerName] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');

  React.useEffect(() => {
    onActiveSessionChange?.(activeWorkoutId !== null);
  }, [activeWorkoutId, onActiveSessionChange]);

  const activeWorkout = workouts.find((w) => w.id === activeWorkoutId) || null;

  // Handlers for updating drills inside the active boxing workout
  const handleUpdateDrill = (updatedDrill: BoxingDrill) => {
    if (!activeWorkout) return;
    const nextDrills = activeWorkout.drills.map((d) =>
      d.id === updatedDrill.id ? updatedDrill : d
    );
    const nextWorkouts = workouts.map((w) =>
      w.id === activeWorkout.id ? { ...w, drills: nextDrills } : w
    );
    onUpdateWorkouts(nextWorkouts);
  };

  const handleDeleteDrill = (drillId: string) => {
    if (!activeWorkout) return;
    const nextDrills = activeWorkout.drills.filter((d) => d.id !== drillId);
    const nextWorkouts = workouts.map((w) =>
      w.id === activeWorkout.id ? { ...w, drills: nextDrills } : w
    );
    onUpdateWorkouts(nextWorkouts);
  };

  const handleAddDrill = (newDrill: BoxingDrill) => {
    if (!activeWorkout) return;
    const nextWorkouts = workouts.map((w) =>
      w.id === activeWorkout.id ? { ...w, drills: [...w.drills, newDrill] } : w
    );
    onUpdateWorkouts(nextWorkouts);
  };

  const handleMoveDrill = (
    workoutId: string,
    drillIndex: number,
    direction: 'up' | 'down'
  ) => {
    const nextWorkouts = workouts.map((w) => {
      if (w.id !== workoutId) return w;
      const targetIndex = direction === 'up' ? drillIndex - 1 : drillIndex + 1;
      if (targetIndex < 0 || targetIndex >= w.drills.length) return w;
      const nextDrills = [...w.drills];
      const [moved] = nextDrills.splice(drillIndex, 1);
      nextDrills.splice(targetIndex, 0, moved);
      return { ...w, drills: nextDrills };
    });
    soundManager.playClickPop();
    onUpdateWorkouts(nextWorkouts);
  };

  const handleResetAllRounds = () => {
    if (!activeWorkout) return;
    const nextDrills = activeWorkout.drills.map((d) => ({
      ...d,
      rounds: d.rounds.map((r) => ({ ...r, completed: false })),
    }));
    const nextWorkouts = workouts.map((w) =>
      w.id === activeWorkout.id ? { ...w, drills: nextDrills } : w
    );
    soundManager.playClickPop();
    onUpdateWorkouts(nextWorkouts);
  };

  // Adapt entire session between Solo (No Partner) and Partner mode with 1 tap!
  const handleSwitchEntireSessionMode = (targetMode: BoxingMode) => {
    if (!activeWorkout) return;
    const adaptedDrills = activeWorkout.drills.map((d) => {
      if (d.mode === targetMode) return d;
      const oldName = d.name;
      const oldCues = d.comboOrCues;
      const swappedName =
        d.partnerAlternativeName ||
        (targetMode === 'partner'
          ? `Partner Pads / Drill: ${d.name}`
          : `Solo Bag / Shadow: ${d.name}`);
      const swappedCues =
        d.partnerAlternativeCues ||
        (targetMode === 'partner'
          ? `${oldCues || '1-2-3-2'} (With partner catching & countering)`
          : `${oldCues || '1-2-3-2'} (Solo on heavy bag or shadowboxing)`);

      return {
        ...d,
        mode: targetMode,
        name: swappedName,
        comboOrCues: swappedCues,
        partnerAlternativeName: oldName,
        partnerAlternativeCues: oldCues,
      };
    });

    const nextWorkouts = workouts.map((w) =>
      w.id === activeWorkout.id ? { ...w, mode: targetMode, drills: adaptedDrills } : w
    );
    soundManager.playClickPop();
    onUpdateWorkouts(nextWorkouts);
  };

  // Auto-mark a round completed when the BoxingRoundTimer finishes a round
  const handleTimerRoundComplete = (drillId: string | undefined, roundNumber: number) => {
    if (!activeWorkout || !drillId) return;
    const nextDrills = activeWorkout.drills.map((d) => {
      if (d.id === drillId) {
        return {
          ...d,
          rounds: d.rounds.map((r) =>
            r.roundNumber === roundNumber ? { ...r, completed: true } : r
          ),
        };
      }
      return d;
    });
    const nextWorkouts = workouts.map((w) =>
      w.id === activeWorkout.id ? { ...w, drills: nextDrills } : w
    );
    onUpdateWorkouts(nextWorkouts);
  };

  const handleSaveOrCreateWorkout = (saved: BoxingWorkout) => {
    const exists = workouts.some((w) => w.id === saved.id);
    if (exists) {
      onUpdateWorkouts(workouts.map((w) => (w.id === saved.id ? saved : w)));
    } else {
      onUpdateWorkouts([saved, ...workouts]);
    }
  };

  const handleDeleteWorkout = (workoutId: string) => {
    if (workouts.length <= 1) return;
    onUpdateWorkouts(workouts.filter((w) => w.id !== workoutId));
    soundManager.playClickPop();
  };

  // ============================================================================
  // ACTIVE BOXING WORKOUT SESSION VIEW
  // ============================================================================
  if (activeWorkout) {
    const totalRounds = activeWorkout.drills.reduce((acc, d) => acc + d.rounds.length, 0);
    const completedRounds = activeWorkout.drills.reduce(
      (acc, d) => acc + d.rounds.filter((r) => r.completed).length,
      0
    );
    const progressPercent = totalRounds > 0 ? Math.round((completedRounds / totalRounds) * 100) : 0;

    const handleCompleteSession = () => {
      try {
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#d4b26f', '#eed891', '#ffffff', '#b38d45'],
        });
      } catch {
        // Ignore
      }

      soundManager.playBoxingBell();

      const log: CompletedBoxingLog = {
        id: `boxlog-${Date.now()}`,
        workoutId: activeWorkout.id,
        workoutName: activeWorkout.name,
        mode: activeWorkout.mode,
        partnerName:
          activeWorkout.mode === 'partner' && partnerName.trim()
            ? partnerName.trim()
            : undefined,
        completedAt: new Date().toISOString(),
        durationMinutes: sessionDurationMinutes,
        totalRoundsCompleted: completedRounds || totalRounds,
        totalDrillsCompleted: activeWorkout.drills.length,
        drills: activeWorkout.drills.map((d) => ({
          drillId: d.id,
          drillName: d.name,
          category: d.category,
          mode: d.mode,
          trackingMode: d.trackingMode || 'time',
          roundsCompleted: d.rounds.filter((r) => r.completed).length,
          totalRounds: d.rounds.length,
          roundDurationSeconds: d.roundDurationSeconds,
          comboOrCues: d.comboOrCues,
          notes: d.notes?.trim() || undefined,
          repsSummary:
            d.trackingMode === 'reps' || d.trackingMode === 'weight_reps'
              ? `${d.rounds.length} sets × ${d.defaultReps || d.rounds[0]?.reps || 15} reps${
                  d.defaultWeight ? ` @ ${d.defaultWeight}${settings.weightUnit || 'kg'}` : ''
                }`
              : d.trackingMode === 'weight'
              ? `${d.rounds.length} sets @ ${d.defaultWeight || d.rounds[0]?.weight || 0}${settings.weightUnit || 'kg'}`
              : undefined,
        })),
        userNotes: sessionNotes.trim() || undefined,
      };

      onSaveBoxingLog(log);

      // Automatically reset completed rounds AND delete temporary session notes for this workout,
      // so the next day when you workout again you start fresh with new notes!
      const resetDrills = activeWorkout.drills.map((d) => ({
        ...d,
        notes: undefined, // Deleted on save so next day has clean notes!
        rounds: d.rounds.map((r) => ({ ...r, completed: false })),
      }));
      const nextWorkouts = workouts.map((w) =>
        w.id === activeWorkout.id ? { ...w, drills: resetDrills } : w
      );
      onUpdateWorkouts(nextWorkouts);

      setShowCompleteModal(false);
      setActiveWorkoutId(null);
    };

    return (
      <div className="space-y-3.5 pb-36">
        {/* Top Controls Bar (Clean normal flow — never overlaps or covers the Active Boxing Session card below) */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => setActiveWorkoutId(null)}
            className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/10 bg-[#14141a] px-3 text-xs font-bold text-zinc-200 hover:text-white active:scale-95 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Boxing Hub</span>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            {settings.restTimerEnabled !== false && (
              <button
                type="button"
                onClick={() => setForceOpenTimerTrigger(Date.now())}
                className="flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border border-[#d4b26f]/40 bg-[#d4b26f]/15 px-2.5 text-xs font-bold text-[#eed891] hover:bg-[#d4b26f]/25 active:scale-95 transition cursor-pointer"
                title="Open Boxing Timer"
              >
                <Timer className="w-3.5 h-3.5 text-[#d4b26f] shrink-0" />
                <span>Timer</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetAllRounds}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#16161c] text-zinc-400 hover:text-white active:scale-95 transition cursor-pointer"
              title="Reset all round checkmarks"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsAddDrillOpen(true)}
              className="flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-xl bg-[#d4b26f] px-3 text-xs font-black uppercase tracking-tight text-black hover:bg-[#e2c487] active:scale-95 transition shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3] shrink-0" />
              <span>Drill</span>
            </button>
          </div>
        </div>

        {/* Session Header & Instant Solo <-> Partner Switcher */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#121217] p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#d4b26f]">
                  Active Boxing Session
                </span>
                <span className="rounded-md bg-[#181822] border border-white/10 px-2 py-0.5 font-mono text-[11px] font-bold text-[#eed891]">
                  {completedRounds}/{totalRounds} Rds ({progressPercent}%)
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white mt-1 leading-snug">
                {activeWorkout.name}
              </h1>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddDrillOpen(true)}
                className="flex items-center gap-1 rounded-xl border border-[#d4b26f]/40 bg-[#d4b26f]/15 px-3 py-1.5 text-xs font-bold text-[#eed891] hover:bg-[#d4b26f]/25 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
              <button
                type="button"
                onClick={() => setEditingWorkout(activeWorkout)}
                className="rounded-xl border border-white/10 bg-[#181822] px-3 py-1.5 text-xs font-bold text-zinc-200 hover:text-white shrink-0 cursor-pointer"
              >
                Edit Info
              </button>
            </div>
          </div>

          {/* Partner Status Toggle Bar */}
          <div className="mt-3.5 rounded-2xl border border-white/10 bg-[#181822] p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-white">
                Mode: {activeWorkout.mode === 'partner' ? 'With Partner' : 'Solo (No Partner)'}
              </span>
              <span className="text-xs text-zinc-400">
                1-tap drill converter
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSwitchEntireSessionMode('solo')}
                className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border text-xs sm:text-sm font-bold transition touch-manipulation cursor-pointer ${
                  activeWorkout.mode === 'solo'
                    ? 'border-[#d4b26f] bg-[#d4b26f] text-black font-black shadow-sm'
                    : 'border-white/10 bg-[#121218] text-zinc-300 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Solo Mode</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchEntireSessionMode('partner')}
                className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border text-xs sm:text-sm font-bold transition touch-manipulation cursor-pointer ${
                  activeWorkout.mode === 'partner'
                    ? 'border-[#d4b26f] bg-[#d4b26f] text-black font-black shadow-sm'
                    : 'border-white/10 bg-[#121218] text-zinc-300 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Partner Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating / Expandable Boxing Timer HUD (Hidden when idle & minimized, syncs with inline drill cards) */}
        {settings.restTimerEnabled !== false && (
          <BoxingRoundTimer
            soundEnabled={settings.soundEnabled}
            activeConfig={timerConfig}
            forceOpenTrigger={forceOpenTimerTrigger}
            defaultRoundSeconds={activeWorkout.defaultRoundSeconds}
            defaultRestSeconds={activeWorkout.defaultRestSeconds}
            onRoundComplete={handleTimerRoundComplete}
            onStateChange={setLiveTimerState}
            externalCommand={timerExternalCommand}
            onSaveDefaults={(roundSec, restSec) => {
              const targetDrillId = liveTimerState?.drillId;
              const nextWorkouts = workouts.map((w) => {
                if (w.id !== activeWorkout.id) return w;
                const nextDrills = targetDrillId
                  ? w.drills.map((d) =>
                      d.id === targetDrillId
                        ? {
                            ...d,
                            roundDurationSeconds: roundSec,
                            restSeconds: restSec,
                            rounds: d.rounds.map((r) => ({
                              ...r,
                              durationSeconds: roundSec,
                              restSeconds: restSec,
                            })),
                          }
                        : d
                    )
                  : w.drills;
                return {
                  ...w,
                  defaultRoundSeconds: roundSec,
                  defaultRestSeconds: restSec,
                  drills: nextDrills,
                };
              });
              onUpdateWorkouts(nextWorkouts);
            }}
          />
        )}

        {/* Boxing Drills List */}
        <div className="space-y-3">
          {activeWorkout.drills.map((drill, idx) => (
            <BoxingDrillCard
              key={drill.id}
              drill={drill}
              drillIndex={idx}
              totalDrills={activeWorkout.drills.length}
              weightUnit={settings.weightUnit || 'kg'}
              liveTimerState={settings.restTimerEnabled !== false ? liveTimerState : null}
              onUpdateDrill={handleUpdateDrill}
              onDeleteDrill={handleDeleteDrill}
              onMoveUp={() => handleMoveDrill(activeWorkout.id, idx, 'up')}
              onMoveDown={() => handleMoveDrill(activeWorkout.id, idx, 'down')}
              onStartDrillTimer={(d, startR, initialPhase = 'work') => {
                if (settings.restTimerEnabled === false) return;
                setTimerConfig({
                  id: `${d.id}-${Date.now()}`,
                  drillId: d.id,
                  drillName: d.name,
                  comboOrCues: d.comboOrCues,
                  totalRounds: d.rounds.length,
                  startRound: startR,
                  roundSeconds: d.roundDurationSeconds,
                  restSeconds: d.restSeconds,
                  initialPhase,
                });
              }}
              onTimerCommand={(action, delta, extra) => {
                setTimerExternalCommand({
                  id: `cmd-${Date.now()}-${Math.random()}`,
                  action,
                  delta,
                  ...extra,
                });
              }}
            />
          ))}
        </div>

        {/* Add Drill or Abs Exercise Button */}
        <div className="pt-2 pb-24">
          <button
            type="button"
            onClick={() => setIsAddDrillOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d4b26f]/40 bg-[#161622]/80 hover:bg-[#1f1f2e] hover:border-[#d4b26f] py-4 px-4 text-xs font-black uppercase tracking-wider text-[#eed891] transition active:scale-[0.99] cursor-pointer shadow-lg group"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#d4b26f]/20 text-[#d4b26f] group-hover:bg-[#d4b26f] group-hover:text-black transition">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span>+ Add Boxing Drill or Abs Exercise</span>
          </button>
        </div>

        {/* Docked Bottom Complete Boxing Session Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#0c0c10]/98 backdrop-blur-2xl px-3.5 pt-2.5 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-12px_36px_rgba(0,0,0,0.85)]">
          <div className="mx-auto max-w-lg">
            <button
              type="button"
              onClick={() => setShowCompleteModal(true)}
              className="flex h-12 w-full items-center justify-between gap-2 whitespace-nowrap rounded-2xl bg-[#d4b26f] px-3.5 text-xs font-black uppercase tracking-wide text-black shadow-xl hover:bg-[#e2c487] active:scale-[0.98] transition cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/15 text-black">
                  <Trophy className="h-4 w-4 stroke-[2.5]" />
                </div>
                <span className="truncate">Complete Boxing Session</span>
              </div>
              <span className="shrink-0 whitespace-nowrap rounded-lg bg-black/15 px-2.5 py-1 font-mono text-[11px] font-black text-black">
                {completedRounds}/{totalRounds} Rds Done →
              </span>
            </button>
          </div>
        </div>

        {/* Add Boxing Drill Modal */}
        <AddBoxingDrillModal
          isOpen={isAddDrillOpen}
          onClose={() => setIsAddDrillOpen(false)}
          onAddDrill={handleAddDrill}
          defaultMode={activeWorkout.mode}
        />

        {/* Edit Boxing Workout Modal */}
        <BoxingWorkoutEditorModal
          key={editingWorkout?.id || 'edit-active'}
          isOpen={!!editingWorkout}
          onClose={() => setEditingWorkout(null)}
          initialWorkout={editingWorkout}
          onSaveWorkout={handleSaveOrCreateWorkout}
          onDeleteWorkout={(id) => {
            handleDeleteWorkout(id);
            setActiveWorkoutId(null);
          }}
        />

        {/* Complete Session Modal */}
        {showCompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14141a] p-6 shadow-2xl text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4b26f] text-black">
                  <Trophy className="h-6 w-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black">Boxing Session Complete!</h3>
                  <p className="text-xs text-zinc-400">{activeWorkout.name}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={sessionDurationMinutes}
                    onChange={(e) => setSessionDurationMinutes(parseInt(e.target.value) || 45)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white font-mono focus:border-[#d4b26f] focus:outline-none"
                  />
                </div>

                {activeWorkout.mode === 'partner' && (
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Training Partner Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. Coach / Sparring Partner"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-[#d4b26f] focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Session Notes & Highlights
                  </label>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="e.g. Sharp pull-counters today, cardio held up strong in round 4..."
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-[#d4b26f] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCompleteSession}
                  className="flex-1 rounded-xl bg-[#d4b26f] py-2.5 text-xs font-black uppercase text-black hover:bg-[#e2c487]"
                >
                  Save Boxing Log
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // BOXING HUB VIEW (Routine Selection, Mode Switcher, Freestyle Timer & History)
  // ============================================================================
  const filteredWorkouts = workouts.filter(
    (w) => modeFilter === 'all' || w.mode === modeFilter
  );

  return (
    <div className="space-y-4 pb-32">
      {/* Hero Banner & New Routine CTA */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121217] p-4 sm:p-5 shadow-sm space-y-3.5">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#d4b26f] block">
            Boxing & Combat Training
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-1 leading-snug">
            Solo & Partner Boxing System
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
            Switch between Solo (bag, shadow, rope) and Partner (pads, drills, sparring)
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {settings.restTimerEnabled !== false && (
              <button
                type="button"
                onClick={() => setForceOpenTimerTrigger(Date.now())}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#d4b26f]/40 bg-[#d4b26f]/15 px-3.5 py-2 text-xs font-bold text-[#eed891] hover:bg-[#d4b26f]/25 active:scale-95 transition cursor-pointer"
                title="Open Boxing Timer"
              >
                <Timer className="w-4 h-4 text-[#d4b26f] shrink-0" />
                <span>Timer</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCreateWorkoutOpen(true)}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#d4b26f] px-3.5 py-2 text-xs font-black uppercase text-black hover:bg-[#e2c487] active:scale-95 transition shadow-md touch-manipulation cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span>New Routine</span>
            </button>
          </div>
        </div>

        {/* Mode Filter Segmented Control: All vs Solo vs Partner */}
        <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-[#0b0b0e] p-1.5 border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setModeFilter('all')}
            className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs sm:text-sm font-bold transition touch-manipulation cursor-pointer ${
              modeFilter === 'all'
                ? 'bg-[#d4b26f] text-black font-black shadow-sm'
                : 'bg-[#16161e] text-zinc-300 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5 shrink-0" />
            <span>All ({workouts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setModeFilter('solo')}
            className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs sm:text-sm font-bold transition touch-manipulation cursor-pointer ${
              modeFilter === 'solo'
                ? 'bg-[#d4b26f] text-black font-black shadow-sm'
                : 'bg-[#16161e] text-zinc-300 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span>Solo</span>
          </button>

          <button
            type="button"
            onClick={() => setModeFilter('partner')}
            className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs sm:text-sm font-bold transition touch-manipulation cursor-pointer ${
              modeFilter === 'partner'
                ? 'bg-[#d4b26f] text-black font-black shadow-sm'
                : 'bg-[#16161e] text-zinc-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Partner</span>
          </button>
        </div>
      </div>

      {/* Floating Boxing Timer HUD (Hidden until opened or running) */}
      {settings.restTimerEnabled !== false && (
        <BoxingRoundTimer
          soundEnabled={settings.soundEnabled}
          forceOpenTrigger={forceOpenTimerTrigger}
          defaultRoundSeconds={180}
          defaultRestSeconds={60}
        />
      )}

      {/* Boxing Routines List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
            Boxing Routines ({filteredWorkouts.length})
          </span>
          <span className="text-xs text-zinc-500">Tap Start to train</span>
        </div>

        {filteredWorkouts.map((workout) => {
          const totalRounds = workout.drills.reduce((acc, d) => acc + d.rounds.length, 0);
          const estMinutes = Math.round(
            workout.drills.reduce(
              (acc, d) =>
                acc + d.rounds.length * (d.roundDurationSeconds + d.restSeconds),
              0
            ) / 60
          );

          return (
            <div
              key={workout.id}
              className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121217] p-4 transition-all hover:border-[#d4b26f]/30 space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${
                      workout.mode === 'partner'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {workout.mode === 'partner' ? (
                      <>
                        <Users className="w-3 h-3" />
                        <span>With Partner</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3" />
                        <span>Solo · No Partner</span>
                      </>
                    )}
                  </span>

                  <span className="font-mono text-xs sm:text-sm font-semibold text-[#eed891]">
                    {workout.drills.length} drills · {totalRounds} rounds (~{estMinutes}m)
                  </span>
                </div>

                <h3 className="mt-2 text-base sm:text-lg font-bold text-white leading-snug">
                  {workout.name}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {workout.description}
                </p>
              </div>

              {/* Drill Pills Preview & Reorder Toggle */}
              <div className="border-t border-white/[0.05] pt-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                  <span className="text-zinc-400 font-medium">Included drills:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedHubWorkoutId(
                        expandedHubWorkoutId === workout.id ? null : workout.id
                      )
                    }
                    className="flex min-h-[36px] items-center gap-1 text-[#eed891] font-bold touch-manipulation cursor-pointer"
                  >
                    <span>
                      {expandedHubWorkoutId === workout.id
                        ? 'Done Ordering'
                        : 'View & Order Drills'}
                    </span>
                    {expandedHubWorkoutId === workout.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {expandedHubWorkoutId !== workout.id ? (
                  <div className="flex flex-wrap gap-1.5">
                    {workout.drills.map((d, dIdx) => (
                      <span
                        key={d.id}
                        className="rounded-lg bg-[#181822] border border-white/[0.06] px-2.5 py-1 text-xs text-zinc-200 font-medium"
                      >
                        {dIdx + 1}. {d.name} ({d.rounds.length}R)
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 animate-in fade-in">
                    {workout.drills.map((d, dIdx) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between gap-2.5 rounded-xl bg-[#181822] px-3 py-2.5 text-sm border border-white/[0.06]"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-zinc-100 block truncate">
                            {dIdx + 1}. {d.name}
                          </span>
                          <span className="font-mono text-xs text-zinc-400">
                            {d.rounds.length} rounds × {Math.floor(d.roundDurationSeconds / 60)}m ({d.mode})
                          </span>
                        </div>

                        {workout.drills.length > 1 && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={dIdx === 0}
                              onClick={() => handleMoveDrill(workout.id, dIdx, 'up')}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#121217] text-zinc-300 hover:text-[#d4b26f] disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition touch-manipulation cursor-pointer"
                              title="Move drill up"
                            >
                              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                            </button>
                            <button
                              type="button"
                              disabled={dIdx === workout.drills.length - 1}
                              onClick={() => handleMoveDrill(workout.id, dIdx, 'down')}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#121217] text-zinc-300 hover:text-[#d4b26f] disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition touch-manipulation cursor-pointer"
                              title="Move drill down"
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

              {/* Dedicated Mobile Action Row */}
              <div className="grid grid-cols-12 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingWorkout(workout)}
                  className="col-span-4 flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-[#181822] px-3 py-2.5 text-xs sm:text-sm font-bold text-zinc-200 hover:text-white hover:bg-zinc-800 active:scale-95 transition touch-manipulation cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-[#d4b26f] shrink-0" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveWorkoutId(workout.id);
                    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
                  }}
                  className="col-span-8 flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#d4b26f] px-4 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider text-black hover:bg-[#e2c487] active:scale-95 shadow-md transition touch-manipulation cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black stroke-none shrink-0" />
                  <span>Start Boxing Session</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Boxing Logs */}
      {boxingLogs.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="px-1 text-xs font-black uppercase tracking-wider text-zinc-400">
            Recent Boxing Logs ({boxingLogs.length})
          </div>

          {boxingLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#121217] p-3.5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${
                      log.mode === 'partner'
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-sky-500/15 text-sky-300'
                    }`}
                  >
                    {log.mode === 'partner' ? 'Partner' : 'Solo'}
                  </span>
                  <h4 className="truncate text-sm font-bold text-white">{log.workoutName}</h4>
                </div>
                <div className="mt-1 flex items-center gap-2 font-mono text-xs text-zinc-400">
                  <span suppressHydrationWarning>{formatSafeDate(log.completedAt)}</span>
                  <span>·</span>
                  <span className="text-[#eed891] font-bold">{log.totalRoundsCompleted} Rounds</span>
                  <span>·</span>
                  <span>{log.durationMinutes} min</span>
                  {log.partnerName && (
                    <>
                      <span>·</span>
                      <span>w/ {log.partnerName}</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteBoxingLog(log.id)}
                className="p-2 text-zinc-500 hover:text-rose-400"
                title="Delete boxing log"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create or Edit Boxing Routine Modal */}
      <BoxingWorkoutEditorModal
        key={editingWorkout?.id || (isCreateWorkoutOpen ? 'create-new' : 'closed')}
        isOpen={isCreateWorkoutOpen || !!editingWorkout}
        onClose={() => {
          setIsCreateWorkoutOpen(false);
          setEditingWorkout(null);
        }}
        initialWorkout={editingWorkout}
        onSaveWorkout={handleSaveOrCreateWorkout}
        onDeleteWorkout={workouts.length > 1 ? handleDeleteWorkout : undefined}
      />
    </div>
  );
};
