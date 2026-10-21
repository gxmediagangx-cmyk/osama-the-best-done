import {
  CompletedBoxingLog,
  CompletedNutritionLog,
  CompletedSessionLog,
  MealSystem,
  WalkingSession,
  WorkoutSystem,
} from './types';

function toLocalDateKey(isoOrDate: string): string {
  if (!isoOrDate) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) return isoOrDate;
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return isoOrDate.slice(0, 10);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadableDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Generates a pure Gym & Boxing report (zero nutrition, zero false skipped meals).
 * Perfect for sending to private coach trainer right after gym.
 */
export function generateGymReportText(params: {
  dateKey: string;
  userName?: string;
  unit?: string;
  workoutLogs: CompletedSessionLog[];
  boxingLogs?: CompletedBoxingLog[];
  workoutSystems?: WorkoutSystem[];
}): string {
  const {
    dateKey,
    userName = 'Osama',
    unit = 'kg',
    workoutLogs,
    boxingLogs = [],
    workoutSystems = [],
  } = params;

  const readableDate = formatReadableDateKey(dateKey);
  const dayWorkouts = workoutLogs.filter((l) => toLocalDateKey(l.completedAt) === dateKey);
  const dayBoxing = boxingLogs.filter((l) => toLocalDateKey(l.completedAt) === dateKey);

  const lines: string[] = [];
  lines.push(`=========================================`);
  lines.push(`🏋️ GYM & BOXING REPORT — ${userName.toUpperCase()}`);
  lines.push(`Date: ${readableDate}`);
  lines.push(`=========================================`);
  lines.push(``);

  // 1. GYM SESSIONS
  lines.push(`1. GYM SESSIONS (DONE vs MISSED)`);
  lines.push(`-----------------------------------------`);
  if (dayWorkouts.length > 0) {
    dayWorkouts.forEach((w) => {
      lines.push(`[DONE] Gym Workout: ${w.dayTitle} (${w.durationMinutes} min | ${w.totalVolume.toLocaleString()} ${unit} volume)`);
      const doneExercises: string[] = [];
      const skippedExercises: string[] = [];

      w.exercises.forEach((ex) => {
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
        const cueSuffix = exCue ? ` [Cue: "${exCue}"]` : '';
        const noteSuffix = ex.notes ? ` [Today's Note: "${ex.notes}"]` : '';
        const detailsSuffix = `${cueSuffix}${noteSuffix}`;

        if (completedSets.length > 0) {
          const perSetStr = completedSets
            .map((s) => `S${s.setNumber}: ${s.weight}${unit}×${s.reps}`)
            .join(', ');
          doneExercises.push(`  • Done: ${ex.exerciseName} (${perSetStr})${detailsSuffix}`);
          if (missedSets > 0) {
            skippedExercises.push(`  • Skipped Sets: ${ex.exerciseName} (${missedSets} set${missedSets > 1 ? 's' : ''} not done)`);
          }
        } else {
          skippedExercises.push(`  • Didn't Do: ${ex.exerciseName} (0/${ex.sets.length} sets)${detailsSuffix}`);
        }
      });

      if (doneExercises.length > 0) lines.push(...doneExercises);
      if (skippedExercises.length > 0) lines.push(...skippedExercises);
      if (w.userNotes) lines.push(`  • Workout Note: "${w.userNotes}"`);
      if (w.overloadNotes && w.overloadNotes.length > 0) {
        lines.push(`  • Progressive Overload Milestones:`);
        w.overloadNotes.forEach((note) => lines.push(`    - ${note}`));
      }
    });
  } else {
    lines.push(`[DIDN'T DO] No gym workout session logged on ${readableDate}.`);
    if (workoutSystems.length > 0) {
      const currentSys = workoutSystems.find((s) => s.isCurrent) || workoutSystems[0];
      const activeDay = currentSys?.days[0];
      if (activeDay && activeDay.exercises.length > 0) {
        lines.push(`  Current Routine (${activeDay.title}):`);
        activeDay.exercises.forEach((ex) => {
          const cue = ex.notes ? ` [Cue: "${ex.notes}"]` : '';
          lines.push(`  • Planned: ${ex.name} (${ex.targetSets} sets × ${ex.targetReps} reps @ ${ex.defaultWeight}${unit})${cue}`);
        });
      }
    }
  }

  lines.push(``);

  // 2. BOXING TRAININGS
  lines.push(`2. BOXING TRAININGS (DONE vs MISSED)`);
  lines.push(`-----------------------------------------`);
  if (dayBoxing.length > 0) {
    dayBoxing.forEach((b) => {
      const modeLabel = b.mode === 'partner' ? 'Partner Session' : 'Solo Session';
      lines.push(`[DONE] Boxing Training: ${b.workoutName} (${modeLabel} | ${b.durationMinutes} min | ${b.totalRoundsCompleted} rounds)`);
      b.drills.forEach((d) => {
        const comboStr = d.comboOrCues ? ` [Focus/Combo: "${d.comboOrCues}"]` : '';
        const noteStr = d.notes ? ` [Today's Note: "${d.notes}"]` : '';
        const detailsSuffix = `${comboStr}${noteStr}`;
        if (d.roundsCompleted >= d.totalRounds && d.totalRounds > 0) {
          lines.push(`  • Done: ${d.drillName} (${d.roundsCompleted}/${d.totalRounds} rounds)${detailsSuffix}`);
        } else if (d.roundsCompleted > 0) {
          lines.push(`  • Partial: ${d.drillName} (${d.roundsCompleted}/${d.totalRounds} rounds done, ${d.totalRounds - d.roundsCompleted} skipped)${detailsSuffix}`);
        } else {
          lines.push(`  • Didn't Do: ${d.drillName} (0/${d.totalRounds} rounds)${detailsSuffix}`);
        }
      });
      if (b.userNotes) lines.push(`  • Boxing Note: "${b.userNotes}"`);
    });
  } else {
    lines.push(`[DIDN'T DO] No boxing workout session logged on ${readableDate}.`);
  }

  return lines.join('\n');
}

