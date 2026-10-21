'use client';

import React, { useState } from 'react';
import {
  CompletedSessionLog,
  CompletedBoxingLog,
  CompletedNutritionLog,
  MealSystem,
  WalkingSession,
  WorkoutSystem,
  AppSettings,
} from '@/lib/types';
import {
  downloadLogsAsJSON,
  downloadLogsAsMarkdown,
  downloadLogsAsCSV,
  generateDailyReportText,
  generateGymReportText,
  generateNutritionReportText,
  getTodayDateKey,
  formatReadableDateKey,
} from '@/lib/export-ai';
import {
  Sparkles,
  Copy,
  Check,
  Dumbbell,
  Flame,
  UtensilsCrossed,
  Droplets,
  Trash2,
  FileText,
  FileCode,
  Table,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';
import { formatSafeDate, formatSafeNumber } from '@/lib/utils';
import { soundManager } from '@/lib/sound';

interface HistoryViewProps {
  logs: CompletedSessionLog[];
  boxingLogs?: CompletedBoxingLog[];
  nutritionLogs?: CompletedNutritionLog[];
  mealSystems?: MealSystem[];
  workoutSystems?: WorkoutSystem[];
  walkingSessions?: WalkingSession[];
  settings: AppSettings;
  onDeleteLog: (logId: string) => void;
  onDeleteBoxingLog?: (logId: string) => void;
  onDeleteNutritionLog?: (logId: string) => void;
}

function toLocalDateKey(isoOrDate: string): string {
  if (!isoOrDate) return getTodayDateKey();
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) return isoOrDate;
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return isoOrDate.slice(0, 10);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  logs,
  boxingLogs = [],
  nutritionLogs = [],
  mealSystems = [],
  workoutSystems = [],
  walkingSessions = [],
  settings,
  onDeleteLog,
  onDeleteBoxingLog,
  onDeleteNutritionLog,
}) => {
  const todayKey = getTodayDateKey();

  // Collect all unique date keys from workouts, boxing, nutrition, and today
  const allDateKeysSet = new Set<string>([todayKey]);
  logs.forEach((l) => allDateKeysSet.add(toLocalDateKey(l.completedAt)));
  boxingLogs.forEach((b) => allDateKeysSet.add(toLocalDateKey(b.completedAt)));
  nutritionLogs.forEach((n) => allDateKeysSet.add(n.date));
  const sortedDateKeys = Array.from(allDateKeysSet).sort((a, b) => b.localeCompare(a));

  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [copiedHistoryType, setCopiedHistoryType] = useState<'gym' | 'nutrition' | 'combined' | null>(null);
  const [showReportPreview, setShowReportPreview] = useState(true);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'gym' | 'boxing' | 'nutrition'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(logs[0]?.id || null);

  const unit = settings.weightUnit;
  const userName = settings.userName || 'Osama';
  const currentMealSystem = mealSystems.find((s) => s.isCurrent) || mealSystems[0] || null;

  const dailyReportText = generateDailyReportText({
    dateKey: selectedDateKey,
    userName,
    unit,
    workoutLogs: logs,
    boxingLogs,
    nutritionLogs,
    currentMealSystem,
    workoutSystems,
    walkingSessions,
  });

  const handleCopyGymReport = async () => {
    try {
      const text = generateGymReportText({
        dateKey: selectedDateKey,
        userName,
        unit,
        workoutLogs: logs,
        boxingLogs,
        workoutSystems,
      });
      await navigator.clipboard.writeText(text);
      setCopiedHistoryType('gym');
      soundManager.playClickPop();
      setTimeout(() => setCopiedHistoryType(null), 2200);
    } catch {
      // Fallback
    }
  };

  const handleCopyNutritionReport = async () => {
    try {
      const text = generateNutritionReportText({
        dateKey: selectedDateKey,
        userName,
        nutritionLogs,
        currentMealSystem,
        walkingSessions,
      });
      await navigator.clipboard.writeText(text);
      setCopiedHistoryType('nutrition');
      soundManager.playClickPop();
      setTimeout(() => setCopiedHistoryType(null), 2200);
    } catch {
      // Fallback
    }
  };

  const handleCopyDailyReport = async () => {
    try {
      const text = generateDailyReportText({
        dateKey: selectedDateKey,
        userName,
        unit,
        workoutLogs: logs,
        boxingLogs,
        nutritionLogs,
        currentMealSystem,
        workoutSystems,
        walkingSessions,
      });
      await navigator.clipboard.writeText(text);
      setCopiedHistoryType('combined');
      soundManager.playClickPop();
      setTimeout(() => setCopiedHistoryType(null), 2200);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-4 pb-32">
      {/* 3 Summary Telemetry Cards: Gym Workouts | Boxing Sessions | Nutrition Days */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-white/[0.07] bg-[#121217] p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Gym Done
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-white mt-0.5">
            {logs.length}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#121217] p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Boxing Done
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-[#eed891] mt-0.5">
            {boxingLogs.length}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#121217] p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Nutrition Days
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-[#70b8ff] mt-0.5">
            {nutritionLogs.length}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ONE-CLICK DAILY TEXT REPORT (Trainings Done/Missed + Meals + Water) */}
      {/* =================================================================== */}
      <div className="rounded-3xl border border-[#d4b26f]/30 bg-[#121217] p-4 sm:p-5 shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d4b26f]/15 text-[#d4b26f] border border-[#d4b26f]/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Daily Report Copy
              </h2>
              <p className="text-xs text-zinc-400">
                Trainings done &amp; missed, meals eaten &amp; forgotten, and water drank
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector Pills */}
        <div className="mt-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#d4b26f]" />
            <span>Select Day to Copy Report:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {sortedDateKeys.map((dKey) => {
              const isSelected = dKey === selectedDateKey;
              const isToday = dKey === todayKey;
              return (
                <button
                  key={dKey}
                  type="button"
                  onClick={() => {
                    soundManager.playClickPop();
                    setSelectedDateKey(dKey);
                  }}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#d4b26f] text-black font-black shadow-sm'
                      : 'border border-white/10 bg-[#181820] text-zinc-300 hover:text-white'
                  }`}
                >
                  {isToday ? `Today (${dKey.slice(5)})` : formatReadableDateKey(dKey)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Decoupled Report Copy Buttons */}
        <div className="mt-3.5 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* 1. Pure Gym Report */}
            <button
              type="button"
              onClick={handleCopyGymReport}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4b26f] to-[#eed891] py-3 px-3 text-xs font-black uppercase text-black hover:opacity-95 active:scale-[0.98] transition shadow-md cursor-pointer"
            >
              {copiedHistoryType === 'gym' ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Gym Report Copied!</span>
                </>
              ) : (
                <>
                  <Dumbbell className="w-4 h-4 stroke-[2.5]" />
                  <span>Copy Gym &amp; Boxing</span>
                </>
              )}
            </button>

            {/* 2. Pure Nutrition Report */}
            <button
              type="button"
              onClick={handleCopyNutritionReport}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#70b8ff]/40 bg-[#70b8ff]/15 py-3 px-3 text-xs font-black uppercase text-[#9ed0ff] hover:bg-[#70b8ff]/25 active:scale-[0.98] transition shadow-md cursor-pointer"
            >
              {copiedHistoryType === 'nutrition' ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Nutrition Report Copied!</span>
                </>
              ) : (
                <>
                  <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
                  <span>Copy Nutrition Only</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* 3. Combined Full Day */}
            <button
              type="button"
              onClick={handleCopyDailyReport}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1b1b22] py-2.5 px-3 text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/[0.06] active:scale-[0.98] transition cursor-pointer"
            >
              {copiedHistoryType === 'combined' ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3] text-[#eed891]" />
                  <span>Combined Report Copied!</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5 text-[#d4b26f]" />
                  <span>Copy Full Day (Combined)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                downloadLogsAsMarkdown(
                  logs,
                  userName,
                  unit,
                  boxingLogs,
                  nutritionLogs,
                  currentMealSystem,
                  workoutSystems
                );
                soundManager.playClickPop();
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#181820] py-2.5 px-3 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#d4b26f]" />
              <span>Download Full Log (.MD)</span>
            </button>
          </div>
        </div>

        {/* Live Report Text Box so user can see & copy smoothly */}
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-xs">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                downloadLogsAsJSON(
                  logs,
                  userName,
                  boxingLogs,
                  nutritionLogs,
                  workoutSystems,
                  mealSystems
                );
                soundManager.playClickPop();
              }}
              className="flex items-center gap-1 text-zinc-400 hover:text-white py-1 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-[#d4b26f]" />
              <span>JSON</span>
            </button>
            <span className="text-zinc-700">·</span>
            <button
              type="button"
              onClick={() => {
                downloadLogsAsCSV(logs, unit);
                soundManager.playClickPop();
              }}
              className="flex items-center gap-1 text-zinc-400 hover:text-white py-1 cursor-pointer"
            >
              <Table className="w-3.5 h-3.5 text-[#eed891]" />
              <span>CSV</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowReportPreview(!showReportPreview)}
            className="text-[#eed891] font-bold hover:underline flex items-center gap-1 py-1 cursor-pointer"
          >
            <span>{showReportPreview ? 'Hide Text Report' : 'Show Text Report'}</span>
            {showReportPreview ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {showReportPreview && (
          <div className="mt-2.5 rounded-2xl border border-white/10 bg-[#0b0b0e] p-3.5 text-xs font-mono text-zinc-300 max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-mono text-[11px] sm:text-xs leading-relaxed">
              {dailyReportText}
            </pre>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* SAVED HISTORY TIMELINE BY CATEGORY                                  */}
      {/* =================================================================== */}
      <div className="grid grid-cols-4 gap-1 rounded-xl bg-[#121217] p-1 border border-white/[0.06]">
        {(['all', 'gym', 'boxing', 'nutrition'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setHistoryFilter(tab)}
            className={`rounded-lg py-2 text-xs font-bold capitalize transition cursor-pointer ${
              historyFilter === tab
                ? 'bg-[#d4b26f] text-black font-extrabold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* GYM WORKOUT LOGS */}
      {(historyFilter === 'all' || historyFilter === 'gym') && (
        <div className="space-y-2.5">
          <div className="px-1 text-xs font-black uppercase tracking-wider text-zinc-400">
            Saved Gym Workouts ({logs.length})
          </div>

          {logs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
              No completed gym workouts yet. Hit &quot;Complete &amp; Save Workout&quot; to log one!
            </div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const dateStr = formatSafeDate(log.completedAt, { withWeekday: true });

              return (
                <div
                  key={log.id}
                  className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121217] transition-all"
                >
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="cursor-pointer flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#181820] text-[#d4b26f] font-mono text-xs border border-white/5">
                        <Dumbbell className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{log.dayTitle}</h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mt-0.5">
                          <span suppressHydrationWarning>{dateStr}</span>
                          <span className="text-zinc-600">·</span>
                          <span>{log.durationMinutes} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div
                          suppressHydrationWarning
                          className="font-mono text-sm font-black text-[#eed891]"
                        >
                          {formatSafeNumber(log.totalVolume)} {unit}
                        </div>
                        <div className="text-xs text-zinc-400 font-mono">
                          {log.totalSetsCompleted} sets
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLog(log.id);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-white/[0.05] bg-zinc-950/60 p-3.5 space-y-2 text-xs">
                      {log.userNotes && (
                        <div className="rounded-lg bg-zinc-900/60 p-2.5 text-xs text-zinc-300">
                          <strong>Notes:</strong> {log.userNotes}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        {log.exercises.map((ex, i) => {
                          const completedSets = ex.sets.filter((s) => s.completed);
                          const missedSets = ex.sets.length - completedSets.length;
                          const exCue =
                            ex.cues ||
                            workoutSystems
                              .flatMap((s) => s.days)
                              .flatMap((d) => d.exercises)
                              .find(
                                (e) =>
                                  e.id === ex.exerciseId ||
                                  e.name.toLowerCase() === ex.exerciseName.toLowerCase()
                              )?.cues;
                          const exNote = ex.notes;
                          return (
                            <div
                              key={i}
                              className="rounded-lg bg-zinc-900/40 px-3 py-2 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-zinc-200">
                                  {ex.exerciseName}
                                </span>
                                <span className="font-mono text-zinc-400 text-right">
                                  {completedSets.length > 0
                                    ? `${completedSets.length}/${ex.sets.length} sets (${completedSets[0].weight}${unit}×${completedSets[0].reps})`
                                    : `Skipped (0/${ex.sets.length} sets)`}
                                  {missedSets > 0 && completedSets.length > 0
                                    ? ` · ${missedSets} missed`
                                    : ''}
                                </span>
                              </div>
                              {exCue && (
                                <div className="text-[11px] text-[#eed891]/90">
                                  📌 <span className="font-medium">Cue:</span> {exCue}
                                </div>
                              )}
                              {exNote && (
                                <div className="text-[11px] text-sky-300/90">
                                  📝 <span className="font-medium">Today&apos;s Note:</span> {exNote}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* BOXING SESSION LOGS */}
      {(historyFilter === 'all' || historyFilter === 'boxing') && (
        <div className="space-y-2.5">
          <div className="px-1 text-xs font-black uppercase tracking-wider text-zinc-400">
            Saved Boxing Trainings ({boxingLogs.length})
          </div>

          {boxingLogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
              No completed boxing sessions yet. Hit &quot;Complete Boxing Session&quot; in the Boxing tab!
            </div>
          ) : (
            boxingLogs.map((bLog) => {
              const dateStr = formatSafeDate(bLog.completedAt, { withWeekday: true });
              return (
                <div
                  key={bLog.id}
                  className="rounded-2xl border border-white/[0.07] bg-[#121217] p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#181820] text-[#eed891] border border-white/5">
                        <Flame className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">
                          {bLog.workoutName}
                        </h4>
                        <div className="text-xs text-zinc-400 font-mono mt-0.5">
                          <span suppressHydrationWarning>{dateStr}</span> · {bLog.durationMinutes} min ·{' '}
                          <span className="text-[#eed891]">{bLog.totalRoundsCompleted} Rds</span>
                        </div>
                      </div>
                    </div>

                    {onDeleteBoxingLog && (
                      <button
                        type="button"
                        onClick={() => onDeleteBoxingLog(bLog.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 pt-1 border-t border-white/[0.05] text-xs">
                    {bLog.drills.map((d, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex items-center justify-between text-zinc-300">
                          <span className="truncate">{d.drillName}</span>
                          <span className="font-mono text-xs text-zinc-400 shrink-0 ml-2">
                            {d.repsSummary ? (
                              <span className="text-[#eed891] font-bold">{d.repsSummary}</span>
                            ) : (
                              `${d.roundsCompleted}/${d.totalRounds} Rds`
                            )}
                          </span>
                        </div>
                        {d.notes && (
                          <div className="text-[11px] text-sky-300/90 pl-1 flex items-start gap-1">
                            <span className="text-sky-400 shrink-0">📝</span>
                            <span className="italic leading-tight">{d.notes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* NUTRITION DAY LOGS */}
      {(historyFilter === 'all' || historyFilter === 'nutrition') && (
        <div className="space-y-2.5">
          <div className="px-1 text-xs font-black uppercase tracking-wider text-zinc-400">
            Saved Nutrition Days ({nutritionLogs.length})
          </div>

          {nutritionLogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
              No saved nutrition days yet. Hit &quot;Finish &amp; Save Nutrition Day&quot; in the Meals tab!
            </div>
          ) : (
            nutritionLogs.map((nLog) => {
              const eatenMeals = nLog.meals.filter((m) => m.completed);
              const missedMeals = nLog.meals.filter((m) => !m.completed);

              return (
                <div
                  key={nLog.id}
                  className="rounded-2xl border border-white/[0.07] bg-[#121217] p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#181820] text-[#70b8ff] border border-white/5">
                        <UtensilsCrossed className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {formatReadableDateKey(nLog.date)}
                        </h4>
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mt-0.5">
                          <span className="text-[#eed891]">
                            {nLog.mealsCompletedCount}/{nLog.totalMealsCount} Meals
                          </span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 text-[#70b8ff]">
                            <Droplets className="w-3 h-3" />
                            {nLog.waterGlasses}/{nLog.waterTarget} glasses
                          </span>
                        </div>
                      </div>
                    </div>

                    {onDeleteNutritionLog && (
                      <button
                        type="button"
                        onClick={() => onDeleteNutritionLog(nLog.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 pt-2 border-t border-white/[0.05] text-xs">
                    {eatenMeals.length > 0 && (
                      <div className="text-emerald-300">
                        <strong>Meals Eaten:</strong> {eatenMeals.map((m) => m.mealName).join(', ')}
                      </div>
                    )}
                    {missedMeals.length > 0 && (
                      <div className="text-rose-300">
                        <strong>Meals Forgot/Skipped:</strong>{' '}
                        {missedMeals.map((m) => m.mealName).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
