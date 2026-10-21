'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AppSettings,
  BoxingWorkout,
  CompletedBoxingLog,
  CompletedNutritionLog,
  CompletedSessionLog,
  MealSystem,
  WalkingSession,
  WorkoutSystem,
} from '@/lib/types';
import {
  localDb,
  DEFAULT_SETTINGS,
  DEFAULT_WORKOUT_SYSTEMS,
  DEFAULT_MEAL_SYSTEMS,
  DEFAULT_WALKING_SESSIONS,
  DEFAULT_WORKOUT_LOGS,
  DEFAULT_BOXING_WORKOUTS,
  DEFAULT_BOXING_LOGS,
  DEFAULT_NUTRITION_LOGS,
} from '@/lib/storage';
import { Navbar } from '@/components/Navbar';
import { BottomNav, ActiveTab } from '@/components/BottomNav';
import { RestTimer } from '@/components/RestTimer';
import { PWARegister } from '@/components/PWARegister';
import { WorkoutSystemView } from '@/components/workouts/WorkoutSystemView';
import { BoxingSystemView } from '@/components/boxing/BoxingSystemView';
import { MealSystemView } from '@/components/meals/MealSystemView';
import { HistoryView } from '@/components/history/HistoryView';
import { SettingsView } from '@/components/settings/SettingsView';
import { Sparkles, Check, Copy, FileText, Download, X, Dumbbell, UtensilsCrossed, Calendar } from 'lucide-react';
import {
  generateDailyReportText,
  generateGymReportText,
  generateNutritionReportText,
  getTodayDateKey,
  downloadLogsAsMarkdown,
  downloadLogsAsJSON,
} from '@/lib/export-ai';
import { soundManager } from '@/lib/sound';
import { APP_THEMES } from '@/lib/themes';