/**
 * Generates a pure Nutrition report (meals eaten, replacement choices, custom off-menu entries, water & supplements).
 * Decoupled from gym sessions so coaches get a crystal-clear diet update.
 */
export function generateNutritionReportText(params: {
  dateKey: string;
  userName?: string;
  nutritionLogs: CompletedNutritionLog[];
  currentMealSystem?: MealSystem | null;
  walkingSessions?: WalkingSession[];
}): string {
  const {
    dateKey,
    userName = 'Osama',
    nutritionLogs,
    currentMealSystem,
    walkingSessions = [],
  } = params;

  const readableDate = formatReadableDateKey(dateKey);
  const savedDayNutrition = nutritionLogs.find((n) => n.date === dateKey);
  const isToday = dateKey === getTodayDateKey();
  const dayWalks = walkingSessions.filter((w) => w.date === dateKey);

  const lines: string[] = [];
  lines.push(`=========================================`);
  lines.push(`🥗 NUTRITION & DIETARY REPORT — ${userName.toUpperCase()}`);
  lines.push(`Date: ${readableDate}`);
  const routineTitle =
    savedDayNutrition?.routineName ||
    savedDayNutrition?.systemName ||
    currentMealSystem?.name ||
    'Aesthetic Protocol Routine';
  lines.push(`Routine: ${routineTitle}`);
  lines.push(`=========================================`);
  lines.push(``);

  lines.push(`1. MEALS & REPLACEMENTS CONSUMED`);
  lines.push(`-----------------------------------------`);

  if (savedDayNutrition) {
    lines.push(`Status: Day Completed & Saved (${savedDayNutrition.mealsCompletedCount}/${savedDayNutrition.totalMealsCount} meals eaten)`);
    lines.push(``);
    savedDayNutrition.meals.forEach((m) => {
      const statusTag = m.completed ? '[ATE]' : '[SKIPPED/FORGOTTEN]';
      const optStr = m.selectedOptionTitle ? ` | Choice: ${m.selectedOptionTitle}` : '';
      lines.push(`${statusTag} ${m.mealName} [${m.scheduledTime}]${optStr}`);
      const eatenFoods = m.foods.filter((f) => f.consumed);
      if (eatenFoods.length > 0) {
        lines.push(`  • Foods Eaten: ${eatenFoods.map((f) => `${f.name} (${f.portion})`).join(', ')}`);
      }
      const missedFoods = m.foods.filter((f) => !f.consumed);
      if (missedFoods.length > 0) {
        lines.push(`  • Foods Skipped: ${missedFoods.map((f) => `${f.name} (${f.portion})`).join(', ')}`);
      }
      if (m.notes) {
        lines.push(`  • Note: "${m.notes}"`);
      }
    });
  } else if (isToday && currentMealSystem) {
    lines.push(`Status: Current Day in Progress`);
    lines.push(``);
    currentMealSystem.meals.forEach((m) => {
      const selectedOpt = m.options?.find((o) => o.id === m.selectedOptionId);
      const isComplete = m.consumed || (m.foods.length > 0 && m.foods.every((f) => f.consumed));
      const hasPartial = !isComplete && m.foods.some((f) => f.consumed);
      const statusTag = isComplete ? '[ATE]' : hasPartial ? '[PARTIAL]' : '[PENDING / UPCOMING]';
      const optStr = selectedOpt ? ` | Choice: ${selectedOpt.title}` : '';
      lines.push(`${statusTag} ${m.name} [${m.scheduledTime}]${optStr}`);

      const eatenFoods = m.foods.filter((f) => f.consumed);
      if (eatenFoods.length > 0) {
        lines.push(`  • Foods Eaten: ${eatenFoods.map((f) => `${f.name} (${f.portion})`).join(', ')}`);
      }
      if (!isComplete) {
        const remainingFoods = m.foods.filter((f) => !f.consumed);
        if (remainingFoods.length > 0) {
          lines.push(`  • Planned / Pending: ${remainingFoods.map((f) => `${f.name} (${f.portion})`).join(', ')}`);
        }
      }
      if (m.notes) {
        lines.push(`  • Note: "${m.notes}"`);
      }
    });
  } else {
    lines.push(`• No nutrition log saved for this day yet.`);
  }

  lines.push(``);

  // 2. WATER HYDRATION
  lines.push(`2. HYDRATION`);
  lines.push(`-----------------------------------------`);
  const waterGlasses = savedDayNutrition
    ? savedDayNutrition.waterGlasses
    : isToday && currentMealSystem
    ? currentMealSystem.waterCount ?? 0
    : 0;
  const waterTarget = savedDayNutrition
    ? savedDayNutrition.waterTarget
    : isToday && currentMealSystem
    ? currentMealSystem.waterTarget ?? 8
    : 8;

  lines.push(
    `Water: ${waterGlasses}/${waterTarget} glasses (${waterGlasses * 250} ml)${
      waterGlasses >= waterTarget
        ? ' — Daily Hydration Goal Reached! 💧'
        : ` (${Math.max(0, waterTarget - waterGlasses)} glasses remaining)`
    }`
  );

  lines.push(``);

  // 3. SUPPLEMENTS
  lines.push(`3. SUPPLEMENTS`);
  lines.push(`-----------------------------------------`);
  const supsSource = savedDayNutrition
    ? savedDayNutrition.supplements
    : isToday && currentMealSystem
    ? currentMealSystem.supplements || []
    : [];

  if (supsSource.length > 0) {
    const taken = supsSource.filter((s) => s.taken).map((s) => s.name);
    const notTaken = supsSource.filter((s) => !s.taken).map((s) => s.name);
    lines.push(`Taken: ${taken.length > 0 ? taken.join(', ') : 'None'}`);
    if (notTaken.length > 0) {
      lines.push(`Pending / Missed: ${notTaken.join(', ')}`);
    }
  } else {
    lines.push(`None tracked.`);
  }

  // 4. WALKS
  if (dayWalks.length > 0) {
    lines.push(``);
    lines.push(`4. WALKING & CARDIO`);
    lines.push(`-----------------------------------------`);
    const totalSteps = dayWalks.reduce((acc, w) => acc + w.steps, 0);
    const totalKm = dayWalks.reduce((acc, w) => acc + w.distanceKm, 0);
    lines.push(
      `${totalSteps.toLocaleString()} steps (${totalKm.toFixed(1)} km across ${dayWalks.length} walk${
        dayWalks.length > 1 ? 's' : ''
      })`
    );
  }

  return lines.join('\n');
}

