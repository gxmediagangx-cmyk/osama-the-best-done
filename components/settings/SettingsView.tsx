'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AppSettings,
  BoxingWorkout,
  CompletedBoxingLog,
  WorkoutSystem,
  MealSystem,
  WalkingSession,
  CompletedSessionLog,
} from '@/lib/types';
import { localDb } from '@/lib/storage';
import {
  Zap,
  Download,
  Upload,
  Check,
  Smartphone,
  ShieldCheck,
  Cloud,
  Palette,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { soundManager } from '@/lib/sound';
import { APP_THEMES } from '@/lib/themes';
import { AppThemeId } from '@/lib/types';
import { PWAInstallButton } from '@/components/PWAInstallButton';

interface SettingsViewProps {
  settings: AppSettings;
  workoutSystems: WorkoutSystem[];
  mealSystems: MealSystem[];
  walkingSessions: WalkingSession[];
  workoutLogs: CompletedSessionLog[];
  boxingWorkouts?: BoxingWorkout[];
  boxingLogs?: CompletedBoxingLog[];
  onUpdateSettings: (updated: AppSettings) => void;
  onRestoreFullData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  workoutSystems,
  mealSystems,
  walkingSessions,
  workoutLogs,
  boxingWorkouts,
  boxingLogs,
  onUpdateSettings,
  onRestoreFullData,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isPersisted, setIsPersisted] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localDb.isStoragePersisted().then((persisted) => {
      setIsPersisted(persisted);
    });
  }, []);

  const handleLockStorage = async () => {
    const granted = await localDb.requestPersistentStorage();
    setIsPersisted(granted);
    if (granted) {
      soundManager.playOverloadLevelUp();
    } else {
      soundManager.playClickPop();
    }
  };

  const isTimerEnabled = formData.restTimerEnabled !== false;

  const handleToggleTimerEnabled = (enabled: boolean) => {
    const next = { ...formData, restTimerEnabled: enabled };
    setFormData(next);
    onUpdateSettings(next);
    soundManager.playClickPop();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    soundManager.playClickPop();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportBackup = () => {
    localDb.exportFullBackup({
      settings: formData,
      workoutSystems,
      mealSystems,
      walkingSessions,
      workoutLogs,
      boxingWorkouts,
      boxingLogs,
    });
    soundManager.playClickPop();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = await localDb.importFullBackup(text);
      if (success) {
        soundManager.playOverloadLevelUp();
        setImportStatus('Backup restored successfully!');
        onRestoreFullData();
      } else {
        setImportStatus('Invalid backup file.');
      }
    } catch {
      setImportStatus('Error reading file.');
    }
  };

  const handleSelectTheme = (themeId: AppThemeId) => {
    const next = { ...formData, themeId };
    setFormData(next);
    onUpdateSettings(next);
    soundManager.playClickPop();
  };

  return (
    <div className="space-y-4 pb-32">
      {/* Download to Phone (PWA) Card */}
      <PWAInstallButton variant="card" />

      <form onSubmit={handleSave} className="space-y-4">
        {/* UI Color Themes & Appearance Card (10 Themes) */}
        <div className="rounded-2xl border border-[#d4b26f]/30 bg-[#121217] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#d4b26f]">
              <Palette className="w-4 h-4 stroke-[2.5]" />
              <span>UI Color Themes ({APP_THEMES.length} Styles)</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">Instant Switch</span>
          </div>
          <p className="text-xs text-zinc-400 mb-3">
            Tap any theme below whenever you get bored of the current UI colors
          </p>

          <div className="grid grid-cols-2 gap-2">
            {APP_THEMES.map((theme) => {
              const isSelected = (formData.themeId || 'gold') === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition active:scale-[0.98] cursor-pointer ${
                    isSelected
                      ? 'border-[#d4b26f] bg-[#d4b26f]/15 shadow-sm'
                      : 'border-white/[0.07] bg-[#181820] hover:border-white/20'
                  }`}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/20 shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${theme.accentLight}, ${theme.accent})`,
                    }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-black stroke-[3]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-extrabold text-white truncate">
                      {theme.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {theme.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#121217] p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wider text-[#d4b26f] mb-3">
            Profile & Units
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-300">User Name</label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-base font-bold text-white focus:outline-none focus:border-[#d4b26f]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300">Weight Unit</label>
              <select
                value={formData.weightUnit}
                onChange={(e) =>
                  setFormData({ ...formData, weightUnit: e.target.value as 'kg' | 'lbs' })
                }
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-base font-bold text-white focus:outline-none focus:border-[#d4b26f]"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Smart Progressive Overload Engine */}
        <div className="rounded-2xl border border-[#d4b26f]/25 bg-[#121217] p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#d4b26f] mb-1">
            <Zap className="w-4 h-4 stroke-[2.8]" />
            <span>Progressive Overload Rules</span>
          </div>
          <p className="text-xs text-zinc-400 mb-3">
            Steps up reps automatically until reaching ceiling, then prompts the weight jump
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="text-xs font-bold uppercase text-zinc-300">Rep Step</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.overloadRepStep}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    overloadRepStep: parseInt(e.target.value) || 2,
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 p-2.5 text-center font-mono text-base font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              />
              <span className="text-xs text-zinc-400 mt-1 block text-center">+{formData.overloadRepStep} reps</span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-300">Ceiling (Max)</label>
              <input
                type="number"
                min="4"
                max="30"
                value={formData.overloadRepCeiling}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    overloadRepCeiling: parseInt(e.target.value) || 12,
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 p-2.5 text-center font-mono text-base font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              />
              <span className="text-xs text-zinc-400 mt-1 block text-center">max {formData.overloadRepCeiling}r</span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-300">Reset Floor</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.overloadRepFloor}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    overloadRepFloor: parseInt(e.target.value) || 8,
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 p-2.5 text-center font-mono text-base font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              />
              <span className="text-xs text-zinc-400 mt-1 block text-center">reset to {formData.overloadRepFloor}r</span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-300">Weight Step</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="25"
                value={formData.overloadWeightStep}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    overloadWeightStep: parseFloat(e.target.value) || 2.5,
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 p-2.5 text-center font-mono text-base font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              />
              <span className="text-xs text-zinc-400 mt-1 block text-center">+{formData.overloadWeightStep} {formData.weightUnit}</span>
            </div>
          </div>
        </div>

        {/* Rest Timer Preferences */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#121217] p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#d4b26f]">
                Rest Timer & Feedback
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isTimerEnabled
                  ? 'Floating rest timer and workout timer buttons are active'
                  : 'Rest timer is completely turned off and hidden'}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isTimerEnabled}
              onClick={() => handleToggleTimerEnabled(!isTimerEnabled)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 touch-manipulation ${
                isTimerEnabled
                  ? 'border-[#d4b26f] bg-[#d4b26f]'
                  : 'border-white/15 bg-zinc-900'
              }`}
              title={isTimerEnabled ? 'Turn off rest timer' : 'Turn on rest timer'}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full transition-transform duration-200 ${
                  isTimerEnabled
                    ? 'translate-x-6 bg-black shadow-sm'
                    : 'translate-x-1 bg-zinc-400'
                }`}
              />
            </button>
          </div>

          <div className="space-y-4">
            {isTimerEnabled && (
              <>
                {/* Rest Between Sets */}
                <div className="pt-3 border-t border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-200">Rest Between Sets</label>
                    <span className="font-mono text-sm font-bold text-[#eed891]">{formData.restBetweenSetsSeconds ?? 90}s</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {[45, 60, 90, 120, 180].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, restBetweenSetsSeconds: s, defaultRestSeconds: s })}
                        className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition active:scale-95 ${
                          formData.restBetweenSetsSeconds === s
                            ? 'bg-[#d4b26f] text-black font-extrabold shadow-sm'
                            : 'border border-white/5 bg-[#181820] text-zinc-300 hover:text-white'
                        }`}
                      >
                        {s}s
                      </button>
                    ))}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <input
                        type="number"
                        min="10"
                        max="600"
                        step="5"
                        value={formData.restBetweenSetsSeconds ?? 90}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 60;
                          setFormData({ ...formData, restBetweenSetsSeconds: val, defaultRestSeconds: val });
                        }}
                        className="w-16 rounded-lg border border-white/10 bg-zinc-950 px-2 py-1.5 text-center font-mono text-sm font-bold text-white focus:border-[#d4b26f] focus:outline-none"
                      />
                      <span className="text-xs text-zinc-400">sec</span>
                    </div>
                  </div>
                </div>

                {/* Rest Between Exercises */}
                <div className="pt-3 border-t border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-200">Rest Between Exercises</label>
                    <span className="font-mono text-sm font-bold text-[#eed891]">{formData.restBetweenExercisesSeconds ?? 150}s</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {[90, 120, 150, 180, 240].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, restBetweenExercisesSeconds: s })}
                        className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition active:scale-95 ${
                          formData.restBetweenExercisesSeconds === s
                            ? 'bg-[#d4b26f] text-black font-extrabold shadow-sm'
                            : 'border border-white/5 bg-[#181820] text-zinc-300 hover:text-white'
                        }`}
                      >
                        {s}s
                      </button>
                    ))}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <input
                        type="number"
                        min="10"
                        max="600"
                        step="5"
                        value={formData.restBetweenExercisesSeconds ?? 150}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 120;
                          setFormData({ ...formData, restBetweenExercisesSeconds: val });
                        }}
                        className="w-16 rounded-lg border border-white/10 bg-zinc-950 px-2 py-1.5 text-center font-mono text-sm font-bold text-white focus:border-[#d4b26f] focus:outline-none"
                      />
                      <span className="text-xs text-zinc-400">sec</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="pt-3 border-t border-white/[0.05] space-y-3">
              {isTimerEnabled && (
                <label className="flex items-center justify-between cursor-pointer gap-3">
                  <span className="text-sm text-zinc-200">
                    Auto-start rest timer when checking a set
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.autoStartRestOnCheck}
                    onChange={(e) =>
                      setFormData({ ...formData, autoStartRestOnCheck: e.target.checked })
                    }
                    className="h-5 w-5 shrink-0 rounded accent-[#d4b26f]"
                  />
                </label>
              )}

              <label className="flex items-center justify-between cursor-pointer gap-3">
                <span className="text-sm text-zinc-200">
                  Audio bell chime alert when timer ends
                </span>
                <input
                  type="checkbox"
                  checked={formData.soundEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, soundEnabled: e.target.checked })
                  }
                  className="h-5 w-5 shrink-0 rounded accent-[#d4b26f]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer gap-3">
                <span className="text-sm text-zinc-200">
                  Haptic vibration pulses
                </span>
                <input
                  type="checkbox"
                  checked={formData.vibrateEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, vibrateEnabled: e.target.checked })
                  }
                  className="h-5 w-5 shrink-0 rounded accent-[#d4b26f]"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Daily Goals */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#121217] p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wider text-[#d4b26f] mb-2">
            Activity Targets
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300">Daily Steps Target</label>
            <input
              type="number"
              step="500"
              value={formData.dailyStepGoal}
              onChange={(e) =>
                setFormData({ ...formData, dailyStepGoal: parseInt(e.target.value) || 10000 })
              }
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-base font-mono font-bold text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#d4b26f] py-3.5 text-sm font-black uppercase text-black hover:bg-[#e2c487] active:scale-95 transition"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Saved!</span>
            </>
          ) : (
            <span>Save Preferences</span>
          )}
        </button>
      </form>

      {/* Guide for Osama */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#121217] p-4 shadow-sm">
        <div className="text-xs font-black uppercase tracking-wider text-[#d4b26f] mb-3">
          Architecture & Storage Protection
        </div>

        <div className="space-y-2.5 text-xs text-zinc-300 leading-relaxed">
          {/* Storage Protection Lock */}
          <div className="rounded-xl bg-zinc-950 p-3.5 border border-white/[0.04]">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <Lock className="w-4 h-4 text-[#d4b26f]" />
                <span>Phone Storage Protection Lock</span>
              </div>
              {isPersisted ? (
                <span className="flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <Check className="w-3 h-3 stroke-[3]" />
                  LOCKED
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleLockStorage}
                  className="rounded-lg bg-[#d4b26f] px-2.5 py-1 text-[11px] font-black text-black hover:bg-[#e2c487] active:scale-95 transition cursor-pointer"
                >
                  Enable Lock
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {isPersisted
                ? 'Persistent storage is active. Your phone browser guarantees your workouts and meal data will never be cleared by automatic storage sweeps.'
                : 'Locks your local database so phone cleaner apps and low-storage cleanup sweeps cannot delete your workout history.'}
            </p>
          </div>

          {/* Phone Manager Cleaner Guidance */}
          <div className="rounded-xl bg-zinc-950 p-3.5 border border-amber-500/20">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-300 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>How to Stop Phone Cleaners from Wiping Data</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mt-1">
              Phone cleaner apps (like Xiaomi Security Cleaner, Samsung Device Care, Clean Master, or Files by Google) aggressively treat browser caches as junk.
            </p>
            <div className="mt-2 space-y-1.5 text-[11px] text-zinc-300">
              <div className="rounded-lg bg-black/40 p-2 border border-white/5">
                <strong>1. Whitelist in Cleaner:</strong> Open your phone’s <em>Cleaner / Security App</em> → tap <em>Settings</em> (or long press Chrome/Safari) → choose <strong>&quot;Ignore List&quot;</strong> or <strong>&quot;Add to Whitelist&quot;</strong>.
              </div>
              <div className="rounded-lg bg-black/40 p-2 border border-white/5">
                <strong>2. Install to Home Screen:</strong> When installed as an app (PWA), your phone treats it as an application with dedicated persistent quota, not a temporary tab.
              </div>
              <div className="rounded-lg bg-black/40 p-2 border border-white/5">
                <strong>3. Regular Backups:</strong> Use the <em>Export Backup</em> button below once a month to keep a permanent JSON file in your files.
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-zinc-950 p-3.5 border border-white/[0.04]">
            <div className="flex items-center gap-2 font-bold text-sm text-white mb-1">
              <ShieldCheck className="w-4 h-4 text-[#d4b26f]" />
              <span>Local-First IndexedDB Engine (Active)</span>
            </div>
            <p className="text-xs text-zinc-400">
              Workouts, meals, and sets are stored locally on your device with 0ms latency. Operates 100% offline even in gym basements.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-950 p-3.5 border border-white/[0.04]">
            <div className="flex items-center gap-2 font-bold text-sm text-white mb-1">
              <Cloud className="w-4 h-4 text-[#eed891]" />
              <span>Cloud Sync (Firebase Firestore)</span>
            </div>
            <p className="text-xs text-zinc-400">
              Whenever you want multi-device synchronization (e.g. syncing between your phone and PC), we can connect your Firebase credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#121217] p-4 shadow-sm">
        <div className="text-xs font-black uppercase tracking-wider text-[#d4b26f] mb-1">
          Full Data Backup & Restore
        </div>
        <p className="text-xs text-zinc-400 mb-3">
          Download or import your entire gym history and programs as a single JSON file
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#181820] py-3 text-xs font-bold text-zinc-200 hover:text-white"
          >
            <Download className="w-4 h-4 text-[#d4b26f]" />
            <span>Export Backup</span>
          </button>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#181820] py-3 text-xs font-bold text-zinc-200 hover:text-white"
          >
            <Upload className="w-4 h-4 text-[#eed891]" />
            <span>Restore Backup</span>
          </button>
        </div>

        {importStatus && (
          <div className="mt-2.5 text-center text-xs font-semibold text-[#eed891]">
            {importStatus}
          </div>
        )}
      </div>
    </div>
  );
};