export function GymApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('workouts');

  // Core App State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [workoutSystems, setWorkoutSystems] = useState<WorkoutSystem[]>(DEFAULT_WORKOUT_SYSTEMS);
  const [boxingWorkouts, setBoxingWorkouts] = useState<BoxingWorkout[]>(DEFAULT_BOXING_WORKOUTS);
  const [boxingLogs, setBoxingLogs] = useState<CompletedBoxingLog[]>(DEFAULT_BOXING_LOGS);
  const [mealSystems, setMealSystems] = useState<MealSystem[]>(DEFAULT_MEAL_SYSTEMS);
  const [nutritionLogs, setNutritionLogs] = useState<CompletedNutritionLog[]>(DEFAULT_NUTRITION_LOGS);
  const [walkingSessions, setWalkingSessions] = useState<WalkingSession[]>(DEFAULT_WALKING_SESSIONS);
  const [workoutLogs, setWorkoutLogs] = useState<CompletedSessionLog[]>(DEFAULT_WORKOUT_LOGS);

  // Rest Timer State
  const [restTrigger, setRestTrigger] = useState<{ id: string; seconds: number } | null>(null);
  const [timerForceOpenTrigger, setTimerForceOpenTrigger] = useState<number>(0);

  // Active workout session status (for full-screen mobile workout focus)
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [isBoxingActive, setIsBoxingActive] = useState<boolean>(false);

  // AI Export Quick Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [copiedExportType, setCopiedExportType] = useState<'gym' | 'nutrition' | 'combined' | null>(null);

  // Load from Storage
  useEffect(() => {
    async function initData() {
      try {
        const [
          savedSettings,
          savedWorkouts,
          savedMeals,
          savedWalks,
          savedLogs,
          savedBoxingWorkouts,
          savedBoxingLogs,
          savedNutritionLogs,
        ] = await Promise.all([
          localDb.loadSettings(),
          localDb.loadWorkoutSystems(),
          localDb.loadMealSystems(),
          localDb.loadWalkingSessions(),
          localDb.loadWorkoutLogs(),
          localDb.loadBoxingWorkouts(),
          localDb.loadBoxingLogs(),
          localDb.loadNutritionLogs(),
        ]);

        setSettings(savedSettings);
        setWorkoutSystems(savedWorkouts);
        setMealSystems(savedMeals);
        setWalkingSessions(savedWalks);
        setWorkoutLogs(savedLogs);
        setBoxingWorkouts(savedBoxingWorkouts);
        setBoxingLogs(savedBoxingLogs);
        setNutritionLogs(savedNutritionLogs);

        // Request browser persistent storage lock to protect against phone storage cleaners
        localDb.requestPersistentStorage();
      } catch (e) {
        console.error('Error loading data', e);
      }
    }
    initData();
  }, []);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localDb.saveSettings(newSettings);
  };

  const handleUpdateWorkoutSystems = (newSystems: WorkoutSystem[]) => {
    setWorkoutSystems(newSystems);
    localDb.saveWorkoutSystems(newSystems);
  };

  const handleUpdateMealSystems = (newMeals: MealSystem[]) => {
    setMealSystems(newMeals);
    localDb.saveMealSystems(newMeals);
  };

  const handleUpdateWalkingSessions = (newWalks: WalkingSession[]) => {
    setWalkingSessions(newWalks);
    localDb.saveWalkingSessions(newWalks);
  };

  const handleSaveSessionLog = (log: CompletedSessionLog) => {
    const updated = [log, ...workoutLogs];
    setWorkoutLogs(updated);
    localDb.saveWorkoutLogs(updated);
  };

  const handleDeleteLog = (logId: string) => {
    const updated = workoutLogs.filter((l) => l.id !== logId);
    setWorkoutLogs(updated);
    localDb.saveWorkoutLogs(updated);
  };

  const handleUpdateBoxingWorkouts = (newBoxing: BoxingWorkout[]) => {
    setBoxingWorkouts(newBoxing);
    localDb.saveBoxingWorkouts(newBoxing);
  };

  const handleSaveBoxingLog = (log: CompletedBoxingLog) => {
    const updated = [log, ...boxingLogs];
    setBoxingLogs(updated);
    localDb.saveBoxingLogs(updated);
  };

  const handleDeleteBoxingLog = (logId: string) => {
    const updated = boxingLogs.filter((l) => l.id !== logId);
    setBoxingLogs(updated);
    localDb.saveBoxingLogs(updated);
  };

  const handleSaveNutritionLog = (log: CompletedNutritionLog) => {
    // Replace if same date already exists so finishing today updates today's entry cleanly
    const filtered = nutritionLogs.filter((n) => n.date !== log.date);
    const updated = [log, ...filtered];
    setNutritionLogs(updated);
    localDb.saveNutritionLogs(updated);
  };

  const handleDeleteNutritionLog = (logId: string) => {
    const updated = nutritionLogs.filter((n) => n.id !== logId);
    setNutritionLogs(updated);
    localDb.saveNutritionLogs(updated);
  };

  const handleRestoreFullData = async () => {
    const [
      savedSettings,
      savedWorkouts,
      savedMeals,
      savedWalks,
      savedLogs,
      savedBoxingWorkouts,
      savedBoxingLogs,
      savedNutritionLogs,
    ] = await Promise.all([
      localDb.loadSettings(),
      localDb.loadWorkoutSystems(),
      localDb.loadMealSystems(),
      localDb.loadWalkingSessions(),
      localDb.loadWorkoutLogs(),
      localDb.loadBoxingWorkouts(),
      localDb.loadBoxingLogs(),
      localDb.loadNutritionLogs(),
    ]);

    setSettings(savedSettings);
    setWorkoutSystems(savedWorkouts);
    setMealSystems(savedMeals);
    setWalkingSessions(savedWalks);
    setWorkoutLogs(savedLogs);
    setBoxingWorkouts(savedBoxingWorkouts);
    setBoxingLogs(savedBoxingLogs);
    setNutritionLogs(savedNutritionLogs);
  };

  const handleTriggerRestTimer = (seconds: number) => {
    if (settings.restTimerEnabled === false) return;
    setRestTrigger({
      id: `${Date.now()}`,
      seconds: seconds || settings.defaultRestSeconds || 90,
    });
  };

  const handleOpenTimer = () => {
    if (settings.restTimerEnabled === false) return;
    setTimerForceOpenTrigger(Date.now());
  };

  const isTimerEnabled = settings.restTimerEnabled !== false;
  const activeTheme =
    APP_THEMES.find((t) => t.id === (settings.themeId || 'gold')) || APP_THEMES[0];

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--theme-accent', activeTheme.accent);
    root.style.setProperty('--theme-accent-light', activeTheme.accentLight);
    root.style.setProperty('--theme-accent-hover', activeTheme.accentHover);
    root.style.setProperty('--theme-accent-dark', activeTheme.accentDark);
    root.style.setProperty('--theme-bg-base', activeTheme.bgBase);
    root.style.setProperty('--theme-bg-card', activeTheme.bgCard);
    root.style.setProperty('--theme-bg-surface', activeTheme.bgSurface);
    root.style.setProperty('--theme-bg-elevated', activeTheme.bgElevated);
  }, [activeTheme]);

  const currentSys = workoutSystems.find((s) => s.isCurrent) || workoutSystems[0];
  const activeDay = currentSys?.days[0];
  const pendingSets = activeDay
    ? activeDay.exercises.reduce(
        (acc, ex) => acc + ex.sets.filter((s) => !s.completed).length,
        0
      )
    : 0;

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-[#ededf0] flex flex-col font-sans selection:bg-[#d4b26f]/30 selection:text-[#fae5b5]">
      {/* PWA Service Worker */}
      <PWARegister />

      {/* Top Navbar */}
      <Navbar
        onOpenAIExport={() => setIsAIModalOpen(true)}
        onOpenTimer={isTimerEnabled ? handleOpenTimer : undefined}
        streakDays={workoutLogs.length + 3}
        currentThemeId={settings.themeId || 'gold'}
        onSelectTheme={(themeId) =>
          handleUpdateSettings({ ...settings, themeId })
        }
      />

      {/* Main View Area */}
      <main className="mx-auto w-full max-w-[430px] flex-1 px-3.5 pt-3.5">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'workouts' && (
            <motion.div
              key="workouts"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <WorkoutSystemView
                systems={workoutSystems}
                settings={settings}
                workoutLogs={workoutLogs}
                onUpdateSystems={handleUpdateWorkoutSystems}
                onSaveSessionLog={handleSaveSessionLog}
                onTriggerRestTimer={handleTriggerRestTimer}
                onOpenTimer={isTimerEnabled ? handleOpenTimer : undefined}
                onOpenAIExport={() => setIsAIModalOpen(true)}
                onActiveSessionChange={setIsWorkoutActive}
              />
            </motion.div>
          )}

          {activeTab === 'boxing' && (
            <motion.div
              key="boxing"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <BoxingSystemView
                workouts={boxingWorkouts}
                boxingLogs={boxingLogs}
                settings={settings}
                onUpdateWorkouts={handleUpdateBoxingWorkouts}
                onSaveBoxingLog={handleSaveBoxingLog}
                onDeleteBoxingLog={handleDeleteBoxingLog}
                onActiveSessionChange={setIsBoxingActive}
              />
            </motion.div>
          )}

          {activeTab === 'meals' && (
            <motion.div
              key="meals"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <MealSystemView
                mealSystems={mealSystems}
                walkingSessions={walkingSessions}
                nutritionLogs={nutritionLogs}
                settings={settings}
                onUpdateMealSystems={handleUpdateMealSystems}
                onUpdateWalkingSessions={handleUpdateWalkingSessions}
                onSaveNutritionLog={handleSaveNutritionLog}
                onDeleteNutritionLog={handleDeleteNutritionLog}
              />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <HistoryView
                logs={workoutLogs}
                boxingLogs={boxingLogs}
                nutritionLogs={nutritionLogs}
                mealSystems={mealSystems}
                workoutSystems={workoutSystems}
                walkingSessions={walkingSessions}
                settings={settings}
                onDeleteLog={handleDeleteLog}
                onDeleteBoxingLog={handleDeleteBoxingLog}
                onDeleteNutritionLog={handleDeleteNutritionLog}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <SettingsView
                settings={settings}
                workoutSystems={workoutSystems}
                mealSystems={mealSystems}
                walkingSessions={walkingSessions}
                workoutLogs={workoutLogs}
                boxingWorkouts={boxingWorkouts}
                boxingLogs={boxingLogs}
                onUpdateSettings={handleUpdateSettings}
                onRestoreFullData={handleRestoreFullData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Dynamic Rest Timer */}
      {isTimerEnabled && (
        <RestTimer
          initialSeconds={settings.defaultRestSeconds}
          restBetweenSetsSeconds={settings.restBetweenSetsSeconds ?? 90}
          restBetweenExercisesSeconds={settings.restBetweenExercisesSeconds ?? 150}
          soundEnabled={settings.soundEnabled}
          triggerStart={restTrigger}
          forceOpenTrigger={timerForceOpenTrigger}
          onSaveDefaultRestTimes={(setsSec, exercisesSec) => {
            handleUpdateSettings({
              ...settings,
              restBetweenSetsSeconds: setsSec,
              restBetweenExercisesSeconds: exercisesSec,
              defaultRestSeconds: setsSec,
            });
          }}
        />
      )}

      {/* Docked Mobile Navigation (hidden during active workout or active boxing session to give 100% focus and space to workout actions) */}
      {!(
        (isWorkoutActive && activeTab === 'workouts') ||
        (isBoxingActive && activeTab === 'boxing')
      ) && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          pendingSetsCount={pendingSets}
        />
      )}

      {/* AI Quick Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14141a] p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d4b26f]/15 text-[#d4b26f]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider">AI Training Export</h3>
              </div>
              <button
                onClick={() => setIsAIModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              Copy coach-ready reports instantly. Gym and Nutrition are fully decoupled so morning workouts never falsely report evening meals as skipped.
            </p>

            <div className="mt-4 space-y-2">
              {/* Button 1: Dedicated Pure Gym & Boxing Report */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = generateGymReportText({
                      dateKey: getTodayDateKey(),
                      userName: settings.userName,
                      unit: settings.weightUnit,
                      workoutLogs,
                      boxingLogs,
                      workoutSystems,
                    });
                    await navigator.clipboard.writeText(text);
                    setCopiedExportType('gym');
                    soundManager.playClickPop();
                    setTimeout(() => setCopiedExportType(null), 2200);
                  } catch {
                    // Fallback
                  }
                }}
                className="w-full flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-[#d4b26f] to-[#eed891] px-3.5 py-3 text-xs font-black uppercase text-black hover:opacity-95 active:scale-95 transition cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Dumbbell className="w-4 h-4 shrink-0 stroke-[2.5]" />
                  <span className="truncate">
                    {copiedExportType === 'gym' ? 'Gym Report Copied!' : 'Copy Gym & Boxing Report'}
                  </span>
                </div>
                {copiedExportType === 'gym' ? (
                  <Check className="w-4 h-4 stroke-[3] shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 shrink-0 opacity-70" />
                )}
              </button>

              {/* Button 2: Dedicated Pure Nutrition Report */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    const currentMealSys =
                      mealSystems.find((s) => s.isCurrent) || mealSystems[0] || null;
                    const text = generateNutritionReportText({
                      dateKey: getTodayDateKey(),
                      userName: settings.userName,
                      nutritionLogs,
                      currentMealSystem: currentMealSys,
                      walkingSessions,
                    });
                    await navigator.clipboard.writeText(text);
                    setCopiedExportType('nutrition');
                    soundManager.playClickPop();
                    setTimeout(() => setCopiedExportType(null), 2200);
                  } catch {
                    // Fallback
                  }
                }}
                className="w-full flex items-center justify-between gap-2 rounded-xl border border-[#70b8ff]/40 bg-[#70b8ff]/15 px-3.5 py-3 text-xs font-black uppercase text-[#9ed0ff] hover:bg-[#70b8ff]/25 active:scale-95 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <UtensilsCrossed className="w-4 h-4 shrink-0 stroke-[2.5]" />
                  <span className="truncate">
                    {copiedExportType === 'nutrition' ? 'Nutrition Copied!' : 'Copy Nutrition & Diet Report'}
                  </span>
                </div>
                {copiedExportType === 'nutrition' ? (
                  <Check className="w-4 h-4 stroke-[3] shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 shrink-0 opacity-70" />
                )}
              </button>

              {/* Button 3: Combined Full Day Report */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    const currentMealSys =
                      mealSystems.find((s) => s.isCurrent) || mealSystems[0] || null;
                    const text = generateDailyReportText({
                      dateKey: getTodayDateKey(),
                      userName: settings.userName,
                      unit: settings.weightUnit,
                      workoutLogs,
                      boxingLogs,
                      nutritionLogs,
                      currentMealSystem: currentMealSys,
                      workoutSystems,
                      walkingSessions,
                    });
                    await navigator.clipboard.writeText(text);
                    setCopiedExportType('combined');
                    soundManager.playClickPop();
                    setTimeout(() => setCopiedExportType(null), 2200);
                  } catch {
                    // Fallback
                  }
                }}
                className="w-full flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#1b1b22] px-3.5 py-2.5 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/[0.06] active:scale-95 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="w-4 h-4 shrink-0 text-[#d4b26f]" />
                  <span className="truncate">
                    {copiedExportType === 'combined' ? 'Combined Report Copied!' : 'Copy Full Day Report'}
                  </span>
                </div>
                {copiedExportType === 'combined' ? (
                  <Check className="w-4 h-4 stroke-[3] shrink-0 text-[#eed891]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 shrink-0 opacity-60" />
                )}
              </button>

              <button
                onClick={() => {
                  const currentMealSys =
                    mealSystems.find((s) => s.isCurrent) || mealSystems[0] || null;
                  downloadLogsAsMarkdown(
                    workoutLogs,
                    settings.userName,
                    settings.weightUnit,
                    boxingLogs,
                    nutritionLogs,
                    currentMealSys,
                    workoutSystems
                  );
                  soundManager.playClickPop();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#181820] py-2.5 text-xs font-bold text-zinc-200 hover:text-white cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#d4b26f]" />
                <span>Download Full Report (.md)</span>
              </button>

              <button
                onClick={() => {
                  downloadLogsAsJSON(
                    workoutLogs,
                    settings.userName,
                    boxingLogs,
                    nutritionLogs,
                    workoutSystems,
                    mealSystems
                  );
                  soundManager.playClickPop();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#181820] py-2.5 text-xs font-bold text-zinc-200 hover:text-white cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#eed891]" />
                <span>Download JSON Data</span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
              <button
                onClick={() => {
                  setIsAIModalOpen(false);
                  setActiveTab('history');
                }}
                className="text-[#eed891] hover:underline font-bold"
              >
                View Analytics & History →
              </button>

              <button
                onClick={() => setIsAIModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