/**
 * Generates a clean, instant-copyable text report for a specific day (YYYY-MM-DD)
 * showing Gym + Boxing + Nutrition when ready for a full unified daily summary.
 */
export function generateDailyReportText(params: {
  dateKey: string;
  userName?: string;
  unit?: string;
  workoutLogs: CompletedSessionLog[];
  boxingLogs: CompletedBoxingLog[];
  nutritionLogs: CompletedNutritionLog[];
  currentMealSystem?: MealSystem | null;
  workoutSystems?: WorkoutSystem[];
  walkingSessions?: WalkingSession[];
}): string {
  const {
    dateKey,
    userName = 'Osama',
    unit = 'kg',
    workoutLogs,
    boxingLogs,
    nutritionLogs,
    currentMealSystem,
    walkingSessions = [],
  } = params;

  const readableDate = formatReadableDateKey(dateKey);
  const dayWorkouts = workoutLogs.filter((l) => toLocalDateKey(l.completedAt) === dateKey);
  const dayBoxing = boxingLogs.filter((l) => toLocalDateKey(l.completedAt) === dateKey);
  const savedDayNutrition = nutritionLogs.find((n) => n.date === dateKey);
  const isToday = dateKey === getTodayDateKey();
  const dayWalks = walkingSessions.filter((w) => w.date === dateKey);

  const lines: string[] = [];
  lines.push(`=========================================`);
  lines.push(`📋 COMBINED DAILY REPORT — ${userName.toUpperCase()}`);
  lines.push(`Date: ${readableDate}`);
  lines.push(`=========================================`);
  lines.push(``);

  // 1. GYM & BOXING TRAININGS (DONE vs DIDN'T DO)
  lines.push(`1. TRAININGS (DONE vs MISSED)`);
  lines.push(`-----------------------------------------`);

  if (dayWorkouts.length > 0) {
    dayWorkouts.forEach((w) => {
      lines.push(`[DONE] Gym Workout: ${w.dayTitle} (${w.durationMinutes} min | ${w.totalVolume.toLocaleString()} ${unit})`);
      const doneExercises: string[] = [];
      const skippedExercises: string[] = [];

      w.exercises.forEach((ex) => {
        const completedSets = ex.sets.filter((s) => s.completed);
        const missedSets = ex.sets.length - completedSets.length;
        const exCue =
          ex.cues ||
          (params.workoutSystems || [])
            .flatMap((s) => s.days)
            .flatMap((d) => d.exercises)
            .find(
              (e) =>
                e.id === ex.exerciseId ||
                e.name.toLowerCase() === ex.exerciseName.toLowerCase()
            )?.cues;
        const cueSuffix = exCue ? ` [Cue: "${exCue}"]` : '';
        const noteSuffix = ex.notes ? ` [Today's Note: "${ex.notes}"]` : '';
        const detailsSuffix = `${cueSuffix}${noteSuffix}`;

        if (completedSets.length > 0) {
          const perSetStr = completedSets
            .map((s) => `S${s.setNumber}: ${s.weight}${unit}×${s.reps}`)
            .join(', ');
          doneExercises.push(`  • Done: ${ex.exerciseName} (${perSetStr})${detailsSuffix}`);
          if (missedSets > 0) {
            skippedExercises.push(`  • Skipped Sets: ${ex.exerciseName} (${missedSets} set${missedSets > 1 ? 's' : ''} not done)`);
          }
        } else {
          skippedExercises.push(`  • Didn't Do: ${ex.exerciseName} (0/${ex.sets.length} sets)${detailsSuffix}`);
        }
      });

      if (doneExercises.length > 0) {
        lines.push(...doneExercises);
      }
      if (skippedExercises.length > 0) {
        lines.push(...skippedExercises);
      }
      if (w.userNotes) {
        lines.push(`  • Workout Note: "${w.userNotes}"`);
      }
    });
  } else {
    lines.push(`[DIDN'T DO] Gym Workout: No gym workout logged on this day.`);
    if (params.workoutSystems && params.workoutSystems.length > 0) {
      const currentSys = params.workoutSystems.find((s) => s.isCurrent) || params.workoutSystems[0];
      const activeDay = currentSys?.days[0];
      if (activeDay && activeDay.exercises.length > 0) {
        lines.push(`  Planned Routine (${activeDay.title}):`);
        activeDay.exercises.forEach((ex) => {
          const cue = ex.notes ? ` [Cue: "${ex.notes}"]` : '';
          lines.push(`  • Planned: ${ex.name} (${ex.targetSets} sets × ${ex.targetReps} reps @ ${ex.defaultWeight}${unit})${cue}`);
        });
      }
    }
  }

  lines.push(``);

  if (dayBoxing.length > 0) {
    dayBoxing.forEach((b) => {
      const modeLabel = b.mode === 'partner' ? 'Partner Session' : 'Solo Session';
      lines.push(`[DONE] Boxing Training: ${b.workoutName} (${modeLabel} | ${b.durationMinutes} min | ${b.totalRoundsCompleted} rounds)`);
      b.drills.forEach((d) => {
        const comboStr = d.comboOrCues ? ` [Focus/Combo: "${d.comboOrCues}"]` : '';
        const noteStr = d.notes ? ` [Today's Note: "${d.notes}"]` : '';
        const detailsSuffix = `${comboStr}${noteStr}`;
        if (d.roundsCompleted >= d.totalRounds && d.totalRounds > 0) {
          lines.push(`  • Done: ${d.drillName} (${d.roundsCompleted}/${d.totalRounds} rounds)${detailsSuffix}`);
        } else if (d.roundsCompleted > 0) {
          lines.push(`  • Partial: ${d.drillName} (${d.roundsCompleted}/${d.totalRounds} rounds done, ${d.totalRounds - d.roundsCompleted} skipped)${detailsSuffix}`);
        } else {
          lines.push(`  • Didn't Do: ${d.drillName} (0/${d.totalRounds} rounds)${detailsSuffix}`);
        }
      });
      if (b.userNotes) {
        lines.push(`  • Boxing Note: "${b.userNotes}"`);
      }
    });
  } else {
    lines.push(`[DIDN'T DO] Boxing Training: No boxing session logged on this day.`);
  }

  lines.push(``);

  // 2. NUTRITION: MEALS EATEN vs PENDING / SKIPPED
  lines.push(`2. NUTRITION (MEALS & REPLACEMENTS)`);
  lines.push(`-----------------------------------------`);

  if (savedDayNutrition) {
    lines.push(`Status: Day Completed & Saved (${savedDayNutrition.mealsCompletedCount}/${savedDayNutrition.totalMealsCount} meals eaten)`);
    savedDayNutrition.meals.forEach((m) => {
      const statusTag = m.completed ? '[ATE]' : '[SKIPPED/FORGOTTEN]';
      const optStr = m.selectedOptionTitle ? ` (${m.selectedOptionTitle})` : '';
      const mealNote = m.notes || currentMealSystem?.meals.find((cm) => cm.id === m.mealId || cm.name === m.mealName)?.notes;
      const noteStr = mealNote ? ` [Note: "${mealNote}"]` : '';
      lines.push(`  ${statusTag} ${m.mealName} [${m.scheduledTime}]${optStr}${noteStr}`);
    });
  } else if (isToday && currentMealSystem) {
    lines.push(`Status: Day in Progress (Unfinished meals are pending, not skipped)`);
    currentMealSystem.meals.forEach((m) => {
      const selectedOpt = m.options?.find((o) => o.id === m.selectedOptionId);
      const isComplete = m.consumed || (m.foods.length > 0 && m.foods.every((f) => f.consumed));
      const statusTag = isComplete ? '[ATE]' : '[PENDING LATER TODAY]';
      const optStr = selectedOpt ? ` — Choice: ${selectedOpt.title}` : '';
      const noteStr = m.notes ? ` [Note: "${m.notes}"]` : '';
      lines.push(`  ${statusTag} ${m.name} [${m.scheduledTime}]${optStr}${noteStr}`);
    });
  } else {
    lines.push(`  • No nutrition log saved for this date.`);
  }

  lines.push(``);

  // 3. WATER & SUPPLEMENTS
  lines.push(`3. WATER & SUPPLEMENTS`);
  lines.push(`-----------------------------------------`);

  const waterGlasses = savedDayNutrition
    ? savedDayNutrition.waterGlasses
    : isToday && currentMealSystem
    ? currentMealSystem.waterCount ?? 0
    : 0;
  const waterTarget = savedDayNutrition
    ? savedDayNutrition.waterTarget
    : isToday && currentMealSystem
    ? currentMealSystem.waterTarget ?? 8
    : 8;

  const remainingGlasses = Math.max(0, waterTarget - waterGlasses);
  lines.push(
    `Water: ${waterGlasses}/${waterTarget} glasses (${waterGlasses * 250} ml)${
      savedDayNutrition && remainingGlasses > 0
        ? ` — Missed ${remainingGlasses} glasses`
        : !savedDayNutrition && isToday
        ? ` (${remainingGlasses} glasses remaining today)`
        : ' — Goal Hit!'
    }`
  );

  const supsSource = savedDayNutrition
    ? savedDayNutrition.supplements
    : isToday && currentMealSystem
    ? (currentMealSystem.supplements || []).map((s) => ({
        name: s.name,
        taken: s.taken,
      }))
    : [];

  if (supsSource.length > 0) {
    const takenSups = supsSource.filter((s) => s.taken).map((s) => s.name);
    const missedSups = supsSource.filter((s) => !s.taken).map((s) => s.name);
    lines.push(`Supplements Taken: ${takenSups.length > 0 ? takenSups.join(', ') : 'None'}`);
    if (missedSups.length > 0) {
      lines.push(
        `${savedDayNutrition ? 'Supplements Missed' : 'Pending Supplements'}: ${missedSups.join(', ')}`
      );
    }
  }

  if (dayWalks.length > 0) {
    const totalSteps = dayWalks.reduce((acc, w) => acc + w.steps, 0);
    const totalKm = dayWalks.reduce((acc, w) => acc + w.distanceKm, 0);
    lines.push(
      `Walking / Cardio: ${totalSteps.toLocaleString()} steps (${totalKm.toFixed(1)} km across ${dayWalks.length} walk${dayWalks.length > 1 ? 's' : ''})`
    );
  }

  return lines.join('\n');
}

