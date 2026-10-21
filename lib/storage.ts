import { get, set } from 'idb-keyval';
import {
  AppSettings,
  BoxingWorkout,
  CompletedBoxingLog,
  CompletedNutritionLog,
  CompletedSessionLog,
  MealSystem,
  WalkingSession,
  WorkoutSystem,
} from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Osama',
  weightUnit: 'kg',
  themeId: 'gold',
  overloadRepStep: 2,
  overloadRepCeiling: 12,
  overloadRepFloor: 8,
  overloadWeightStep: 2.5,
  restTimerEnabled: true,
  defaultRestSeconds: 90,
  restBetweenSetsSeconds: 90,
  restBetweenExercisesSeconds: 150,
  autoStartRestOnCheck: true,
  soundEnabled: true,
  vibrateEnabled: true,
  dailyStepGoal: 10000,
  dailyWaterGoalMl: 3000,
};

export const DEFAULT_WORKOUT_SYSTEMS: WorkoutSystem[] = [
  {
    id: 'system-aesthetic-4day',
    name: "Osama's High-Intensity Split",
    description: 'High-Intensity Schedule: Sunday: Chest & Back · Monday: Arms & Shoulders · Tuesday: Legs & Abs · Wednesday: Chest & Back · Thursday: Arms & Shoulders or Rest · Friday: Boxing · Saturday: Rest',
    isCurrent: true,
    createdAt: '2026-10-01',
    days: [
      {
        id: 'day-chest-back',
        title: 'Day 1: Chest & Back',
        description: 'Upper, Mid & Inner Chest + Lat Width, Mid-Back & Traps/Shoulder Prehab',
        order: 1,
        hasVariations: true,
        session1Label: 'Chest & Back A (Sunday)',
        session2Label: 'Chest & Back B (Wednesday)',
        activeVariant: 'session1',
        exercises: [
          // SHARED ACROSS BOTH SESSIONS: Flat Barbell Bench Press
          {
            id: 'ex-cb-flat-bench',
            name: 'Flat Barbell Bench Press',
            category: 'chest',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 60,
            variant: 'both',
            cues: 'Target: Mid Chest / Overall Mass • Grip: Pronated overhand grip (slightly wider than shoulder-width)',
            sets: [
              { id: 'set-cb-fb-1', setNumber: 1, weight: 60, reps: 10, completed: false },
              { id: 'set-cb-fb-2', setNumber: 2, weight: 60, reps: 10, completed: false },
              { id: 'set-cb-fb-3', setNumber: 3, weight: 60, reps: 10, completed: false },
            ],
          },
          // SHARED ACROSS BOTH SESSIONS: Medium-Grip Lat Pulldown
          {
            id: 'ex-cb-lat-pulldown',
            name: 'Medium-Grip Lat Pulldown',
            category: 'back',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 55,
            variant: 'both',
            cues: 'Target: Lat Width • Grip: Medium overhand grip on lat bar',
            sets: [
              { id: 'set-cb-lp-1', setNumber: 1, weight: 55, reps: 10, completed: false },
              { id: 'set-cb-lp-2', setNumber: 2, weight: 55, reps: 10, completed: false },
              { id: 'set-cb-lp-3', setNumber: 3, weight: 55, reps: 10, completed: false },
            ],
          },
          // SHARED ACROSS BOTH SESSIONS: Incline Dumbbell Press
          {
            id: 'ex-cb-incline-db',
            name: 'Incline Dumbbell Press',
            category: 'chest',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 24,
            variant: 'both',
            cues: 'Target: Upper Chest • Grip: Neutral to 45-degree pronated grip',
            sets: [
              { id: 'set-cb-id-1', setNumber: 1, weight: 24, reps: 10, completed: false },
              { id: 'set-cb-id-2', setNumber: 2, weight: 24, reps: 10, completed: false },
              { id: 'set-cb-id-3', setNumber: 3, weight: 24, reps: 10, completed: false },
            ],
          },
          // SESSION A ONLY (Sunday): Seated Cable Row (Close Neutral Grip)
          {
            id: 'ex-cb-row-close',
            name: 'Seated Cable Row (Close Neutral Grip)',
            category: 'back',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 50,
            variant: 'session1',
            cues: 'Target: Mid-Back Thickness • Grip: Neutral grip using close V-bar handle',
            sets: [
              { id: 'set-cb-rc-1', setNumber: 1, weight: 50, reps: 10, completed: false },
              { id: 'set-cb-rc-2', setNumber: 2, weight: 50, reps: 10, completed: false },
              { id: 'set-cb-rc-3', setNumber: 3, weight: 50, reps: 10, completed: false },
            ],
          },
          // SESSION B ONLY (Wednesday): Horizontal Machine Row
          {
            id: 'ex-cb-horiz-row',
            name: 'Horizontal Machine Row',
            category: 'back',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 50,
            variant: 'session2',
            cues: 'Target: Lat & Mid-Back Thickness • Grip: Neutral or overhand machine handles, chest against pad',
            sets: [
              { id: 'set-cb-hr-1', setNumber: 1, weight: 50, reps: 10, completed: false },
              { id: 'set-cb-hr-2', setNumber: 2, weight: 50, reps: 10, completed: false },
              { id: 'set-cb-hr-3', setNumber: 3, weight: 50, reps: 10, completed: false },
            ],
          },
          // SESSION B ONLY (Wednesday): Seated Cable Row (Wide Grip)
          {
            id: 'ex-cb-row-wide',
            name: 'Seated Cable Row (Wide Grip)',
            category: 'back',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 45,
            variant: 'session2',
            cues: 'Target: Upper Back, Rhomboids & Rear Delts • Grip: Pronated wide bar, pull to upper abdomen',
            sets: [
              { id: 'set-cb-rw-1', setNumber: 1, weight: 45, reps: 10, completed: false },
              { id: 'set-cb-rw-2', setNumber: 2, weight: 45, reps: 10, completed: false },
              { id: 'set-cb-rw-3', setNumber: 3, weight: 45, reps: 10, completed: false },
            ],
          },
          // SHARED ACROSS BOTH SESSIONS: Butterfly / Pec Deck
          {
            id: 'ex-cb-pec-deck',
            name: 'Butterfly / Pec Deck',
            category: 'chest',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 45,
            variant: 'both',
            cues: 'Target: Inner Chest & Pec Isolation • Grip: Neutral grip / forearm pads, full stretch and peak contraction',
            sets: [
              { id: 'set-cb-pd-1', setNumber: 1, weight: 45, reps: 12, completed: false },
              { id: 'set-cb-pd-2', setNumber: 2, weight: 45, reps: 12, completed: false },
              { id: 'set-cb-pd-3', setNumber: 3, weight: 45, reps: 12, completed: false },
            ],
          },
          // SESSION A ONLY (Sunday): Smith Machine Shrugs
          {
            id: 'ex-cb-shrugs',
            name: 'Smith Machine Shrugs',
            category: 'back',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 50,
            variant: 'session1',
            cues: 'Target: Upper Trapezius • Grip: Pronated overhand grip, elevate shoulders straight up to ears without rolling',
            sets: [
              { id: 'set-cb-sh-1', setNumber: 1, weight: 50, reps: 12, completed: false },
              { id: 'set-cb-sh-2', setNumber: 2, weight: 50, reps: 12, completed: false },
              { id: 'set-cb-sh-3', setNumber: 3, weight: 50, reps: 12, completed: false },
            ],
          },
          // SESSION A ONLY (Sunday): Rope Face Pulls
          {
            id: 'ex-cb-face-pulls',
            name: 'Rope Face Pulls',
            category: 'shoulders',
            targetSets: 3,
            targetReps: 15,
            defaultWeight: 25,
            variant: 'session1',
            cues: 'Target: Rear Delts & External Rotators • Grip: Neutral thumbs-back grip on rope, pulling towards eye level',
            sets: [
              { id: 'set-cb-fp-1', setNumber: 1, weight: 25, reps: 15, completed: false },
              { id: 'set-cb-fp-2', setNumber: 2, weight: 25, reps: 15, completed: false },
              { id: 'set-cb-fp-3', setNumber: 3, weight: 25, reps: 15, completed: false },
            ],
          },
          // SESSION B ONLY (Wednesday): Cable Y-Raise
          {
            id: 'ex-cb-y-raise',
            name: 'Cable Y-Raise',
            category: 'shoulders',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 10,
            variant: 'session2',
            cues: 'Target: Lower/Mid Traps & Side Delts • Grip: Cable cuffs or handles pulling diagonally upward in a Y shape',
            sets: [
              { id: 'set-cb-yr-1', setNumber: 1, weight: 10, reps: 12, completed: false },
              { id: 'set-cb-yr-2', setNumber: 2, weight: 10, reps: 12, completed: false },
              { id: 'set-cb-yr-3', setNumber: 3, weight: 10, reps: 12, completed: false },
            ],
          },
          // SESSION B ONLY (Wednesday): Cable External Rotation
          {
            id: 'ex-cb-ext-rot',
            name: 'Cable External Rotation',
            category: 'shoulders',
            targetSets: 3,
            targetReps: 15,
            defaultWeight: 7.5,
            variant: 'session2',
            cues: 'Target: Rotator Cuff & Infraspinatus • Grip: Elbow pinned to side at 90 degrees, rotate forearm outward',
            sets: [
              { id: 'set-cb-er-1', setNumber: 1, weight: 7.5, reps: 15, completed: false },
              { id: 'set-cb-er-2', setNumber: 2, weight: 7.5, reps: 15, completed: false },
              { id: 'set-cb-er-3', setNumber: 3, weight: 7.5, reps: 15, completed: false },
            ],
          },
        ],
      },
      {
        id: 'day-shoulders-arms',
        title: 'Day 2: Arms & Shoulders',
        description: 'Biceps, Triceps, Forearms + Shoulders (Front, Lateral, Rear Delts)',
        order: 2,
        hasVariations: true,
        session1Label: 'Arms & Shoulders A (Monday)',
        session2Label: 'Arms & Shoulders B (Thursday or Rest)',
        activeVariant: 'session1',
        exercises: [
          // SESSION A ONLY (Monday): Machine Shoulder Press
          {
            id: 'ex-sa-mach-press',
            name: 'Machine Shoulder Press',
            category: 'shoulders',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 35,
            variant: 'session1',
            cues: 'Target: Front Delts & Upper Chest • Grip: Neutral to 45-degree pronated grip',
            sets: [
              { id: 'set-sa-mp-1', setNumber: 1, weight: 35, reps: 10, completed: false },
              { id: 'set-sa-mp-2', setNumber: 2, weight: 35, reps: 10, completed: false },
              { id: 'set-sa-mp-3', setNumber: 3, weight: 35, reps: 10, completed: false },
            ],
          },
          // SHARED ACROSS BOTH SESSIONS: Dumbbell Lateral Raise
          {
            id: 'ex-sa-lat-raise',
            name: 'Dumbbell Lateral Raise',
            category: 'shoulders',
            targetSets: 4,
            targetReps: 12,
            defaultWeight: 10,
            variant: 'both',
            cues: 'Target: Side (Lateral) Delts • Grip: Neutral grip, lead with elbows slightly angled forward',
            sets: [
              { id: 'set-sa-lr-1', setNumber: 1, weight: 10, reps: 12, completed: false },
              { id: 'set-sa-lr-2', setNumber: 2, weight: 10, reps: 12, completed: false },
              { id: 'set-sa-lr-3', setNumber: 3, weight: 10, reps: 12, completed: false },
              { id: 'set-sa-lr-4', setNumber: 4, weight: 10, reps: 12, completed: false },
            ],
          },
          // SHARED ACROSS BOTH SESSIONS: Reverse Pec Deck
          {
            id: 'ex-sa-rev-pec-deck',
            name: 'Reverse Pec Deck',
            category: 'shoulders',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 30,
            variant: 'both',
            cues: 'Target: Rear Delts • Grip: Pronated overhand grip, driving back with elbows',
            sets: [
              { id: 'set-sa-rpd-1', setNumber: 1, weight: 30, reps: 12, completed: false },
              { id: 'set-sa-rpd-2', setNumber: 2, weight: 30, reps: 12, completed: false },
              { id: 'set-sa-rpd-3', setNumber: 3, weight: 30, reps: 12, completed: false },
            ],
          },
          // SESSION A ONLY (Monday): Preacher Curl Machine
          {
            id: 'ex-sa-preacher',
            name: 'Preacher Curl Machine',
            category: 'arms',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 25,
            variant: 'session1',
            cues: 'Target: Bicep Short Head & Peak • Grip: Underhand supinated grip on preacher pad',
            sets: [
              { id: 'set-sa-pc-1', setNumber: 1, weight: 25, reps: 10, completed: false },
              { id: 'set-sa-pc-2', setNumber: 2, weight: 25, reps: 10, completed: false },
              { id: 'set-sa-pc-3', setNumber: 3, weight: 25, reps: 10, completed: false },
            ],
          },
          // SESSION A ONLY (Monday): Behind-the-Body Single-Arm Cable Curl
          {
            id: 'ex-sa-behind-curl',
            name: 'Behind-the-Body Single-Arm Cable Curl',
            category: 'arms',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 12.5,
            variant: 'session1',
            cues: 'Target: Bicep Long Head (Max Stretch) • Grip: Low cable single handle, arm extended behind torso',
            sets: [
              { id: 'set-sa-bc-1', setNumber: 1, weight: 12.5, reps: 12, completed: false },
              { id: 'set-sa-bc-2', setNumber: 2, weight: 12.5, reps: 12, completed: false },
              { id: 'set-sa-bc-3', setNumber: 3, weight: 12.5, reps: 12, completed: false },
            ],
          },
          // SESSION B ONLY (Thursday): Straight-Bar Cable Curl
          {
            id: 'ex-sa-straight-curl',
            name: 'Straight-Bar Cable Curl',
            category: 'arms',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 22.5,
            variant: 'session2',
            cues: 'Target: Overall Bicep Mass • Grip: Supinated underhand straight bar grip',
            sets: [
              { id: 'set-sa-sbc-1', setNumber: 1, weight: 22.5, reps: 10, completed: false },
              { id: 'set-sa-sbc-2', setNumber: 2, weight: 22.5, reps: 10, completed: false },
              { id: 'set-sa-sbc-3', setNumber: 3, weight: 22.5, reps: 10, completed: false },
            ],
          },
          // SHARED ACROSS BOTH SESSIONS: Rope Hammer Curl
          {
            id: 'ex-sa-hammer-curl',
            name: 'Rope Hammer Curl',
            category: 'arms',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 17.5,
            variant: 'both',
            cues: 'Target: Brachialis & Forearm Thickness • Grip: Neutral grip (palms facing each other)',
            sets: [
              { id: 'set-sa-hc-1', setNumber: 1, weight: 17.5, reps: 12, completed: false },
              { id: 'set-sa-hc-2', setNumber: 2, weight: 17.5, reps: 12, completed: false },
              { id: 'set-sa-hc-3', setNumber: 3, weight: 17.5, reps: 12, completed: false },
            ],
          },
          // SHARED ACROSS BOTH SESSIONS: Rope Triceps Pushdown
          {
            id: 'ex-sa-tricep-pushdown',
            name: 'Rope Triceps Pushdown',
            category: 'arms',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 20,
            variant: 'both',
            cues: 'Target: Lateral & Medial Heads • Grip: Neutral grip on rope, locking out and flaring outward at bottom',
            sets: [
              { id: 'set-sa-tp-1', setNumber: 1, weight: 20, reps: 12, completed: false },
              { id: 'set-sa-tp-2', setNumber: 2, weight: 20, reps: 12, completed: false },
              { id: 'set-sa-tp-3', setNumber: 3, weight: 20, reps: 12, completed: false },
            ],
          },
          // SHARED ACROSS BOTH SESSIONS: Overhead Rope Triceps Extension
          {
            id: 'ex-sa-overhead-tricep',
            name: 'Overhead Rope Triceps Extension',
            category: 'arms',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 17.5,
            variant: 'both',
            cues: 'Target: Tricep Long Head • Grip: Neutral grip pulling rope overhead with elbows tucked',
            sets: [
              { id: 'set-sa-ot-1', setNumber: 1, weight: 17.5, reps: 12, completed: false },
              { id: 'set-sa-ot-2', setNumber: 2, weight: 17.5, reps: 12, completed: false },
              { id: 'set-sa-ot-3', setNumber: 3, weight: 17.5, reps: 12, completed: false },
            ],
          },
          // SESSION B ONLY (Thursday): Reverse-Grip Cable Curl
          {
            id: 'ex-sa-rev-curl',
            name: 'Reverse-Grip Cable Curl',
            category: 'arms',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 15,
            variant: 'session2',
            cues: 'Target: Brachioradialis & Forearm Extensors • Grip: Pronated overhand straight or EZ bar grip',
            sets: [
              { id: 'set-sa-rc-1', setNumber: 1, weight: 15, reps: 12, completed: false },
              { id: 'set-sa-rc-2', setNumber: 2, weight: 15, reps: 12, completed: false },
              { id: 'set-sa-rc-3', setNumber: 3, weight: 15, reps: 12, completed: false },
            ],
          },
          // SESSION B ONLY (Thursday): Behind-the-Back Cable Wrist Curl
          {
            id: 'ex-sa-behind-wrist',
            name: 'Behind-the-Back Cable Wrist Curl',
            category: 'arms',
            targetSets: 3,
            targetReps: 15,
            defaultWeight: 20,
            variant: 'session2',
            cues: 'Target: Forearm Flexors • Grip: Barbell or low cable held behind back, curl wrists upward',
            sets: [
              { id: 'set-sa-bw-1', setNumber: 1, weight: 20, reps: 15, completed: false },
              { id: 'set-sa-bw-2', setNumber: 2, weight: 20, reps: 15, completed: false },
              { id: 'set-sa-bw-3', setNumber: 3, weight: 20, reps: 15, completed: false },
            ],
          },
          // SESSION B ONLY (Thursday): Reverse Wrist Curl
          {
            id: 'ex-sa-rev-wrist',
            name: 'Reverse Wrist Curl',
            category: 'arms',
            targetSets: 3,
            targetReps: 15,
            defaultWeight: 12.5,
            variant: 'session2',
            cues: 'Target: Forearm Extensors & Wrist Stability • Grip: Overhand grip with forearms supported on bench or knees',
            sets: [
              { id: 'set-sa-rw-1', setNumber: 1, weight: 12.5, reps: 15, completed: false },
              { id: 'set-sa-rw-2', setNumber: 2, weight: 12.5, reps: 15, completed: false },
              { id: 'set-sa-rw-3', setNumber: 3, weight: 12.5, reps: 15, completed: false },
            ],
          },
        ],
      },
      {
        id: 'day-legs-abs',
        title: 'Day 3: Legs & Abs (Tuesday)',
        description: 'Complete Quad & Hamstring Mass, Calves & Full 4-Stage Core Routine',
        order: 3,
        hasVariations: false,
        exercises: [
          {
            id: 'ex-la-1',
            name: 'Leg Press',
            category: 'legs',
            targetSets: 4,
            targetReps: 10,
            defaultWeight: 120,
            cues: 'Target: Overall Quads & Glute Mass • Foot placement shoulder-width on footplate',
            sets: [
              { id: 'set-la1-1', setNumber: 1, weight: 120, reps: 10, completed: false },
              { id: 'set-la1-2', setNumber: 2, weight: 120, reps: 10, completed: false },
              { id: 'set-la1-3', setNumber: 3, weight: 120, reps: 10, completed: false },
              { id: 'set-la1-4', setNumber: 4, weight: 120, reps: 10, completed: false },
            ],
          },
          {
            id: 'ex-la-2',
            name: 'Romanian Deadlift',
            category: 'legs',
            targetSets: 4,
            targetReps: 10,
            defaultWeight: 60,
            cues: 'Target: Hamstrings & Glutes • Barbell or Dumbbells, hinge at hips with flat back',
            sets: [
              { id: 'set-la2-1', setNumber: 1, weight: 60, reps: 10, completed: false },
              { id: 'set-la2-2', setNumber: 2, weight: 60, reps: 10, completed: false },
              { id: 'set-la2-3', setNumber: 3, weight: 60, reps: 10, completed: false },
              { id: 'set-la2-4', setNumber: 4, weight: 60, reps: 10, completed: false },
            ],
          },
          {
            id: 'ex-la-3',
            name: 'Lying Leg Curl',
            category: 'legs',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 40,
            cues: 'Target: Hamstrings Knee Flexion • Hips pinned down to bench, slow negative',
            sets: [
              { id: 'set-la3-1', setNumber: 1, weight: 40, reps: 12, completed: false },
              { id: 'set-la3-2', setNumber: 2, weight: 40, reps: 12, completed: false },
              { id: 'set-la3-3', setNumber: 3, weight: 40, reps: 12, completed: false },
            ],
          },
          {
            id: 'ex-la-4',
            name: 'Leg Extension',
            category: 'legs',
            targetSets: 3,
            targetReps: 12,
            defaultWeight: 45,
            cues: 'Target: Quad Isolation & Peak Contraction • Lower shins pad, 1-sec squeeze at top',
            sets: [
              { id: 'set-la4-1', setNumber: 1, weight: 45, reps: 12, completed: false },
              { id: 'set-la4-2', setNumber: 2, weight: 45, reps: 12, completed: false },
              { id: 'set-la4-3', setNumber: 3, weight: 45, reps: 12, completed: false },
            ],
          },
          {
            id: 'ex-la-5',
            name: 'Standing Calf Raise',
            category: 'legs',
            targetSets: 3,
            targetReps: 15,
            defaultWeight: 40,
            cues: 'Target: Gastrocnemius (Upper Calf) • Full ankle extension and deep stretch at bottom',
            sets: [
              { id: 'set-la5-1', setNumber: 1, weight: 40, reps: 15, completed: false },
              { id: 'set-la5-2', setNumber: 2, weight: 40, reps: 15, completed: false },
              { id: 'set-la5-3', setNumber: 3, weight: 40, reps: 15, completed: false },
            ],
          },
          {
            id: 'ex-la-6',
            name: 'Seated Calf Raise',
            category: 'legs',
            targetSets: 3,
            targetReps: 15,
            defaultWeight: 35,
            cues: 'Target: Soleus (Calf Width) • Pad on knees, controlled 2-sec eccentric stretch',
            sets: [
              { id: 'set-la6-1', setNumber: 1, weight: 35, reps: 15, completed: false },
              { id: 'set-la6-2', setNumber: 2, weight: 35, reps: 15, completed: false },
              { id: 'set-la6-3', setNumber: 3, weight: 35, reps: 15, completed: false },
            ],
          },
          {
            id: 'ex-la-7',
            name: 'Cable Rope Crunch',
            category: 'core',
            targetSets: 3,
            targetReps: 15,
            defaultWeight: 30,
            cues: 'Target: Upper & Mid Rectus Abdominis • Kneeling or seated, crunch elbows to knees',
            sets: [
              { id: 'set-la7-1', setNumber: 1, weight: 30, reps: 15, completed: false },
              { id: 'set-la7-2', setNumber: 2, weight: 30, reps: 15, completed: false },
              { id: 'set-la7-3', setNumber: 3, weight: 30, reps: 15, completed: false },
            ],
          },
          {
            id: 'ex-la-8',
            name: 'Weighted Decline Crunch',
            category: 'core',
            targetSets: 3,
            targetReps: 15,
            defaultWeight: 10,
            cues: 'Target: Core Mass & Density • Holding weight plate flat against chest on decline bench',
            sets: [
              { id: 'set-la8-1', setNumber: 1, weight: 10, reps: 15, completed: false },
              { id: 'set-la8-2', setNumber: 2, weight: 10, reps: 15, completed: false },
              { id: 'set-la8-3', setNumber: 3, weight: 10, reps: 15, completed: false },
            ],
          },
          {
            id: 'ex-la-9',
            name: 'Leg Raises',
            category: 'core',
            targetSets: 3,
            targetReps: 15,
            defaultWeight: 0,
            notes: "Target: Lower Abs & Hip Flexors • Captain's Chair forearms supported or hanging bar",
            sets: [
              { id: 'set-la9-1', setNumber: 1, weight: 0, reps: 15, completed: false },
              { id: 'set-la9-2', setNumber: 2, weight: 0, reps: 15, completed: false },
              { id: 'set-la9-3', setNumber: 3, weight: 0, reps: 15, completed: false },
            ],
          },
          {
            id: 'ex-la-10',
            name: 'Russian Twists',
            category: 'core',
            targetSets: 3,
            targetReps: 20,
            defaultWeight: 10,
            cues: 'Target: Obliques & Rotational Core Stability • Torso at 45 degrees, rotate plate side to side',
            sets: [
              { id: 'set-la10-1', setNumber: 1, weight: 10, reps: 20, completed: false },
              { id: 'set-la10-2', setNumber: 2, weight: 10, reps: 20, completed: false },
              { id: 'set-la10-3', setNumber: 3, weight: 10, reps: 20, completed: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'system-ppl-3day',
    name: 'Classic Push / Pull / Legs (PPL)',
    description: 'Timeless 3-day foundation split that cycles through push, pull, and leg muscles.',
    isCurrent: false,
    createdAt: '2026-10-01',
    days: [
      {
        id: 'day-ppl-push',
        title: 'Push Day (Chest, Shoulders, Triceps)',
        order: 1,
        exercises: [
          {
            id: 'ex-flat-press',
            name: 'Dumbbell Flat Bench Press',
            category: 'chest',
            targetSets: 3,
            targetReps: 10,
            defaultWeight: 28,
            sets: [
              { id: 'set-p1', setNumber: 1, weight: 28, reps: 10, completed: false },
              { id: 'set-p2', setNumber: 2, weight: 28, reps: 10, completed: false },
              { id: 'set-p3', setNumber: 3, weight: 28, reps: 10, completed: false },
            ],
          },
        ],
      },
    ],
  },
];

import { DEFAULT_MEAL_SYSTEMS } from './default-meals';
export { DEFAULT_MEAL_SYSTEMS };

export const DEFAULT_WALKING_SESSIONS: WalkingSession[] = [
  {
    id: 'walk-1',
    date: '2026-10-05',
    time: '07:45 AM',
    label: 'Morning Sunlight Walk',
    durationMinutes: 25,
    steps: 2900,
    distanceKm: 2.1,
    notes: 'A brisk outdoor walk to clear mind and wake up.',
  },
  {
    id: 'walk-2',
    date: '2026-10-05',
    time: '01:45 PM',
    label: 'Post-Lunch Digestion Stroll',
    durationMinutes: 15,
    steps: 1750,
    distanceKm: 1.2,
    notes: 'Low intensity walk after meal 2 for blood glucose control.',
  },
];

export const DEFAULT_WORKOUT_LOGS: CompletedSessionLog[] = [
  {
    id: 'log-sample-1',
    systemId: 'system-aesthetic-4day',
    systemName: "Osama's Aesthetic Hypertrophy Split",
    dayId: 'day-push',
    dayTitle: 'Day 1: Chest, Shoulders & Triceps (Push)',
    completedAt: '2026-10-03T18:30:00.000Z',
    durationMinutes: 52,
    totalVolume: 4890,
    totalSetsCompleted: 13,
    totalRepsCompleted: 134,
    exercises: [
      {
        exerciseId: 'ex-incline-db',
        exerciseName: 'Incline Dumbbell Bench Press',
        category: 'chest',
        sets: [
          { setNumber: 1, weight: 26, reps: 10, completed: true },
          { setNumber: 2, weight: 26, reps: 10, completed: true },
          { setNumber: 3, weight: 26, reps: 10, completed: true },
        ],
      },
      {
        exerciseId: 'ex-lat-raise',
        exerciseName: 'Cable Lateral Raise',
        category: 'shoulders',
        sets: [
          { setNumber: 1, weight: 7.5, reps: 12, completed: true },
          { setNumber: 2, weight: 7.5, reps: 12, completed: true },
          { setNumber: 3, weight: 7.5, reps: 12, completed: true },
          { setNumber: 4, weight: 7.5, reps: 10, completed: true },
        ],
      },
    ],
    userNotes: 'Felt great energy. Cable laterals were burning. Ready to up weights next time.',
    overloadNotes: ['Incline DB: 26kg hit 10 reps across all sets. Ready for +2.5kg!'],
  },
];

export const DEFAULT_BOXING_WORKOUTS: BoxingWorkout[] = [
  {
    id: 'boxing-solo-bag-footwork',
    name: 'Boxing — Power, Speed, Fitness, and Abs',
    description: 'Friday Boxing: Jump Rope warm-up, Heavy-Bag Footwork, Cable Power Turns, Heavy-Bag Speed Bursts, Technique Combinations, Power Rounds, Fight-Pace Rounds, Battle-Rope Finisher, and Abs Circuit.',
    mode: 'solo',
    defaultRoundSeconds: 120,
    defaultRestSeconds: 60,
    drills: [
      {
        id: 'bdrill-fri-1',
        name: 'Jump Rope',
        category: 'warmup',
        mode: 'solo',
        roundDurationSeconds: 60,
        restSeconds: 30,
        intensity: 'fast',
        comboOrCues: 'Low jumps, relaxed shoulders, elbows close. Restart immediately after a trip.',
        notes: 'Low jumps, relaxed shoulders, elbows close. Restart immediately after a trip.',
        rounds: [
          {
            id: 'br-fri-1-1',
            roundNumber: 1,
            durationSeconds: 60,
            restSeconds: 30,
            completed: false,
            focusCombo: 'Round 1: Low jumps, relaxed shoulders, elbows close. Restart immediately after a trip.',
          },
          {
            id: 'br-fri-1-2',
            roundNumber: 2,
            durationSeconds: 60,
            restSeconds: 30,
            completed: false,
            focusCombo: 'Round 2: Low jumps, relaxed shoulders, elbows close. Restart immediately after a trip.',
          },
          {
            id: 'br-fri-1-3',
            roundNumber: 3,
            durationSeconds: 60,
            restSeconds: 30,
            completed: false,
            focusCombo: 'Round 3: Low jumps, relaxed shoulders, elbows close. Restart immediately after a trip.',
          },
        ],
      },
      {
        id: 'bdrill-fri-2',
        name: 'Heavy-Bag Footwork Warm-Up',
        category: 'bagwork',
        mode: 'solo',
        roundDurationSeconds: 120,
        restSeconds: 30,
        intensity: 'technical',
        comboOrCues: 'Round 1: Light jab and footwork | Round 2: Jab-cross while stepping in, then L-step out',
        notes: 'First round is light jab and footwork. Second round is jab-cross while stepping in, then L-step out. Keep hands at cheeks and chin down.',
        rounds: [
          {
            id: 'br-fri-2-1',
            roundNumber: 1,
            durationSeconds: 120,
            restSeconds: 30,
            completed: false,
            focusCombo: 'Round 1: Light jab and footwork. Keep hands at cheeks and chin down.',
          },
          {
            id: 'br-fri-2-2',
            roundNumber: 2,
            durationSeconds: 120,
            restSeconds: 30,
            completed: false,
            focusCombo: 'Round 2: Jab-cross while stepping in, then L-step out. Keep hands at cheeks and chin down.',
          },
        ],
      },
      {
        id: 'bdrill-fri-3',
        name: 'Cable Power Turns',
        category: 'conditioning',
        mode: 'solo',
        roundDurationSeconds: 30,
        restSeconds: 90,
        intensity: 'power',
        comboOrCues: 'Target: 5 controlled fast pulls each round | Turn hips and back foot first, then pull across like a hook',
        notes: 'Cable at chest height. Turn hips and back foot first, then pull across the body like a hook. Return slowly. Do not twist from the lower back.',
        rounds: [
          {
            id: 'br-fri-3-1',
            roundNumber: 1,
            durationSeconds: 30,
            restSeconds: 90,
            completed: false,
            focusCombo: 'Round 1 (Target: 5 controlled fast pulls): Cable at chest height. Turn hips and back foot first, pull across body like a hook. Return slowly.',
          },
          {
            id: 'br-fri-3-2',
            roundNumber: 2,
            durationSeconds: 30,
            restSeconds: 90,
            completed: false,
            focusCombo: 'Round 2 (Target: 5 controlled fast pulls): Cable at chest height. Turn hips and back foot first, pull across body like a hook. Return slowly.',
          },
          {
            id: 'br-fri-3-3',
            roundNumber: 3,
            durationSeconds: 30,
            restSeconds: 90,
            completed: false,
            focusCombo: 'Round 3 (Target: 5 controlled fast pulls): Cable at chest height. Turn hips and back foot first, pull across body like a hook. Return slowly.',
          },
          {
            id: 'br-fri-3-4',
            roundNumber: 4,
            durationSeconds: 30,
            restSeconds: 90,
            completed: false,
            focusCombo: 'Round 4 (Target: 5 controlled fast pulls): Cable at chest height. Turn hips and back foot first, pull across body like a hook. Return slowly.',
          },
        ],
      },
      {
        id: 'bdrill-fri-4',
        name: 'Heavy-Bag Speed Bursts',
        category: 'bagwork',
        mode: 'solo',
        roundDurationSeconds: 60,
        restSeconds: 60,
        intensity: 'fast',
        comboOrCues: 'Target: 4 bursts each round (~8s fast and light, then move and reset)',
        notes: 'Each burst is about 8 seconds fast and light, then move and reset. Do not push the bag or lock elbows.',
        rounds: [
          {
            id: 'br-fri-4-1',
            roundNumber: 1,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Round 1 (Target: 4 bursts): ~8 seconds fast and light, then move and reset. Do not push the bag or lock elbows.',
          },
          {
            id: 'br-fri-4-2',
            roundNumber: 2,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Round 2 (Target: 4 bursts): ~8 seconds fast and light, then move and reset. Do not push the bag or lock elbows.',
          },
          {
            id: 'br-fri-4-3',
            roundNumber: 3,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Round 3 (Target: 4 bursts): ~8 seconds fast and light, then move and reset. Do not push the bag or lock elbows.',
          },
        ],
      },
      {
        id: 'bdrill-fri-5',
        name: 'Heavy-Bag Technique Combinations',
        category: 'bagwork',
        mode: 'solo',
        roundDurationSeconds: 120,
        restSeconds: 60,
        intensity: 'technical',
        comboOrCues: 'R1: Jab → cross → L-step exit | R2: Jab → cross → lead hook → L-step exit | R3: Body jab → cross to head → L-step exit',
        notes: 'Medium power. Hit, exit, reset. The hand that is not punching stays at the chin.',
        rounds: [
          {
            id: 'br-fri-5-1',
            roundNumber: 1,
            durationSeconds: 120,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Round 1: Jab → cross → L-step exit. Medium power. Hit, exit, reset. Non-punching hand stays at chin.',
          },
          {
            id: 'br-fri-5-2',
            roundNumber: 2,
            durationSeconds: 120,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Round 2: Jab → cross → lead hook → L-step exit. Medium power. Hit, exit, reset. Non-punching hand stays at chin.',
          },
          {
            id: 'br-fri-5-3',
            roundNumber: 3,
            durationSeconds: 120,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Round 3: Body jab → cross to head → L-step exit. Medium power. Hit, exit, reset. Non-punching hand stays at chin.',
          },
        ],
      },
      {
        id: 'bdrill-fri-6',
        name: 'Heavy-Bag Power Rounds',
        category: 'bagwork',
        mode: 'solo',
        roundDurationSeconds: 120,
        restSeconds: 90,
        intensity: 'power',
        comboOrCues: 'R1: Cross → lead hook → cross → L-step exit | R2: Jab → cross → lead hook → L-step exit',
        notes: 'Hard but controlled punches. Power comes from legs, hips, and foot rotation—not arm swinging.',
        rounds: [
          {
            id: 'br-fri-6-1',
            roundNumber: 1,
            durationSeconds: 120,
            restSeconds: 90,
            completed: false,
            focusCombo: 'Round 1: Cross → lead hook → cross → L-step exit. Hard but controlled punches. Power from legs, hips, and foot rotation.',
          },
          {
            id: 'br-fri-6-2',
            roundNumber: 2,
            durationSeconds: 120,
            restSeconds: 90,
            completed: false,
            focusCombo: 'Round 2: Jab → cross → lead hook → L-step exit. Hard but controlled punches. Power from legs, hips, and foot rotation.',
          },
        ],
      },
      {
        id: 'bdrill-fri-7',
        name: 'Heavy-Bag Fight-Pace Rounds',
        category: 'bagwork',
        mode: 'solo',
        roundDurationSeconds: 120,
        restSeconds: 60,
        intensity: 'fast',
        comboOrCues: 'Target: 4 controlled 10-second bursts each round | Move with hands up, fast clean combinations',
        notes: 'Move around the bag with hands up. Use fast clean combinations in bursts, then reset and move. Speed and balance matter more than wild power.',
        rounds: [
          {
            id: 'br-fri-7-1',
            roundNumber: 1,
            durationSeconds: 120,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Round 1 (Target: 4 controlled 10s bursts): Move around bag with hands up. Fast clean combinations in bursts, then reset and move.',
          },
          {
            id: 'br-fri-7-2',
            roundNumber: 2,
            durationSeconds: 120,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Round 2 (Target: 4 controlled 10s bursts): Fast clean combinations, speed and balance over wild power. Reset and move.',
          },
        ],
      },
      {
        id: 'bdrill-fri-8',
        name: 'Battle-Rope Finisher',
        category: 'conditioning',
        mode: 'solo',
        roundDurationSeconds: 30,
        restSeconds: 60,
        intensity: 'conditioning',
        comboOrCues: 'Round 1: Alternating waves | Round 2: Double slams (30s work / 60s rest)',
        notes: 'Knees soft, back flat, chest up. Waves and slams come from legs and hips as well as arms.',
        rounds: [
          {
            id: 'br-fri-8-1',
            roundNumber: 1,
            durationSeconds: 30,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Round 1: Alternating waves. Knees soft, back flat, chest up. Waves come from legs and hips as well as arms.',
          },
          {
            id: 'br-fri-8-2',
            roundNumber: 2,
            durationSeconds: 30,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Round 2: Double slams. Knees soft, back flat, chest up. Slams come from legs and hips as well as arms.',
          },
        ],
      },
      {
        id: 'bdrill-fri-9',
        name: 'Decline-Bench Crunch',
        category: 'conditioning',
        mode: 'solo',
        trackingMode: 'reps',
        defaultReps: 15,
        roundDurationSeconds: 60,
        restSeconds: 60,
        intensity: 'conditioning',
        comboOrCues: '3 Sets · 15 Reps · Rest 60s between sets',
        notes: 'Feet secured. Curl ribs toward pelvis and lower slowly. Weight may be used when controlled.',
        rounds: [
          {
            id: 'br-fri-9-1',
            roundNumber: 1,
            reps: 15,
            targetReps: 15,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Set 1 (Target: 15 Reps): Feet secured. Curl ribs toward pelvis and lower slowly. Strict repetitions.',
          },
          {
            id: 'br-fri-9-2',
            roundNumber: 2,
            reps: 15,
            targetReps: 15,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Set 2 (Target: 15 Reps): Feet secured. Curl ribs toward pelvis, lower slowly. Weight optional when controlled.',
          },
          {
            id: 'br-fri-9-3',
            roundNumber: 3,
            reps: 15,
            targetReps: 15,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Set 3 (Target: 15 Reps): Full range curl, slow eccentric return. Strict repetitions, no momentum.',
          },
        ],
      },
      {
        id: 'bdrill-fri-10',
        name: 'Decline-Bench Russian Twist',
        category: 'conditioning',
        mode: 'solo',
        trackingMode: 'weight_reps',
        defaultWeight: 10,
        defaultReps: 20,
        roundDurationSeconds: 60,
        restSeconds: 60,
        intensity: 'conditioning',
        comboOrCues: '3 Sets · 10kg × 20 Reps · Rest 60s between sets',
        notes: 'Feet secured. Rotate chest and torso under control, not just the arms. Weight may be used when controlled.',
        rounds: [
          {
            id: 'br-fri-10-1',
            roundNumber: 1,
            weight: 10,
            reps: 20,
            targetWeight: 10,
            targetReps: 20,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Set 1 (Target: 10kg × 20 Reps): Feet secured. Rotate chest and torso under control, not just the arms.',
          },
          {
            id: 'br-fri-10-2',
            roundNumber: 2,
            weight: 10,
            reps: 20,
            targetWeight: 10,
            targetReps: 20,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Set 2 (Target: 10kg × 20 Reps): Controlled torso rotation with 10kg plate across midline.',
          },
          {
            id: 'br-fri-10-3',
            roundNumber: 3,
            weight: 10,
            reps: 20,
            targetWeight: 10,
            targetReps: 20,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Set 3 (Target: 10kg × 20 Reps): Deep oblique contraction, controlled rotation left and right.',
          },
        ],
      },
      {
        id: 'bdrill-fri-11',
        name: 'Flat-Bench Double Crunch',
        category: 'conditioning',
        mode: 'solo',
        trackingMode: 'reps',
        defaultReps: 15,
        roundDurationSeconds: 60,
        restSeconds: 60,
        intensity: 'conditioning',
        comboOrCues: '3 Sets · 15 Reps · Rest 60s between sets',
        notes: 'Bring knees toward chest while curling the upper body upward. Lower both parts slowly. This must stay flat, not decline.',
        rounds: [
          {
            id: 'br-fri-11-1',
            roundNumber: 1,
            reps: 15,
            targetReps: 15,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Set 1 (Target: 15 Reps): Bring knees toward chest while curling upper body upward. Flat bench only. Lower both parts slowly.',
          },
          {
            id: 'br-fri-11-2',
            roundNumber: 2,
            reps: 15,
            targetReps: 15,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Set 2 (Target: 15 Reps): Keep bench flat. Squeeze abs at the peak, then lower knees and shoulders under control.',
          },
          {
            id: 'br-fri-11-3',
            roundNumber: 3,
            reps: 15,
            targetReps: 15,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Set 3 (Target: 15 Reps): Strict repetitions, no momentum, complete abdominal focus.',
          },
        ],
      },
      {
        id: 'bdrill-fri-12',
        name: 'Floor Reverse Crunch / Knee Tuck',
        category: 'conditioning',
        mode: 'solo',
        trackingMode: 'reps',
        defaultReps: 15,
        roundDurationSeconds: 60,
        restSeconds: 60,
        intensity: 'conditioning',
        comboOrCues: '3 Sets · 15 Reps · Rest 60s between sets',
        notes: 'Bring knees toward chest, then gently curl the pelvis upward. Repetitions only; no hold and no swinging.',
        rounds: [
          {
            id: 'br-fri-12-1',
            roundNumber: 1,
            reps: 15,
            targetReps: 15,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Set 1 (Target: 15 Reps): Bring knees toward chest, gently curl pelvis upward. Repetitions only, no hold and no swinging.',
          },
          {
            id: 'br-fri-12-2',
            roundNumber: 2,
            reps: 15,
            targetReps: 15,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Set 2 (Target: 15 Reps): Gentle pelvic curl from lower abs. Smooth eccentric lower without touching heels down.',
          },
          {
            id: 'br-fri-12-3',
            roundNumber: 3,
            reps: 15,
            targetReps: 15,
            durationSeconds: 60,
            restSeconds: 60,
            completed: false,
            focusCombo: 'Set 3 (Target: 15 Reps): Strict repetitions only, controlled burn, no swinging.',
          },
        ],
      },
    ],
  },
  {
    id: 'boxing-partner-pads-drills',
    name: 'Partner Pads, Counter Drills & Technical Spar',
    description: 'Complete 2-person boxing session when training with a partner: mirror footwork, pad work combos, Dutch glove-to-glove drills, and controlled sparring.',
    mode: 'partner',
    defaultRoundSeconds: 180,
    defaultRestSeconds: 60,
    drills: [
      {
        id: 'bdrill-p1',
        name: 'Partner Distance Control & Mirror Footwork',
        category: 'footwork',
        mode: 'partner',
        roundDurationSeconds: 180,
        restSeconds: 60,
        intensity: 'technical',
        comboOrCues: 'Partner leads steps forward/back/lateral → Maintain exact 1-step fighting range without crossing feet.',
        partnerAlternativeName: 'Solo Cone / Line Agility Footwork',
        partnerAlternativeCues: 'In-and-out pendulum step + L-step pivots & angle cuts around center line.',
        rounds: [
          { id: 'br-p1-1', roundNumber: 1, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p1-2', roundNumber: 2, durationSeconds: 180, restSeconds: 60, completed: false },
        ],
      },
      {
        id: 'bdrill-p2',
        name: 'Pad / Mitt Work: Sharp Combos & Defense',
        category: 'padwork',
        mode: 'partner',
        roundDurationSeconds: 180,
        restSeconds: 60,
        intensity: 'fast',
        comboOrCues: '1-2-Slip-2-3-2 | Catch partner jab → return 2-3-2 | Pull-counter 2 on partner feint',
        partnerAlternativeName: 'Heavy Bag: Pull-Counter & Combo Flow',
        partnerAlternativeCues: 'Use bag swing to time pull-2-3-2 and slip-rip body combinations.',
        notes: 'Hit the center of the mitts with snap, not pushing.',
        rounds: [
          { id: 'br-p2-1', roundNumber: 1, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p2-2', roundNumber: 2, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p2-3', roundNumber: 3, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p2-4', roundNumber: 4, durationSeconds: 180, restSeconds: 60, completed: false },
        ],
      },
      {
        id: 'bdrill-p3',
        name: 'Glove-to-Glove Partner Counter Drills (Dutch Style)',
        category: 'partner-drill',
        mode: 'partner',
        roundDurationSeconds: 180,
        restSeconds: 60,
        intensity: 'technical',
        comboOrCues: 'A throws 1-2-3 to guard → B blocks & immediately fires 2-3-2 back → A rolls under & counters 3-2.',
        partnerAlternativeName: 'Double-End Bag / Reflex Defense Drill',
        partnerAlternativeCues: 'High guard tight blocks + 3-punch rapid combinations with head off-line.',
        notes: 'Keep tight high guard and eyes open when absorbing on the gloves.',
        rounds: [
          { id: 'br-p3-1', roundNumber: 1, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p3-2', roundNumber: 2, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p3-3', roundNumber: 3, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p3-4', roundNumber: 4, durationSeconds: 180, restSeconds: 60, completed: false },
        ],
      },
      {
        id: 'bdrill-p4',
        name: 'Technical / Controlled Sparring',
        category: 'sparring',
        mode: 'partner',
        roundDurationSeconds: 180,
        restSeconds: 60,
        intensity: 'technical',
        comboOrCues: 'R1: Lead hand (Jab/Lead Hook) only | R2-R3: Open technical sparring at 50% power, 100% speed & IQ',
        partnerAlternativeName: 'High-Pace Visualization Shadowboxing',
        partnerAlternativeCues: '3 rounds championship pace: feints, level changes, check hooks, and ring generalship.',
        rounds: [
          { id: 'br-p4-1', roundNumber: 1, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p4-2', roundNumber: 2, durationSeconds: 180, restSeconds: 60, completed: false },
          { id: 'br-p4-3', roundNumber: 3, durationSeconds: 180, restSeconds: 60, completed: false },
        ],
      },
    ],
  },
];

export const DEFAULT_BOXING_LOGS: CompletedBoxingLog[] = [
  {
    id: 'boxing-log-sample-1',
    workoutId: 'boxing-solo-bag-footwork',
    workoutName: 'Boxing — Power, Speed, Fitness, and Abs',
    mode: 'solo',
    completedAt: '2026-10-04T19:15:00.000Z',
    durationMinutes: 48,
    totalRoundsCompleted: 13,
    totalDrillsCompleted: 4,
    drills: [
      {
        drillId: 'bdrill-1',
        drillName: 'Boxer Skip & Rhythm Jump Rope',
        category: 'warmup',
        mode: 'solo',
        roundsCompleted: 3,
        totalRounds: 3,
        roundDurationSeconds: 180,
        comboOrCues: 'R1: Basic boxer step | R2: High knees + double-unders',
      },
      {
        drillId: 'bdrill-3',
        drillName: 'Heavy Bag: Outside-to-Inside Combinations',
        category: 'bagwork',
        mode: 'solo',
        roundsCompleted: 4,
        totalRounds: 4,
        roundDurationSeconds: 180,
        comboOrCues: '1-2-3(body)-3(head)-2',
      },
    ],
    userNotes: 'Trained solo today. Left hook to the body felt super crisp on the heavy bag.',
  },
];

export const DEFAULT_NUTRITION_LOGS: CompletedNutritionLog[] = [];

// In-Memory Fast Cache with IndexedDB + LocalStorage Sync
class LocalGymDatabase {
  private isBrowser = typeof window !== 'undefined';

  async loadSettings(): Promise<AppSettings> {
    if (!this.isBrowser) return DEFAULT_SETTINGS;
    try {
      const idbVal = await get<AppSettings>('osama_app_settings');
      if (idbVal) return { ...DEFAULT_SETTINGS, ...idbVal };

      const lsVal = localStorage.getItem('osama_app_settings');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('Error reading settings from storage', e);
    }
    return DEFAULT_SETTINGS;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_app_settings', JSON.stringify(settings));
      await set('osama_app_settings', settings);
    } catch (e) {
      console.warn('Error saving settings to storage', e);
    }
  }

  private normalizeWorkoutSystems(systems: WorkoutSystem[]): WorkoutSystem[] {
    return systems.map((sys) => ({
      ...sys,
      days: sys.days.map((day) => ({
        ...day,
        exercises: day.exercises.map((ex) => {
          const baseWeight = ex.sets[0]?.weight ?? ex.defaultWeight ?? 20;
          const baseReps = ex.sets[0]?.reps ?? ex.targetReps ?? 10;
          return {
            ...ex,
            defaultWeight: baseWeight,
            targetReps: baseReps,
            sets: ex.sets.map((s) => ({
              ...s,
              weight: baseWeight,
              reps: baseReps,
            })),
          };
        }),
      })),
    }));
  }

  private normalizeBoxingWorkouts(workouts: BoxingWorkout[]): BoxingWorkout[] {
    return workouts.map((w) => ({
      ...w,
      drills: w.drills.map((d) => {
        const roundSec = d.roundDurationSeconds || d.rounds[0]?.durationSeconds || 180;
        const restSec = d.restSeconds || d.rounds[0]?.restSeconds || 60;
        const lowerName = d.name.toLowerCase();

        let trackingMode = d.trackingMode;
        // If trackingMode is missing or default 'time' for known abs exercises, auto-set appropriate tracking mode
        if (
          !trackingMode ||
          (trackingMode === 'time' &&
            (lowerName.includes('russian twist') ||
              lowerName.includes('crunch') ||
              lowerName.includes('knee tuck')))
        ) {
          if (lowerName.includes('russian twist')) {
            trackingMode = 'weight_reps';
          } else if (
            lowerName.includes('crunch') ||
            lowerName.includes('knee tuck') ||
            lowerName.includes('abs') ||
            (d.comboOrCues && d.comboOrCues.toLowerCase().includes('repetitions only'))
          ) {
            trackingMode = 'reps';
          } else {
            trackingMode = 'time';
          }
        }

        const hasReps = trackingMode === 'reps' || trackingMode === 'weight_reps';
        const hasWeight =
          trackingMode === 'weight' ||
          trackingMode === 'weight_reps' ||
          trackingMode === 'weight_time';

        const defaultReps =
          d.defaultReps ??
          (hasReps ? (lowerName.includes('twist') ? 20 : 15) : undefined);

        const defaultWeight =
          d.defaultWeight ??
          (hasWeight ? (lowerName.includes('twist') ? 10 : 10) : undefined);

        return {
          ...d,
          trackingMode,
          defaultReps,
          defaultWeight,
          roundDurationSeconds: roundSec,
          restSeconds: restSec,
          rounds: d.rounds.map((r) => ({
            ...r,
            durationSeconds: r.durationSeconds || roundSec,
            restSeconds: r.restSeconds || restSec,
            reps: hasReps ? (r.reps ?? defaultReps ?? 15) : undefined,
            weight: hasWeight ? (r.weight ?? defaultWeight ?? 10) : undefined,
            targetReps: hasReps ? (r.targetReps ?? defaultReps ?? 15) : undefined,
            targetWeight: hasWeight ? (r.targetWeight ?? defaultWeight ?? 10) : undefined,
          })),
        };
      }),
    }));
  }

  private migrateBoxingWorkoutsIfNeeded(workouts: BoxingWorkout[]): { workouts: BoxingWorkout[]; migrated: boolean } {
    let migrated = false;
    const defaultSolo = DEFAULT_BOXING_WORKOUTS[0];
    const updated = workouts.map((w) => {
      if (
        w.id === 'boxing-solo-bag-footwork' &&
        (w.name !== 'Boxing — Power, Speed, Fitness, and Abs' ||
          w.drills.some((d) => d.name === 'Abs Circuit') ||
          w.drills.length < 12 ||
          !w.drills.some((d) => d.trackingMode === 'reps' || d.trackingMode === 'weight_reps'))
      ) {
        migrated = true;
        return defaultSolo;
      }
      return w;
    });
    return { workouts: updated, migrated };
  }

  private migrateDaysIfNeeded(systems: WorkoutSystem[]): { systems: WorkoutSystem[]; migrated: boolean } {
    let migrated = false;
    const defaultAesthetic = DEFAULT_WORKOUT_SYSTEMS[0];

    const updated = systems.map((sys) => {
      if (sys.id !== 'system-aesthetic-4day') return sys;

      const hasExactNewExercises =
        sys.days[0]?.exercises.some((e) => e.name.toLowerCase().includes('shrugs')) &&
        sys.days[1]?.exercises.some((e) => e.name.toLowerCase().includes('behind-the-body')) &&
        sys.days[2]?.exercises.some((e) => e.name.toLowerCase().includes('russian twists'));

      if (!hasExactNewExercises || sys.days.length !== 3) {
        migrated = true;
        return {
          ...defaultAesthetic,
          isCurrent: sys.isCurrent,
        };
      }

      if (sys.description !== defaultAesthetic.description) {
        migrated = true;
        return {
          ...sys,
          name: defaultAesthetic.name,
          description: defaultAesthetic.description,
          days: sys.days.map((d, idx) => {
            if (idx === 1 && defaultAesthetic.days[1]) {
              return {
                ...d,
                title: defaultAesthetic.days[1].title,
                session1Label: defaultAesthetic.days[1].session1Label,
                session2Label: defaultAesthetic.days[1].session2Label,
              };
            }
            return d;
          }),
        };
      }

      return sys;
    });
    return { systems: updated, migrated };
  }

  private separateCuesAndNotes(systems: WorkoutSystem[]): { systems: WorkoutSystem[]; migrated: boolean } {
    let migrated = false;
    const updated = systems.map((sys) => ({
      ...sys,
      days: sys.days.map((d) => ({
        ...d,
        exercises: d.exercises.map((ex) => {
          if (!ex.cues && ex.notes) {
            migrated = true;
            return {
              ...ex,
              cues: ex.notes,
              notes: '',
            };
          }
          return ex;
        }),
      })),
    }));
    return { systems: updated, migrated };
  }

  async loadWorkoutSystems(): Promise<WorkoutSystem[]> {
    if (!this.isBrowser) return DEFAULT_WORKOUT_SYSTEMS;
    try {
      const idbVal = await get<WorkoutSystem[]>('osama_workout_systems');
      if (idbVal && Array.isArray(idbVal) && idbVal.length > 0) {
        const { systems, migrated } = this.migrateDaysIfNeeded(idbVal);
        const separated = this.separateCuesAndNotes(systems);
        if (migrated || separated.migrated) {
          await this.saveWorkoutSystems(separated.systems);
        }
        return separated.systems;
      }

      const lsVal = localStorage.getItem('osama_workout_systems');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const { systems, migrated } = this.migrateDaysIfNeeded(parsed);
          const separated = this.separateCuesAndNotes(systems);
          if (migrated || separated.migrated) {
            await this.saveWorkoutSystems(separated.systems);
          }
          return separated.systems;
        }
      }
    } catch (e) {
      console.warn('Error reading workout systems', e);
    }
    return DEFAULT_WORKOUT_SYSTEMS;
  }

  async saveWorkoutSystems(systems: WorkoutSystem[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_workout_systems', JSON.stringify(systems));
      await set('osama_workout_systems', systems);
    } catch (e) {
      console.warn('Error saving workout systems', e);
    }
  }

  private migrateMealSystemsIfNeeded(systems: MealSystem[]): { systems: MealSystem[]; migrated: boolean } {
    let migrated = false;
    const hasOptions = systems.some((s) => s.meals.some((m) => m.options && m.options.length > 0));
    const hasBothRoutines =
      systems.length >= 2 &&
      systems.some((s) => s.id === 'routine-day-training') &&
      systems.some((s) => s.id === 'routine-night-training');

    const serialized = JSON.stringify(systems).toLowerCase();
    const hasOldFoods =
      serialized.includes('salmon') ||
      serialized.includes('quick oats') ||
      serialized.includes('sourdough') ||
      serialized.includes('whey');
    const hasEgyptianPlan =
      (serialized.includes('areesh') || serialized.includes('قريش')) &&
      (serialized.includes('ful') || serialized.includes('فول')) &&
      (serialized.includes('baladi') || serialized.includes('بلدي'));

    if (!hasOptions || !hasBothRoutines || hasOldFoods || !hasEgyptianPlan) {
      migrated = true;
      return { systems: DEFAULT_MEAL_SYSTEMS, migrated };
    }
    return { systems, migrated: false };
  }

  async loadMealSystems(): Promise<MealSystem[]> {
    if (!this.isBrowser) return DEFAULT_MEAL_SYSTEMS;
    try {
      const idbVal = await get<MealSystem[]>('osama_meal_systems');
      if (idbVal && Array.isArray(idbVal) && idbVal.length > 0) {
        const { systems, migrated } = this.migrateMealSystemsIfNeeded(idbVal);
        if (migrated) {
          await this.saveMealSystems(systems);
        }
        return systems;
      }

      const lsVal = localStorage.getItem('osama_meal_systems');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const { systems, migrated } = this.migrateMealSystemsIfNeeded(parsed);
          if (migrated) {
            await this.saveMealSystems(systems);
          }
          return systems;
        }
      }
    } catch (e) {
      console.warn('Error reading meal systems', e);
    }
    return DEFAULT_MEAL_SYSTEMS;
  }

  async saveMealSystems(mealSystems: MealSystem[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_meal_systems', JSON.stringify(mealSystems));
      await set('osama_meal_systems', mealSystems);
    } catch (e) {
      console.warn('Error saving meal systems', e);
    }
  }

  async loadWalkingSessions(): Promise<WalkingSession[]> {
    if (!this.isBrowser) return DEFAULT_WALKING_SESSIONS;
    try {
      const idbVal = await get<WalkingSession[]>('osama_walking_sessions');
      if (idbVal && Array.isArray(idbVal)) return idbVal;

      const lsVal = localStorage.getItem('osama_walking_sessions');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading walking sessions', e);
    }
    return DEFAULT_WALKING_SESSIONS;
  }

  async saveWalkingSessions(sessions: WalkingSession[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_walking_sessions', JSON.stringify(sessions));
      await set('osama_walking_sessions', sessions);
    } catch (e) {
      console.warn('Error saving walking sessions', e);
    }
  }

  async loadWorkoutLogs(): Promise<CompletedSessionLog[]> {
    if (!this.isBrowser) return DEFAULT_WORKOUT_LOGS;
    try {
      const idbVal = await get<CompletedSessionLog[]>('osama_workout_logs');
      if (idbVal && Array.isArray(idbVal)) return idbVal;

      const lsVal = localStorage.getItem('osama_workout_logs');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading workout logs', e);
    }
    return DEFAULT_WORKOUT_LOGS;
  }

  async saveWorkoutLogs(logs: CompletedSessionLog[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_workout_logs', JSON.stringify(logs));
      await set('osama_workout_logs', logs);
    } catch (e) {
      console.warn('Error saving workout logs', e);
    }
  }

  async loadBoxingWorkouts(): Promise<BoxingWorkout[]> {
    if (!this.isBrowser) return DEFAULT_BOXING_WORKOUTS;
    try {
      const idbVal = await get<BoxingWorkout[]>('osama_boxing_workouts');
      if (idbVal && Array.isArray(idbVal) && idbVal.length > 0) {
        const normalized = this.normalizeBoxingWorkouts(idbVal);
        const { workouts, migrated } = this.migrateBoxingWorkoutsIfNeeded(normalized);
        if (migrated) {
          await this.saveBoxingWorkouts(workouts);
        }
        return workouts;
      }

      const lsVal = localStorage.getItem('osama_boxing_workouts');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = this.normalizeBoxingWorkouts(parsed);
          const { workouts, migrated } = this.migrateBoxingWorkoutsIfNeeded(normalized);
          if (migrated) {
            await this.saveBoxingWorkouts(workouts);
          }
          return workouts;
        }
      }
    } catch (e) {
      console.warn('Error reading boxing workouts', e);
    }
    return DEFAULT_BOXING_WORKOUTS;
  }

  async saveBoxingWorkouts(workouts: BoxingWorkout[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_boxing_workouts', JSON.stringify(workouts));
      await set('osama_boxing_workouts', workouts);
    } catch (e) {
      console.warn('Error saving boxing workouts', e);
    }
  }

  async loadBoxingLogs(): Promise<CompletedBoxingLog[]> {
    if (!this.isBrowser) return DEFAULT_BOXING_LOGS;
    try {
      const idbVal = await get<CompletedBoxingLog[]>('osama_boxing_logs');
      if (idbVal && Array.isArray(idbVal)) return idbVal;

      const lsVal = localStorage.getItem('osama_boxing_logs');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading boxing logs', e);
    }
    return DEFAULT_BOXING_LOGS;
  }

  async saveBoxingLogs(logs: CompletedBoxingLog[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_boxing_logs', JSON.stringify(logs));
      await set('osama_boxing_logs', logs);
    } catch (e) {
      console.warn('Error saving boxing logs', e);
    }
  }

  async loadNutritionLogs(): Promise<CompletedNutritionLog[]> {
    if (!this.isBrowser) return DEFAULT_NUTRITION_LOGS;
    try {
      const idbVal = await get<CompletedNutritionLog[]>('osama_nutrition_logs');
      if (idbVal && Array.isArray(idbVal)) return idbVal;

      const lsVal = localStorage.getItem('osama_nutrition_logs');
      if (lsVal) {
        const parsed = JSON.parse(lsVal);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading nutrition logs', e);
    }
    return DEFAULT_NUTRITION_LOGS;
  }

  async saveNutritionLogs(logs: CompletedNutritionLog[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('osama_nutrition_logs', JSON.stringify(logs));
      await set('osama_nutrition_logs', logs);
    } catch (e) {
      console.warn('Error saving nutrition logs', e);
    }
  }

  // Full Database Backup Export as JSON file
  exportFullBackup(payload: {
    settings: AppSettings;
    workoutSystems: WorkoutSystem[];
    mealSystems: MealSystem[];
    walkingSessions: WalkingSession[];
    workoutLogs: CompletedSessionLog[];
    boxingWorkouts?: BoxingWorkout[];
    boxingLogs?: CompletedBoxingLog[];
    nutritionLogs?: CompletedNutritionLog[];
  }) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `osama_gym_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Restore from imported JSON
  async importFullBackup(jsonText: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonText);
      if (data.settings) await this.saveSettings(data.settings);
      if (data.workoutSystems) await this.saveWorkoutSystems(data.workoutSystems);
      if (data.mealSystems) await this.saveMealSystems(data.mealSystems);
      if (data.walkingSessions) await this.saveWalkingSessions(data.walkingSessions);
      if (data.workoutLogs) await this.saveWorkoutLogs(data.workoutLogs);
      if (data.boxingWorkouts) await this.saveBoxingWorkouts(data.boxingWorkouts);
      if (data.boxingLogs) await this.saveBoxingLogs(data.boxingLogs);
      if (data.nutritionLogs) await this.saveNutritionLogs(data.nutritionLogs);
      return true;
    } catch (e) {
      console.error('Failed to parse backup JSON', e);
      return false;
    }
  }

  // Request Persistent Storage from the browser to protect IndexedDB against phone storage cleaners
  async requestPersistentStorage(): Promise<boolean> {
    if (this.isBrowser && navigator.storage && navigator.storage.persist) {
      try {
        const isPersisted = await navigator.storage.persisted();
        if (isPersisted) return true;
        return await navigator.storage.persist();
      } catch (e) {
        console.warn('Storage persist request note:', e);
      }
    }
    return false;
  }

  async isStoragePersisted(): Promise<boolean> {
    if (this.isBrowser && navigator.storage && navigator.storage.persisted) {
      try {
        return await navigator.storage.persisted();
      } catch {
        return false;
      }
    }
    return false;
  }
}

export const localDb = new LocalGymDatabase();