export function generateAIPromptMarkdown(
  logs: CompletedSessionLog[],
  userName: string = 'Osama',
  unit: string = 'kg',
  boxingLogs: CompletedBoxingLog[] = [],
  nutritionLogs: CompletedNutritionLog[] = [],
  currentMealSystem?: MealSystem | null,
  walkingSessions: WalkingSession[] = [],
  workoutSystems: WorkoutSystem[] = []
): string {
  const todayReport = generateDailyReportText({
    dateKey: getTodayDateKey(),
    userName,
    unit,
    workoutLogs: logs,
    boxingLogs,
    nutritionLogs,
    currentMealSystem,
    workoutSystems,
    walkingSessions,
  });

  let md = `# FULL TRAINING & NUTRITION REPORT FOR ${userName.toUpperCase()}\n\n`;
  md += `${todayReport}\n\n`;
  md += `---\n\n`;
  md += `## RECENT GYM SESSIONS (${logs.length}):\n\n`;

  logs.slice(0, 10).forEach((session, sIdx) => {
    const sDate = new Date(session.completedAt).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    md += `### Session ${sIdx + 1}: ${session.dayTitle} (${sDate})\n`;
    md += `- **Program:** ${session.systemName} | **Duration:** ${session.durationMinutes} min | **Volume:** ${session.totalVolume.toLocaleString()} ${unit}\n`;
    if (session.userNotes) {
      md += `- **Notes:** "${session.userNotes}"\n`;
    }

    session.exercises.forEach((ex, exIdx) => {
      const doneSets = ex.sets.filter((s) => s.completed);
      const missedCount = ex.sets.length - doneSets.length;
      const setsStr = doneSets
        .map((s) => `Set ${s.setNumber}: ${s.weight}${unit} × ${s.reps}`)
        .join(' | ');
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
      const cueStr = exCue ? ` — *Form Cue: "${exCue}"*` : '';
      const noteStr = ex.notes ? ` — *Session Note: "${ex.notes}"*` : '';
      md += `${exIdx + 1}. **${ex.exerciseName}**: ${setsStr || 'Skipped (0 sets)'}${
        missedCount > 0 && doneSets.length > 0 ? ` (${missedCount} set skipped)` : ''
      }${cueStr}${noteStr}\n`;
    });
    md += `\n`;
  });

  if (boxingLogs && boxingLogs.length > 0) {
    md += `---\n\n`;
    md += `## RECENT BOXING SESSIONS (${boxingLogs.length}):\n\n`;
    boxingLogs.slice(0, 10).forEach((bSession, bIdx) => {
      const bDate = new Date(bSession.completedAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      md += `### Boxing ${bIdx + 1}: ${bSession.workoutName} (${bDate})\n`;
      md += `- **Mode:** ${bSession.mode === 'partner' ? 'Partner' : 'Solo'} | **Duration:** ${bSession.durationMinutes} min | **Rounds:** ${bSession.totalRoundsCompleted}\n`;
      bSession.drills.forEach((d, dIdx) => {
        const comboStr = d.comboOrCues ? ` — *Focus/Combo: "${d.comboOrCues}"*` : '';
        const noteStr = d.notes ? ` — *Session Note: "${d.notes}"*` : '';
        md += `${dIdx + 1}. **${d.drillName}**: ${d.roundsCompleted}/${d.totalRounds} rounds (${Math.round(d.roundDurationSeconds / 60)}m)${comboStr}${noteStr}\n`;
      });
      md += `\n`;
    });
  }

  if (nutritionLogs && nutritionLogs.length > 0) {
    md += `---\n\n`;
    md += `## SAVED NUTRITION DAYS (${nutritionLogs.length}):\n\n`;
    nutritionLogs.slice(0, 10).forEach((nLog) => {
      md += `### ${formatReadableDateKey(nLog.date)}\n`;
      md += `- **Meals (${nLog.mealsCompletedCount}/${nLog.totalMealsCount} Completed):**\n`;
      nLog.meals.forEach((m) => {
        const status = m.completed ? '✓ Ate' : '✗ Skipped';
        const opt = m.selectedOptionTitle ? ` (${m.selectedOptionTitle})` : '';
        const mealNote =
          m.notes ||
          currentMealSystem?.meals.find(
            (cm) => cm.id === m.mealId || cm.name === m.mealName
          )?.notes;
        const noteStr = mealNote ? ` — *Note: "${mealNote}"*` : '';
        md += `  - ${status}: **${m.mealName}** [${m.scheduledTime}]${opt}${noteStr}\n`;
      });
      md += `- **Water Drank:** ${nLog.waterGlasses}/${nLog.waterTarget} glasses (${nLog.waterGlasses * 250} ml)\n\n`;
    });
  }

  return md;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadLogsAsJSON(
  logs: CompletedSessionLog[],
  userName: string = 'Osama',
  boxingLogs: CompletedBoxingLog[] = [],
  nutritionLogs: CompletedNutritionLog[] = [],
  workoutSystems: WorkoutSystem[] = [],
  mealSystems: MealSystem[] = []
) {
  const data = {
    exportedFor: userName,
    exportedAt: new Date().toISOString(),
    format: 'AI-Studio-Gym-Analytics-v2',
    workoutLogs: logs,
    boxingLogs,
    nutritionLogs,
    currentWorkoutSystems: workoutSystems,
    currentMealSystems: mealSystems,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  downloadFile(
    jsonStr,
    `osama_full_logs_${new Date().toISOString().slice(0, 10)}.json`,
    'application/json'
  );
}

export function downloadLogsAsMarkdown(
  logs: CompletedSessionLog[],
  userName: string = 'Osama',
  unit: string = 'kg',
  boxingLogs: CompletedBoxingLog[] = [],
  nutritionLogs: CompletedNutritionLog[] = [],
  currentMealSystem?: MealSystem | null,
  workoutSystems: WorkoutSystem[] = []
) {
  const md = generateAIPromptMarkdown(
    logs,
    userName,
    unit,
    boxingLogs,
    nutritionLogs,
    currentMealSystem,
    [],
    workoutSystems
  );
  downloadFile(
    md,
    `osama_report_${new Date().toISOString().slice(0, 10)}.md`,
    'text/markdown'
  );
}

export function downloadLogsAsCSV(logs: CompletedSessionLog[], unit: string = 'kg') {
  const rows: string[] = [];
  rows.push(
    ['Date', 'System', 'Day', 'Exercise', 'Category', 'Set', `Weight (${unit})`, 'Reps', 'Completed', 'Volume'].join(',')
  );

  logs.forEach((session) => {
    const dateStr = session.completedAt.slice(0, 10);
    session.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        const vol = s.completed ? s.weight * s.reps : 0;
        rows.push(
          [
            `"${dateStr}"`,
            `"${session.systemName.replace(/"/g, '""')}"`,
            `"${session.dayTitle.replace(/"/g, '""')}"`,
            `"${ex.exerciseName.replace(/"/g, '""')}"`,
            `"${ex.category}"`,
            s.setNumber,
            s.weight,
            s.reps,
            s.completed ? 'YES' : 'NO',
            vol,
          ].join(',')
        );
      });
    });
  });

  downloadFile(
    rows.join('\n'),
    `osama_workouts_${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv'
  );
}
