import { MealSystem } from './types';

/**
 * VISIBLE NUTRITION ROUTINES (Egyptian Household Fitness Plan)
 *
 * ROUTINE 1: روتين التمرين النهاري
 * Subtitle: للتمرين من ٣:٠٠ إلى ٥:٠٠ مساءً
 *
 * ROUTINE 2: روتين التمرين الليلي
 * Subtitle: للتمرين من ١٠:٠٠ مساءً إلى ١٢:٠٠ صباحًا
 *
 * Timing note for existing routine text only:
 * - For a 6:00 PM to 8:00 PM workout: pre-workout meal is at 4:00 PM and post-workout meal is at 8:15 PM.
 * - For a rare 1:00 PM to 3:00 PM workout: breakfast is at 09:00 AM, pre-workout meal is at 11:00 AM, family/post-workout meal is at 3:30 PM, and final meal is between 8:00 PM and 9:00 PM.
 *
 * Content rules:
 * - Use whole eggs only; never show egg whites by themselves.
 * - Do not recommend protein bars, supplements, fish, chicken thighs, or expensive restaurant meals.
 * - Use “ملعقة أكل عادية” for household portions of rice, macaroni, fries, béchamel, and lentils.
 * - Keep all current custom-meal/manual-entry functions unchanged for unexpected foods and meals outside the home.
 */

export const DEFAULT_MEAL_SYSTEMS: MealSystem[] = [
  // =========================================================================
  // VISIBLE ROUTINE 1: روتين التمرين النهاري
  // Subtitle: للتمرين من ٣:٠٠ إلى ٥:٠٠ مساءً
  // =========================================================================
  {
  "id": "routine-day-training",
  "name": "Day Training Routine",
  "description": "For training from 3:00 PM to 5:00 PM",
  "isCurrent": true,
  "targetCalories": 0,
  "targetProtein": 0,
  "targetCarbs": 0,
  "targetFats": 0,
  "waterCount": 8,
  "waterTarget": 12,
  "supplements": [],
  "meals": [
    {
      "id": "m-day-1",
      "name": "Breakfast",
      "scheduledTime": "9:30 AM",
      "order": 1,
      "selectedOptionId": "opt-d1-1",
      "consumed": false,
      "notes": "Protein + carbohydrates",
      "foods": [
        {
          "id": "f-d1-1-1",
          "name": "3 scrambled whole eggs",
          "portion": "3 whole eggs",
          "icon": "egg",
          "protein": 18,
          "carbs": 1,
          "fats": 15,
          "calories": 215,
          "consumed": false
        },
        {
          "id": "f-d1-1-2",
          "name": "1 medium baladi bread loaf",
          "portion": "1 loaf",
          "icon": "bread",
          "protein": 8,
          "carbs": 52,
          "fats": 2,
          "calories": 260,
          "consumed": false
        },
        {
          "id": "f-d1-1-3",
          "name": "1 teaspoon butter or samna",
          "portion": "1 tsp",
          "icon": "bowl",
          "protein": 0,
          "carbs": 0,
          "fats": 5,
          "calories": 45,
          "consumed": false
        }
      ],
      "options": [
        {
          "id": "opt-d1-1",
          "title": "3 scrambled whole eggs + 1 medium baladi bread loaf + 1 teaspoon butter or samna",
          "foods": [
            {
              "id": "f-d1-1-1",
              "name": "3 scrambled whole eggs",
              "portion": "3 whole eggs",
              "icon": "egg",
              "protein": 18,
              "carbs": 1,
              "fats": 15,
              "calories": 215,
              "consumed": false
            },
            {
              "id": "f-d1-1-2",
              "name": "1 medium baladi bread loaf",
              "portion": "1 loaf",
              "icon": "bread",
              "protein": 8,
              "carbs": 52,
              "fats": 2,
              "calories": 260,
              "consumed": false
            },
            {
              "id": "f-d1-1-3",
              "name": "1 teaspoon butter or samna",
              "portion": "1 tsp",
              "icon": "bowl",
              "protein": 0,
              "carbs": 0,
              "fats": 5,
              "calories": 45,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d1-2",
          "title": "3 scrambled whole eggs + 2 medium boiled potatoes + 1 teaspoon butter or samna",
          "foods": [
            {
              "id": "f-d1-2-1",
              "name": "3 scrambled whole eggs",
              "portion": "3 whole eggs",
              "icon": "egg",
              "protein": 18,
              "carbs": 1,
              "fats": 15,
              "calories": 215,
              "consumed": false
            },
            {
              "id": "f-d1-2-2",
              "name": "2 medium boiled potatoes",
              "portion": "2 potatoes",
              "icon": "salad",
              "protein": 5,
              "carbs": 56,
              "fats": 0,
              "calories": 250,
              "consumed": false
            },
            {
              "id": "f-d1-2-3",
              "name": "1 teaspoon butter or samna",
              "portion": "1 tsp",
              "icon": "bowl",
              "protein": 0,
              "carbs": 0,
              "fats": 5,
              "calories": 45,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d1-3",
          "title": "1 medium bowl ful medames + 1 medium baladi bread loaf + 1 teaspoon oil",
          "foods": [
            {
              "id": "f-d1-3-1",
              "name": "1 medium bowl ful medames",
              "portion": "1 bowl",
              "icon": "bowl",
              "protein": 14,
              "carbs": 38,
              "fats": 3,
              "calories": 240,
              "consumed": false
            },
            {
              "id": "f-d1-3-2",
              "name": "1 medium baladi bread loaf",
              "portion": "1 loaf",
              "icon": "bread",
              "protein": 8,
              "carbs": 52,
              "fats": 2,
              "calories": 260,
              "consumed": false
            },
            {
              "id": "f-d1-3-3",
              "name": "1 teaspoon oil",
              "portion": "1 tsp",
              "icon": "bowl",
              "protein": 0,
              "carbs": 0,
              "fats": 5,
              "calories": 45,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d1-4",
          "title": "1 medium bowl ful medames + 1 medium boiled potato + 1 teaspoon oil",
          "foods": [
            {
              "id": "f-d1-4-1",
              "name": "1 medium bowl ful medames",
              "portion": "1 bowl",
              "icon": "bowl",
              "protein": 14,
              "carbs": 38,
              "fats": 3,
              "calories": 240,
              "consumed": false
            },
            {
              "id": "f-d1-4-2",
              "name": "1 medium boiled potato",
              "portion": "1 potato",
              "icon": "salad",
              "protein": 3,
              "carbs": 28,
              "fats": 0,
              "calories": 125,
              "consumed": false
            },
            {
              "id": "f-d1-4-3",
              "name": "1 teaspoon oil",
              "portion": "1 tsp",
              "icon": "bowl",
              "protein": 0,
              "carbs": 0,
              "fats": 5,
              "calories": 45,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d1-5",
          "title": "150 g gebna areesh + 1 medium baladi bread loaf",
          "foods": [
            {
              "id": "f-d1-5-1",
              "name": "150 g gebna areesh",
              "portion": "150 g",
              "icon": "bowl",
              "protein": 26,
              "carbs": 4,
              "fats": 2,
              "calories": 140,
              "consumed": false
            },
            {
              "id": "f-d1-5-2",
              "name": "1 medium baladi bread loaf",
              "portion": "1 loaf",
              "icon": "bread",
              "protein": 8,
              "carbs": 52,
              "fats": 2,
              "calories": 260,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d1-6",
          "title": "150 g gebna areesh + 2 medium boiled potatoes",
          "foods": [
            {
              "id": "f-d1-6-1",
              "name": "150 g gebna areesh",
              "portion": "150 g",
              "icon": "bowl",
              "protein": 26,
              "carbs": 4,
              "fats": 2,
              "calories": 140,
              "consumed": false
            },
            {
              "id": "f-d1-6-2",
              "name": "2 medium boiled potatoes",
              "portion": "2 potatoes",
              "icon": "salad",
              "protein": 5,
              "carbs": 56,
              "fats": 0,
              "calories": 250,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d1-7",
          "title": "Quick option: gebna areesh sandwich in baladi bread + 250 ml milk",
          "foods": [
            {
              "id": "f-d1-7-1",
              "name": "Gebna areesh sandwich in baladi bread",
              "portion": "1 sandwich",
              "icon": "bread",
              "protein": 22,
              "carbs": 52,
              "fats": 3,
              "calories": 320,
              "consumed": false
            },
            {
              "id": "f-d1-7-2",
              "name": "250 ml milk",
              "portion": "250 ml",
              "icon": "shake",
              "protein": 8,
              "carbs": 12,
              "fats": 8,
              "calories": 150,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d1-8",
          "title": "Outside emergency: ful sandwich",
          "foods": [
            {
              "id": "f-d1-8-1",
              "name": "Ful sandwich",
              "portion": "1 sandwich",
              "icon": "bread",
              "protein": 10,
              "carbs": 45,
              "fats": 5,
              "calories": 260,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d1-9",
          "title": "Outside backup: white-cheese sandwich",
          "foods": [
            {
              "id": "f-d1-9-1",
              "name": "White-cheese sandwich",
              "portion": "1 sandwich",
              "icon": "bread",
              "protein": 9,
              "carbs": 45,
              "fats": 10,
              "calories": 300,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d1-10",
          "title": "No-protein emergency: 1 medium boiled potato + half a medium baladi bread loaf + 250 ml milk",
          "foods": [
            {
              "id": "f-d1-10-1",
              "name": "1 medium boiled potato",
              "portion": "1 potato",
              "icon": "salad",
              "protein": 3,
              "carbs": 28,
              "fats": 0,
              "calories": 125,
              "consumed": false
            },
            {
              "id": "f-d1-10-2",
              "name": "Half a medium baladi bread loaf",
              "portion": "1/2 loaf",
              "icon": "bread",
              "protein": 4,
              "carbs": 26,
              "fats": 1,
              "calories": 130,
              "consumed": false
            },
            {
              "id": "f-d1-10-3",
              "name": "250 ml milk",
              "portion": "250 ml",
              "icon": "shake",
              "protein": 8,
              "carbs": 12,
              "fats": 8,
              "calories": 150,
              "consumed": false
            }
          ]
        }
      ]
    },
    {
      "id": "m-day-2",
      "name": "Pre-Workout Meal",
      "scheduledTime": "12:30 PM",
      "order": 2,
      "selectedOptionId": "opt-d2-1",
      "consumed": false,
      "notes": "Protein + carbohydrates; simple meal before training",
      "foods": [
        {
          "id": "f-d2-1-1",
          "name": "2 whole eggs",
          "portion": "2 eggs",
          "icon": "egg",
          "protein": 12,
          "carbs": 1,
          "fats": 10,
          "calories": 140,
          "consumed": false
        },
        {
          "id": "f-d2-1-2",
          "name": "1 medium baladi bread loaf",
          "portion": "1 loaf",
          "icon": "bread",
          "protein": 8,
          "carbs": 52,
          "fats": 2,
          "calories": 260,
          "consumed": false
        }
      ],
      "options": [
        {
          "id": "opt-d2-1",
          "title": "2 whole eggs + 1 medium baladi bread loaf",
          "foods": [
            {
              "id": "f-d2-1-1",
              "name": "2 whole eggs",
              "portion": "2 eggs",
              "icon": "egg",
              "protein": 12,
              "carbs": 1,
              "fats": 10,
              "calories": 140,
              "consumed": false
            },
            {
              "id": "f-d2-1-2",
              "name": "1 medium baladi bread loaf",
              "portion": "1 loaf",
              "icon": "bread",
              "protein": 8,
              "carbs": 52,
              "fats": 2,
              "calories": 260,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d2-2",
          "title": "2 whole eggs + 1 medium boiled potato",
          "foods": [
            {
              "id": "f-d2-2-1",
              "name": "2 whole eggs",
              "portion": "2 eggs",
              "icon": "egg",
              "protein": 12,
              "carbs": 1,
              "fats": 10,
              "calories": 140,
              "consumed": false
            },
            {
              "id": "f-d2-2-2",
              "name": "1 medium boiled potato",
              "portion": "1 potato",
              "icon": "salad",
              "protein": 3,
              "carbs": 28,
              "fats": 0,
              "calories": 125,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d2-3",
          "title": "Three-quarters of a bowl of ful medames + half a medium baladi bread loaf",
          "foods": [
            {
              "id": "f-d2-3-1",
              "name": "Three-quarters of a bowl of ful medames",
              "portion": "3/4 bowl",
              "icon": "bowl",
              "protein": 11,
              "carbs": 29,
              "fats": 2,
              "calories": 180,
              "consumed": false
            },
            {
              "id": "f-d2-3-2",
              "name": "Half a medium baladi bread loaf",
              "portion": "1/2 loaf",
              "icon": "bread",
              "protein": 4,
              "carbs": 26,
              "fats": 1,
              "calories": 130,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d2-4",
          "title": "Three-quarters of a bowl of ful medames + 1 medium boiled potato",
          "foods": [
            {
              "id": "f-d2-4-1",
              "name": "Three-quarters of a bowl of ful medames",
              "portion": "3/4 bowl",
              "icon": "bowl",
              "protein": 11,
              "carbs": 29,
              "fats": 2,
              "calories": 180,
              "consumed": false
            },
            {
              "id": "f-d2-4-2",
              "name": "1 medium boiled potato",
              "portion": "1 potato",
              "icon": "salad",
              "protein": 3,
              "carbs": 28,
              "fats": 0,
              "calories": 125,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d2-5",
          "title": "100 g gebna areesh + half a medium baladi bread loaf",
          "foods": [
            {
              "id": "f-d2-5-1",
              "name": "100 g gebna areesh",
              "portion": "100 g",
              "icon": "bowl",
              "protein": 18,
              "carbs": 3,
              "fats": 1,
              "calories": 95,
              "consumed": false
            },
            {
              "id": "f-d2-5-2",
              "name": "Half a medium baladi bread loaf",
              "portion": "1/2 loaf",
              "icon": "bread",
              "protein": 4,
              "carbs": 26,
              "fats": 1,
              "calories": 130,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d2-6",
          "title": "100 g gebna areesh + 1 medium boiled potato",
          "foods": [
            {
              "id": "f-d2-6-1",
              "name": "100 g gebna areesh",
              "portion": "100 g",
              "icon": "bowl",
              "protein": 18,
              "carbs": 3,
              "fats": 1,
              "calories": 95,
              "consumed": false
            },
            {
              "id": "f-d2-6-2",
              "name": "1 medium boiled potato",
              "portion": "1 potato",
              "icon": "salad",
              "protein": 3,
              "carbs": 28,
              "fats": 0,
              "calories": 125,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d2-7",
          "title": "Outside emergency: ful sandwich",
          "foods": [
            {
              "id": "f-d2-7-1",
              "name": "Ful sandwich",
              "portion": "1 sandwich",
              "icon": "bread",
              "protein": 10,
              "carbs": 45,
              "fats": 5,
              "calories": 260,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d2-8",
          "title": "Quick option: 250 ml milk + mango",
          "foods": [
            {
              "id": "f-d2-8-1",
              "name": "250 ml milk",
              "portion": "250 ml",
              "icon": "shake",
              "protein": 8,
              "carbs": 12,
              "fats": 8,
              "calories": 150,
              "consumed": false
            },
            {
              "id": "f-d2-8-2",
              "name": "Mango",
              "portion": "1 fruit",
              "icon": "fruit",
              "protein": 1,
              "carbs": 35,
              "fats": 1,
              "calories": 150,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d2-9",
          "title": "Quick option: 250 ml milk + 4 Sokary dates",
          "foods": [
            {
              "id": "f-d2-9-1",
              "name": "250 ml milk",
              "portion": "250 ml",
              "icon": "shake",
              "protein": 8,
              "carbs": 12,
              "fats": 8,
              "calories": 150,
              "consumed": false
            },
            {
              "id": "f-d2-9-2",
              "name": "4 Sokary dates",
              "portion": "4 dates",
              "icon": "fruit",
              "protein": 2,
              "carbs": 48,
              "fats": 0,
              "calories": 200,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d2-10",
          "title": "Quick option: tea with 1 small teaspoon sugar",
          "foods": [
            {
              "id": "f-d2-10-1",
              "name": "Tea with 1 small teaspoon sugar",
              "portion": "1 cup",
              "icon": "shake",
              "protein": 0,
              "carbs": 4,
              "fats": 0,
              "calories": 16,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d2-11",
          "title": "Quick option: 1 tablespoon honey with milk or tea",
          "foods": [
            {
              "id": "f-d2-11-1",
              "name": "1 tablespoon honey with milk or tea",
              "portion": "1 tbsp",
              "icon": "shake",
              "protein": 0,
              "carbs": 17,
              "fats": 0,
              "calories": 64,
              "consumed": false
            }
          ]
        }
      ]
    },
    {
      "id": "m-day-3",
      "name": "Family Lunch / Post-Workout Meal",
      "scheduledTime": "5:30 PM",
      "order": 3,
      "selectedOptionId": "opt-d3-1",
      "consumed": false,
      "notes": "Main protein + carbohydrates + available vegetables",
      "foods": [
        {
          "id": "f-d3-1-1",
          "name": "1 full chicken breast",
          "portion": "1 full breast",
          "icon": "chicken",
          "protein": 45,
          "carbs": 0,
          "fats": 5,
          "calories": 230,
          "consumed": false
        },
        {
          "id": "f-d3-1-2",
          "name": "Cooked rice or macaroni (6 normal tablespoons)",
          "portion": "6 tablespoons",
          "icon": "bowl",
          "protein": 5,
          "carbs": 45,
          "fats": 3,
          "calories": 230,
          "consumed": false
        },
        {
          "id": "f-d3-1-3",
          "name": "Available vegetables or salad",
          "portion": "1 bowl",
          "icon": "salad",
          "protein": 2,
          "carbs": 8,
          "fats": 0,
          "calories": 40,
          "consumed": false
        }
      ],
      "options": [
        {
          "id": "opt-d3-1",
          "title": "1 full chicken breast + 6 normal tablespoons cooked rice or macaroni + available vegetables or salad",
          "foods": [
            {
              "id": "f-d3-1-1",
              "name": "1 full chicken breast",
              "portion": "1 full breast",
              "icon": "chicken",
              "protein": 45,
              "carbs": 0,
              "fats": 5,
              "calories": 230,
              "consumed": false
            },
            {
              "id": "f-d3-1-2",
              "name": "Cooked rice or macaroni (6 normal tablespoons)",
              "portion": "6 tablespoons",
              "icon": "bowl",
              "protein": 5,
              "carbs": 45,
              "fats": 3,
              "calories": 230,
              "consumed": false
            },
            {
              "id": "f-d3-1-3",
              "name": "Available vegetables or salad",
              "portion": "1 bowl",
              "icon": "salad",
              "protein": 2,
              "carbs": 8,
              "fats": 0,
              "calories": 40,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d3-2",
          "title": "2 normal pieces of meat + 6 normal tablespoons cooked rice or macaroni + available vegetables or salad",
          "foods": [
            {
              "id": "f-d3-2-1",
              "name": "2 normal pieces of meat",
              "portion": "2 pieces",
              "icon": "meat",
              "protein": 40,
              "carbs": 0,
              "fats": 14,
              "calories": 290,
              "consumed": false
            },
            {
              "id": "f-d3-2-2",
              "name": "Cooked rice or macaroni (6 normal tablespoons)",
              "portion": "6 tablespoons",
              "icon": "bowl",
              "protein": 5,
              "carbs": 45,
              "fats": 3,
              "calories": 230,
              "consumed": false
            },
            {
              "id": "f-d3-2-3",
              "name": "Available vegetables or salad",
              "portion": "1 bowl",
              "icon": "salad",
              "protein": 2,
              "carbs": 8,
              "fats": 0,
              "calories": 40,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d3-3",
          "title": "About 4 kofta pieces + 6 normal tablespoons cooked rice or macaroni + available vegetables or salad",
          "foods": [
            {
              "id": "f-d3-3-1",
              "name": "About 4 kofta pieces",
              "portion": "4 pieces",
              "icon": "meat",
              "protein": 32,
              "carbs": 5,
              "fats": 18,
              "calories": 310,
              "consumed": false
            },
            {
              "id": "f-d3-3-2",
              "name": "Cooked rice or macaroni (6 normal tablespoons)",
              "portion": "6 tablespoons",
              "icon": "bowl",
              "protein": 5,
              "carbs": 45,
              "fats": 3,
              "calories": 230,
              "consumed": false
            },
            {
              "id": "f-d3-3-3",
              "name": "Available vegetables or salad",
              "portion": "1 bowl",
              "icon": "salad",
              "protein": 2,
              "carbs": 8,
              "fats": 0,
              "calories": 40,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d3-4",
          "title": "Lentils: 6 to 9 normal tablespoons + half a medium baladi bread loaf",
          "foods": [
            {
              "id": "f-d3-4-1",
              "name": "Lentils (6 to 9 normal tablespoons)",
              "portion": "6 to 9 tablespoons",
              "icon": "bowl",
              "protein": 15,
              "carbs": 35,
              "fats": 2,
              "calories": 220,
              "consumed": false
            },
            {
              "id": "f-d3-4-2",
              "name": "Half a medium baladi bread loaf",
              "portion": "1/2 loaf",
              "icon": "bread",
              "protein": 4,
              "carbs": 26,
              "fats": 1,
              "calories": 130,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d3-5",
          "title": "Fried potatoes: 3 normal tablespoons + only 3 normal tablespoons rice or macaroni",
          "foods": [
            {
              "id": "f-d3-5-1",
              "name": "Fried potatoes (3 normal tablespoons)",
              "portion": "3 tablespoons",
              "icon": "salad",
              "protein": 2,
              "carbs": 22,
              "fats": 8,
              "calories": 170,
              "consumed": false
            },
            {
              "id": "f-d3-5-2",
              "name": "Cooked rice or macaroni (only 3 normal tablespoons)",
              "portion": "3 tablespoons",
              "icon": "bowl",
              "protein": 3,
              "carbs": 22,
              "fats": 2,
              "calories": 115,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d3-6",
          "title": "Macarona béchamel: 5 to 6 normal tablespoons, with no extra rice or bread",
          "foods": [
            {
              "id": "f-d3-6-1",
              "name": "Macarona béchamel (5 to 6 normal tablespoons)",
              "portion": "5 to 6 tablespoons",
              "icon": "bowl",
              "protein": 18,
              "carbs": 45,
              "fats": 15,
              "calories": 390,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d3-7",
          "title": "Burger meal: 1 burger sandwich + a small amount of fries only if served",
          "foods": [
            {
              "id": "f-d3-7-1",
              "name": "Burger sandwich",
              "portion": "1 sandwich",
              "icon": "meat",
              "protein": 24,
              "carbs": 40,
              "fats": 18,
              "calories": 420,
              "consumed": false
            },
            {
              "id": "f-d3-7-2",
              "name": "Small amount of fries (only if served)",
              "portion": "small portion",
              "icon": "salad",
              "protein": 2,
              "carbs": 25,
              "fats": 8,
              "calories": 180,
              "consumed": false
            }
          ]
        }
      ]
    },
    {
      "id": "m-day-4",
      "name": "Final Meal",
      "scheduledTime": "9:00 PM",
      "order": 4,
      "selectedOptionId": "opt-d4-1",
      "consumed": false,
      "notes": "Protein + carbohydrates",
      "foods": [
        {
          "id": "f-d4-1-1",
          "name": "3 whole eggs",
          "portion": "3 whole eggs",
          "icon": "egg",
          "protein": 18,
          "carbs": 1,
          "fats": 15,
          "calories": 215,
          "consumed": false
        },
        {
          "id": "f-d4-1-2",
          "name": "1 medium baladi bread loaf",
          "portion": "1 loaf",
          "icon": "bread",
          "protein": 8,
          "carbs": 52,
          "fats": 2,
          "calories": 260,
          "consumed": false
        }
      ],
      "options": [
        {
          "id": "opt-d4-1",
          "title": "3 whole eggs + 1 medium baladi bread loaf",
          "foods": [
            {
              "id": "f-d4-1-1",
              "name": "3 whole eggs",
              "portion": "3 whole eggs",
              "icon": "egg",
              "protein": 18,
              "carbs": 1,
              "fats": 15,
              "calories": 215,
              "consumed": false
            },
            {
              "id": "f-d4-1-2",
              "name": "1 medium baladi bread loaf",
              "portion": "1 loaf",
              "icon": "bread",
              "protein": 8,
              "carbs": 52,
              "fats": 2,
              "calories": 260,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d4-2",
          "title": "3 whole eggs + 2 medium boiled potatoes",
          "foods": [
            {
              "id": "f-d4-2-1",
              "name": "3 whole eggs",
              "portion": "3 whole eggs",
              "icon": "egg",
              "protein": 18,
              "carbs": 1,
              "fats": 15,
              "calories": 215,
              "consumed": false
            },
            {
              "id": "f-d4-2-2",
              "name": "2 medium boiled potatoes",
              "portion": "2 potatoes",
              "icon": "salad",
              "protein": 5,
              "carbs": 56,
              "fats": 0,
              "calories": 250,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d4-3",
          "title": "1 bowl ful medames + 1 medium baladi bread loaf",
          "foods": [
            {
              "id": "f-d4-3-1",
              "name": "1 bowl ful medames",
              "portion": "1 bowl",
              "icon": "bowl",
              "protein": 14,
              "carbs": 38,
              "fats": 3,
              "calories": 240,
              "consumed": false
            },
            {
              "id": "f-d4-3-2",
              "name": "1 medium baladi bread loaf",
              "portion": "1 loaf",
              "icon": "bread",
              "protein": 8,
              "carbs": 52,
              "fats": 2,
              "calories": 260,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d4-4",
          "title": "1 bowl ful medames + 1 medium boiled potato",
          "foods": [
            {
              "id": "f-d4-4-1",
              "name": "1 bowl ful medames",
              "portion": "1 bowl",
              "icon": "bowl",
              "protein": 14,
              "carbs": 38,
              "fats": 3,
              "calories": 240,
              "consumed": false
            },
            {
              "id": "f-d4-4-2",
              "name": "1 medium boiled potato",
              "portion": "1 potato",
              "icon": "salad",
              "protein": 3,
              "carbs": 28,
              "fats": 0,
              "calories": 125,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d4-5",
          "title": "150 g gebna areesh + baladi bread + 250 ml milk",
          "foods": [
            {
              "id": "f-d4-5-1",
              "name": "150 g gebna areesh",
              "portion": "150 g",
              "icon": "bowl",
              "protein": 26,
              "carbs": 4,
              "fats": 2,
              "calories": 140,
              "consumed": false
            },
            {
              "id": "f-d4-5-2",
              "name": "Baladi bread",
              "portion": "1 loaf",
              "icon": "bread",
              "protein": 8,
              "carbs": 52,
              "fats": 2,
              "calories": 260,
              "consumed": false
            },
            {
              "id": "f-d4-5-3",
              "name": "250 ml milk",
              "portion": "250 ml",
              "icon": "shake",
              "protein": 8,
              "carbs": 12,
              "fats": 8,
              "calories": 150,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d4-6",
          "title": "150 g gebna areesh + boiled potatoes + 250 ml milk",
          "foods": [
            {
              "id": "f-d4-6-1",
              "name": "150 g gebna areesh",
              "portion": "150 g",
              "icon": "bowl",
              "protein": 26,
              "carbs": 4,
              "fats": 2,
              "calories": 140,
              "consumed": false
            },
            {
              "id": "f-d4-6-2",
              "name": "Boiled potatoes",
              "portion": "2 potatoes",
              "icon": "salad",
              "protein": 5,
              "carbs": 56,
              "fats": 0,
              "calories": 250,
              "consumed": false
            },
            {
              "id": "f-d4-6-3",
              "name": "250 ml milk",
              "portion": "250 ml",
              "icon": "shake",
              "protein": 8,
              "carbs": 12,
              "fats": 8,
              "calories": 150,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d4-7",
          "title": "Leftover chicken breast, meat, or kofta + 5 to 6 normal tablespoons cooked rice or macaroni",
          "foods": [
            {
              "id": "f-d4-7-1",
              "name": "Leftover chicken breast, meat, or kofta",
              "portion": "1 portion",
              "icon": "chicken",
              "protein": 35,
              "carbs": 0,
              "fats": 10,
              "calories": 230,
              "consumed": false
            },
            {
              "id": "f-d4-7-2",
              "name": "Cooked rice or macaroni (5 to 6 normal tablespoons)",
              "portion": "5 to 6 tablespoons",
              "icon": "bowl",
              "protein": 5,
              "carbs": 42,
              "fats": 3,
              "calories": 215,
              "consumed": false
            }
          ]
        },
        {
          "id": "opt-d4-8",
          "title": "Outside emergency: ful sandwich + 250 ml milk",
          "foods": [
            {
              "id": "f-d4-8-1",
              "name": "Ful sandwich",
              "portion": "1 sandwich",
              "icon": "bread",
              "protein": 10,
              "carbs": 45,
              "fats": 5,
              "calories": 260,
              "consumed": false
            },
            {
              "id": "f-d4-8-2",
              "name": "250 ml milk",
              "portion": "250 ml",
              "icon": "shake",
              "protein": 8,
              "carbs": 12,
              "fats": 8,
              "calories": 150,
              "consumed": false
            }
          ]
        }
      ]
    }
  ]
},

  // =========================================================================
  // VISIBLE ROUTINE 2: روتين التمرين الليلي
  // Subtitle: للتمرين من ١٠:٠٠ مساءً إلى ١٢:٠٠ صباحًا
  // =========================================================================
  {
    id: 'routine-night-training',
    name: 'روتين التمرين الليلي',
    description: 'للتمرين من ١٠:٠٠ مساءً إلى ١٢:٠٠ صباحًا',
    isCurrent: false,
    targetCalories: 0,
    targetProtein: 0,
    targetCarbs: 0,
    targetFats: 0,
    waterCount: 8,
    waterTarget: 12,
    supplements: [],
    meals: [
      // 09:30 — الوجبة الأولى: الفطار (Same as Routine 1)
      {
        id: 'm-night-1',
        name: 'الوجبة الأولى: الفطار',
        scheduledTime: '09:30 AM',
        order: 1,
        selectedOptionId: 'opt-n1-1',
        consumed: false,
        notes: 'بروتين + كربوهيدرات',
        foods: [
          {
            id: 'f-n1-1',
            name: '٣ بيضات كاملة مخفوقة (مسموح ملعقة شاي صغيرة سمنة أو زبدة)',
            portion: '٣ بيضات كاملة',
            icon: 'egg',
            protein: 18,
            carbs: 1,
            fats: 15,
            calories: 220,
            consumed: false,
          },
          {
            id: 'f-n1-2',
            name: 'رغيف عيش بلدي متوسط أو بطاطستين مسلوقتين متوسطتين',
            portion: 'رغيف عيش بلدي أو بطاطستين',
            icon: 'bread',
            protein: 8,
            carbs: 55,
            fats: 2,
            calories: 270,
            consumed: false,
          },
        ],
        options: [
          {
            id: 'opt-n1-1',
            title: '1. ٣ بيضات كاملة مخفوقة + رغيف عيش بلدي متوسط، أو بطاطستين مسلوقتين متوسطتين. مسموح ملعقة شاي صغيرة سمنة أو زبدة.',
            foods: [
              {
                id: 'f-n1-1',
                name: '٣ بيضات كاملة مخفوقة (مسموح ملعقة شاي صغيرة سمنة أو زبدة)',
                portion: '٣ بيضات كاملة',
                icon: 'egg',
                protein: 18,
                carbs: 1,
                fats: 15,
                calories: 220,
                consumed: false,
              },
              {
                id: 'f-n1-2',
                name: 'رغيف عيش بلدي متوسط أو بطاطستين مسلوقتين متوسطتين',
                portion: 'رغيف عيش بلدي أو بطاطستين',
                icon: 'bread',
                protein: 8,
                carbs: 55,
                fats: 2,
                calories: 270,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n1-2',
            title: '2. طبق فول متوسط + رغيف عيش بلدي متوسط، أو بطاطسة مسلوقة متوسطة. مسموح ملعقة شاي صغيرة زيت.',
            foods: [
              {
                id: 'f-n1-3',
                name: 'طبق فول متوسط (مسموح ملعقة شاي صغيرة زيت)',
                portion: 'طبق متوسط',
                icon: 'bowl',
                protein: 14,
                carbs: 38,
                fats: 5,
                calories: 250,
                consumed: false,
              },
              {
                id: 'f-n1-4',
                name: 'رغيف عيش بلدي متوسط أو بطاطسة مسلوقة متوسطة',
                portion: 'رغيف عيش أو بطاطسة',
                icon: 'bread',
                protein: 8,
                carbs: 55,
                fats: 2,
                calories: 270,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n1-3',
            title: '3. حوالي ١٥٠ جم جبنة قريش + رغيف عيش بلدي متوسط، أو بطاطستين مسلوقتين متوسطتين.',
            foods: [
              {
                id: 'f-n1-5',
                name: 'جبنة قريش',
                portion: 'حوالي ١٥٠ جم',
                icon: 'salad',
                protein: 22,
                carbs: 5,
                fats: 2,
                calories: 130,
                consumed: false,
              },
              {
                id: 'f-n1-6',
                name: 'رغيف عيش بلدي متوسط أو بطاطستين مسلوقتين متوسطتين',
                portion: 'رغيف عيش أو بطاطستين',
                icon: 'bread',
                protein: 8,
                carbs: 55,
                fats: 2,
                calories: 270,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n1-4',
            title: '4. اختيار سريع: سندوتش جبنة قريش في عيش بلدي + ٢٥٠ مل لبن.',
            foods: [
              {
                id: 'f-n1-7',
                name: 'سندوتش جبنة قريش في عيش بلدي',
                portion: 'سندوتش واحد',
                icon: 'bread',
                protein: 18,
                carbs: 45,
                fats: 3,
                calories: 280,
                consumed: false,
              },
              {
                id: 'f-n1-8',
                name: 'لبن',
                portion: '٢٥٠ مل لبن',
                icon: 'shake',
                protein: 8,
                carbs: 12,
                fats: 8,
                calories: 150,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n1-5',
            title: '5. اختيار طوارئ من الخارج: سندوتش فول. لو غير متاح: سندوتش جبنة بيضاء. فطيرة الجبنة فقط عند الضرورة.',
            foods: [
              {
                id: 'f-n1-9',
                name: 'سندوتش فول أو جبنة بيضاء من الخارج',
                portion: 'سندوتش (فطيرة الجبنة فقط عند الضرورة)',
                icon: 'bread',
                protein: 10,
                carbs: 35,
                fats: 6,
                calories: 230,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n1-6',
            title: '6. طوارئ بدون بروتين: بطاطسة مسلوقة متوسطة + نصف رغيف عيش بلدي متوسط + ٢٥٠ مل لبن.',
            foods: [
              {
                id: 'f-n1-10',
                name: 'بطاطسة مسلوقة متوسطة',
                portion: 'بطاطسة متوسطة',
                icon: 'bowl',
                protein: 3,
                carbs: 30,
                fats: 0,
                calories: 130,
                consumed: false,
              },
              {
                id: 'f-n1-11',
                name: 'نصف رغيف عيش بلدي متوسط',
                portion: 'نصف رغيف عيش',
                icon: 'bread',
                protein: 4,
                carbs: 27,
                fats: 1,
                calories: 135,
                consumed: false,
              },
              {
                id: 'f-n1-12',
                name: 'لبن',
                portion: '٢٥٠ مل لبن',
                icon: 'shake',
                protein: 8,
                carbs: 12,
                fats: 8,
                calories: 150,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n1-7',
            title: '7. وجبة مخصصة: استخدم خاصية الإدخال اليدوي الموجودة بالفعل.',
            isCustom: true,
            foods: [
              {
                id: 'f-n1-13',
                name: 'وجبة مخصصة (إدخال يدوي)',
                portion: 'حسب المتاح',
                icon: 'bowl',
                protein: 0,
                carbs: 0,
                fats: 0,
                calories: 0,
                consumed: false,
              },
            ],
          },
        ],
      },

      // 13:00 — سناك مرن
      {
        id: 'm-night-2',
        name: 'سناك مرن',
        scheduledTime: '01:00 PM',
        order: 2,
        selectedOptionId: 'opt-n2-1',
        consumed: false,
        notes: 'يمنع وجود فترة طويلة جدًا قبل الغداء العائلي. يظهر كوجبة اختيارية عند وجود أكثر من ٤ ساعات حتى الغداء.',
        foods: [
          {
            id: 'f-n2-1',
            name: 'جبنة قريش',
            portion: 'حوالي ١٠٠ جم',
            icon: 'salad',
            protein: 15,
            carbs: 3,
            fats: 1,
            calories: 85,
            consumed: false,
          },
          {
            id: 'f-n2-2',
            name: 'نصف رغيف عيش بلدي متوسط أو بطاطسة مسلوقة متوسطة',
            portion: 'نصف رغيف عيش أو بطاطسة',
            icon: 'bread',
            protein: 4,
            carbs: 27,
            fats: 1,
            calories: 135,
            consumed: false,
          },
        ],
        options: [
          {
            id: 'opt-n2-1',
            title: '1. حوالي ١٠٠ جم جبنة قريش + نصف رغيف عيش بلدي متوسط، أو بطاطسة مسلوقة متوسطة.',
            foods: [
              {
                id: 'f-n2-1',
                name: 'جبنة قريش',
                portion: 'حوالي ١٠٠ جم',
                icon: 'salad',
                protein: 15,
                carbs: 3,
                fats: 1,
                calories: 85,
                consumed: false,
              },
              {
                id: 'f-n2-2',
                name: 'نصف رغيف عيش بلدي متوسط أو بطاطسة مسلوقة متوسطة',
                portion: 'نصف رغيف عيش أو بطاطسة',
                icon: 'bread',
                protein: 4,
                carbs: 27,
                fats: 1,
                calories: 135,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n2-2',
            title: '2. ثلاثة أرباع طبق فول + نصف رغيف عيش بلدي متوسط، أو بطاطسة مسلوقة متوسطة.',
            foods: [
              {
                id: 'f-n2-3',
                name: 'ثلاثة أرباع طبق فول',
                portion: '٣/٤ طبق فول',
                icon: 'bowl',
                protein: 10,
                carbs: 28,
                fats: 3,
                calories: 180,
                consumed: false,
              },
              {
                id: 'f-n2-4',
                name: 'نصف رغيف عيش بلدي متوسط أو بطاطسة مسلوقة متوسطة',
                portion: 'نصف رغيف عيش أو بطاطسة',
                icon: 'bread',
                protein: 4,
                carbs: 27,
                fats: 1,
                calories: 135,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n2-3',
            title: '3. بيضتان كاملتان + نصف رغيف عيش بلدي متوسط، أو بطاطسة مسلوقة متوسطة.',
            foods: [
              {
                id: 'f-n2-5',
                name: 'بيضتان كاملتان',
                portion: 'بيضتان كاملتان',
                icon: 'egg',
                protein: 12,
                carbs: 1,
                fats: 10,
                calories: 140,
                consumed: false,
              },
              {
                id: 'f-n2-6',
                name: 'نصف رغيف عيش بلدي متوسط أو بطاطسة مسلوقة متوسطة',
                portion: 'نصف رغيف عيش أو بطاطسة',
                icon: 'bread',
                protein: 4,
                carbs: 27,
                fats: 1,
                calories: 135,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n2-4',
            title: '4. اختيار سريع: ٢٥٠ مل لبن مع مانجا، أو ٢٥٠ مل لبن مع ٤ بلحات سكري.',
            foods: [
              {
                id: 'f-n2-7',
                name: 'لبن مع مانجا أو ٤ بلحات سكري',
                portion: '٢٥٠ مل لبن + مانجا أو ٤ بلحات',
                icon: 'shake',
                protein: 8,
                carbs: 45,
                fats: 8,
                calories: 280,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n2-5',
            title: '5. اختيار من الخارج: سندوتش فول أو سندوتش جبنة بيضاء.',
            foods: [
              {
                id: 'f-n2-8',
                name: 'سندوتش فول أو سندوتش جبنة بيضاء',
                portion: 'سندوتش واحد',
                icon: 'bread',
                protein: 8,
                carbs: 30,
                fats: 5,
                calories: 200,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n2-6',
            title: '6. وجبة مخصصة: استخدم خاصية الإدخال اليدوي الموجودة بالفعل.',
            isCustom: true,
            foods: [
              {
                id: 'f-n2-9',
                name: 'وجبة مخصصة (إدخال يدوي)',
                portion: 'حسب المتاح',
                icon: 'bowl',
                protein: 0,
                carbs: 0,
                fats: 0,
                calories: 0,
                consumed: false,
              },
            ],
          },
        ],
      },

      // 18:00 — الغداء العائلي المرن (Same as Routine 1)
      {
        id: 'm-night-3',
        name: 'الغداء العائلي المرن',
        scheduledTime: '06:00 PM',
        order: 3,
        selectedOptionId: 'opt-n3-1',
        consumed: false,
        notes: 'بروتين أساسي + كربوهيدرات + خضار متاح.',
        foods: [
          {
            id: 'f-n3-1',
            name: 'صدر فراخ كامل',
            portion: 'صدر فراخ كامل',
            icon: 'chicken',
            protein: 45,
            carbs: 0,
            fats: 5,
            calories: 230,
            consumed: false,
          },
          {
            id: 'f-n3-2',
            name: 'رز أو مكرونة',
            portion: '٦ ملاعق أكل عادية في يوم التمرين',
            icon: 'bowl',
            protein: 4,
            carbs: 40,
            fats: 2,
            calories: 200,
            consumed: false,
          },
          {
            id: 'f-n3-3',
            name: 'سلطة أو خضار الغداء العائلي المتاح',
            portion: 'طبق سلطة أو خضار مطبوخ متاح',
            icon: 'salad',
            protein: 2,
            carbs: 8,
            fats: 1,
            calories: 50,
            consumed: false,
          },
        ],
        options: [
          {
            id: 'opt-n3-1',
            title: 'فراخ: صدر فراخ كامل + ٦ ملاعق أكل عادية رز أو مكرونة + خضار أو سلطة متاحة.',
            foods: [
              {
                id: 'f-n3-1',
                name: 'صدر فراخ كامل',
                portion: 'صدر فراخ كامل',
                icon: 'chicken',
                protein: 45,
                carbs: 0,
                fats: 5,
                calories: 230,
                consumed: false,
              },
              {
                id: 'f-n3-2',
                name: 'رز أو مكرونة',
                portion: '٦ ملاعق أكل عادية',
                icon: 'bowl',
                protein: 4,
                carbs: 40,
                fats: 2,
                calories: 200,
                consumed: false,
              },
              {
                id: 'f-n3-3',
                name: 'سلطة أو خضار الغداء المتاح',
                portion: 'حسب المتاح',
                icon: 'salad',
                protein: 2,
                carbs: 8,
                fats: 1,
                calories: 50,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n3-2',
            title: 'لحمة: قطعتان عاديتان (٣ قطع لو القطع صغيرة) + ٦ ملاعق أكل عادية رز أو مكرونة + خضار متاح.',
            foods: [
              {
                id: 'f-n3-4',
                name: 'لحمة',
                portion: 'قطعتان عاديتان (٣ قطع لو صغيرة)',
                icon: 'meat',
                protein: 40,
                carbs: 0,
                fats: 12,
                calories: 270,
                consumed: false,
              },
              {
                id: 'f-n3-5',
                name: 'رز أو مكرونة',
                portion: '٦ ملاعق أكل عادية',
                icon: 'bowl',
                protein: 4,
                carbs: 40,
                fats: 2,
                calories: 200,
                consumed: false,
              },
              {
                id: 'f-n3-6',
                name: 'سلطة أو خضار الغداء المتاح',
                portion: 'حسب المتاح',
                icon: 'salad',
                protein: 2,
                carbs: 8,
                fats: 1,
                calories: 50,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n3-3',
            title: 'كفتة: حوالي ٤ قطع + ٦ ملاعق أكل عادية رز أو مكرونة + خضار متاح.',
            foods: [
              {
                id: 'f-n3-7',
                name: 'كفتة',
                portion: 'حوالي ٤ قطع',
                icon: 'meat',
                protein: 30,
                carbs: 6,
                fats: 16,
                calories: 290,
                consumed: false,
              },
              {
                id: 'f-n3-8',
                name: 'رز أو مكرونة',
                portion: '٦ ملاعق أكل عادية',
                icon: 'bowl',
                protein: 4,
                carbs: 40,
                fats: 2,
                calories: 200,
                consumed: false,
              },
              {
                id: 'f-n3-9',
                name: 'سلطة أو خضار الغداء المتاح',
                portion: 'حسب المتاح',
                icon: 'salad',
                protein: 2,
                carbs: 8,
                fats: 1,
                calories: 50,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n3-4',
            title: 'عدس عند توفره: من ٦ إلى ٩ ملاعق أكل عادية + نصف رغيف عيش بلدي + خضار متاح.',
            foods: [
              {
                id: 'f-n3-10',
                name: 'عدس مطبوخ',
                portion: 'من ٦ إلى ٩ ملاعق أكل عادية',
                icon: 'bowl',
                protein: 16,
                carbs: 35,
                fats: 3,
                calories: 230,
                consumed: false,
              },
              {
                id: 'f-n3-11',
                name: 'عيش بلدي',
                portion: 'نصف رغيف عيش بلدي',
                icon: 'bread',
                protein: 4,
                carbs: 27,
                fats: 1,
                calories: 135,
                consumed: false,
              },
              {
                id: 'f-n3-12',
                name: 'سلطة أو خضار متاح',
                portion: 'حسب المتاح',
                icon: 'salad',
                protein: 2,
                carbs: 8,
                fats: 1,
                calories: 50,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n3-5',
            title: 'بطاطس محمرة مع الغداء: ٣ ملاعق أكل فقط + ومعها ٣ ملاعق رز أو مكرونة فقط + بروتين الغداء.',
            foods: [
              {
                id: 'f-n3-13',
                name: 'بروتين الغداء (فراخ أو لحمة أو كفتة)',
                portion: 'حسب المتاح في وجبة العائلة',
                icon: 'meat',
                protein: 38,
                carbs: 0,
                fats: 8,
                calories: 240,
                consumed: false,
              },
              {
                id: 'f-n3-14',
                name: 'بطاطس محمرة',
                portion: '٣ ملاعق أكل فقط',
                icon: 'bowl',
                protein: 2,
                carbs: 18,
                fats: 7,
                calories: 140,
                consumed: false,
              },
              {
                id: 'f-n3-15',
                name: 'رز أو مكرونة',
                portion: '٣ ملاعق أكل فقط',
                icon: 'bowl',
                protein: 2,
                carbs: 20,
                fats: 1,
                calories: 100,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n3-6',
            title: 'مكرونة بالبشاميل: من ٥ إلى ٦ ملاعق أكل (بدون رز أو عيش إضافي) + بروتين وسلطة.',
            foods: [
              {
                id: 'f-n3-16',
                name: 'مكرونة بالبشاميل',
                portion: 'من ٥ إلى ٦ ملاعق أكل (بدون رز أو عيش إضافي)',
                icon: 'bowl',
                protein: 16,
                carbs: 38,
                fats: 14,
                calories: 340,
                consumed: false,
              },
              {
                id: 'f-n3-17',
                name: 'سلطة أو خضار متاح',
                portion: 'حسب المتاح',
                icon: 'salad',
                protein: 2,
                carbs: 8,
                fats: 1,
                calories: 50,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n3-7',
            title: 'برجر: سندوتش برجر واحد + كمية صغيرة من البطاطس فقط لو موجودة.',
            foods: [
              {
                id: 'f-n3-18',
                name: 'سندوتش برجر',
                portion: 'سندوتش برجر واحد',
                icon: 'meat',
                protein: 26,
                carbs: 32,
                fats: 14,
                calories: 360,
                consumed: false,
              },
              {
                id: 'f-n3-19',
                name: 'بطاطس محمرة',
                portion: 'كمية صغيرة فقط لو مقدمة مع الوجبة',
                icon: 'bowl',
                protein: 2,
                carbs: 18,
                fats: 6,
                calories: 130,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n3-8',
            title: 'سندوتشات: استخدم العيش المتاح وسجله يدويًا.',
            foods: [
              {
                id: 'f-n3-20',
                name: 'سندوتشات عائلية (استخدم العيش المتاح وسجله يدويًا)',
                portion: 'حسب المتاح',
                icon: 'bread',
                protein: 25,
                carbs: 45,
                fats: 10,
                calories: 370,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n3-9',
            title: 'وجبة مخصصة: استخدم خاصية الإدخال اليدوي الموجودة بالفعل.',
            isCustom: true,
            foods: [
              {
                id: 'f-n3-21',
                name: 'وجبة عائلية مخصصة (إدخال يدوي)',
                portion: 'سجل أي أكل عائلي متاح',
                icon: 'bowl',
                protein: 0,
                carbs: 0,
                fats: 0,
                calories: 0,
                consumed: false,
              },
            ],
          },
        ],
      },

      // 20:30 إلى 21:00 — وجبة قبل التمرين (Same as Routine 1)
      {
        id: 'm-night-4',
        name: 'وجبة قبل التمرين',
        scheduledTime: '08:30 PM',
        order: 4,
        selectedOptionId: 'opt-n4-1',
        consumed: false,
        notes: 'بروتين + كربوهيدرات؛ وجبة بسيطة قبل التمرين.',
        foods: [
          {
            id: 'f-n4-1',
            name: 'بيضتان كاملتان',
            portion: 'بيضتان كاملتان',
            icon: 'egg',
            protein: 12,
            carbs: 1,
            fats: 10,
            calories: 140,
            consumed: false,
          },
          {
            id: 'f-n4-2',
            name: 'نصف إلى رغيف عيش بلدي متوسط، أو بطاطسة مسلوقة متوسطة',
            portion: 'نصف إلى رغيف عيش أو بطاطسة',
            icon: 'bread',
            protein: 5,
            carbs: 35,
            fats: 1,
            calories: 170,
            consumed: false,
          },
        ],
        options: [
          {
            id: 'opt-n4-1',
            title: '1. بيضتان كاملتان + نصف إلى رغيف عيش بلدي متوسط، أو بطاطسة مسلوقة متوسطة.',
            foods: [
              {
                id: 'f-n4-1',
                name: 'بيضتان كاملتان',
                portion: 'بيضتان كاملتان',
                icon: 'egg',
                protein: 12,
                carbs: 1,
                fats: 10,
                calories: 140,
                consumed: false,
              },
              {
                id: 'f-n4-2',
                name: 'نصف إلى رغيف عيش بلدي متوسط، أو بطاطسة مسلوقة متوسطة',
                portion: 'نصف إلى رغيف عيش أو بطاطسة',
                icon: 'bread',
                protein: 5,
                carbs: 35,
                fats: 1,
                calories: 170,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n4-2',
            title: '2. ثلاثة أرباع طبق فول + نصف رغيف عيش بلدي متوسط، أو بطاطسة مسلوقة متوسطة.',
            foods: [
              {
                id: 'f-n4-3',
                name: 'ثلاثة أرباع طبق فول',
                portion: '٣/٤ طبق فول',
                icon: 'bowl',
                protein: 10,
                carbs: 28,
                fats: 3,
                calories: 180,
                consumed: false,
              },
              {
                id: 'f-n4-4',
                name: 'نصف رغيف عيش بلدي متوسط أو بطاطسة مسلوقة متوسطة',
                portion: 'نصف رغيف عيش أو بطاطسة',
                icon: 'bread',
                protein: 4,
                carbs: 27,
                fats: 1,
                calories: 135,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n4-3',
            title: '3. حوالي ١٠٠ جم جبنة قريش + نصف رغيف عيش بلدي متوسط، أو بطاطسة مسلوقة متوسطة.',
            foods: [
              {
                id: 'f-n4-5',
                name: 'جبنة قريش',
                portion: 'حوالي ١٠٠ جم',
                icon: 'salad',
                protein: 15,
                carbs: 3,
                fats: 1,
                calories: 85,
                consumed: false,
              },
              {
                id: 'f-n4-6',
                name: 'نصف رغيف عيش بلدي متوسط أو بطاطسة مسلوقة متوسطة',
                portion: 'نصف رغيف عيش أو بطاطسة',
                icon: 'bread',
                protein: 4,
                carbs: 27,
                fats: 1,
                calories: 135,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n4-4',
            title: '4. طوارئ من الخارج: سندوتش فول.',
            foods: [
              {
                id: 'f-n4-7',
                name: 'سندوتش فول من الخارج',
                portion: 'سندوتش واحد',
                icon: 'bread',
                protein: 8,
                carbs: 30,
                fats: 4,
                calories: 190,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n4-5',
            title: '5. اختيار سريع عند ضيق الوقت فقط: ٢٥٠ مل لبن مع مانجا، أو ٢٥٠ مل لبن مع ٤ بلحات سكري، أو شاي بملعقة شاي صغيرة سكر، أو ملعقة كبيرة عسل مع لبن أو شاي.',
            foods: [
              {
                id: 'f-n4-8',
                name: 'لبن مع مانجا أو ٤ بلحات سكري / شاي بسكر أو ملعقة عسل',
                portion: '٢٥٠ مل لبن + مانجا أو بلح أو شاي/عسل',
                icon: 'shake',
                protein: 8,
                carbs: 45,
                fats: 8,
                calories: 280,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n4-6',
            title: '6. وجبة مخصصة: استخدم خاصية الإدخال اليدوي الموجودة بالفعل.',
            isCustom: true,
            foods: [
              {
                id: 'f-n4-9',
                name: 'وجبة مخصصة (إدخال يدوي)',
                portion: 'حسب المتاح',
                icon: 'bowl',
                protein: 0,
                carbs: 0,
                fats: 0,
                calories: 0,
                consumed: false,
              },
            ],
          },
        ],
      },

      // 00:15 — وجبة بعد التمرين / العشاء (Same as Routine 1 final meal)
      {
        id: 'm-night-5',
        name: 'وجبة بعد التمرين / العشاء',
        scheduledTime: '12:15 AM',
        order: 5,
        selectedOptionId: 'opt-n5-1',
        consumed: false,
        notes: 'بروتين + كربوهيدرات',
        foods: [
          {
            id: 'f-n5-1',
            name: '٣ بيضات كاملة',
            portion: '٣ بيضات كاملة',
            icon: 'egg',
            protein: 18,
            carbs: 1,
            fats: 15,
            calories: 210,
            consumed: false,
          },
          {
            id: 'f-n5-2',
            name: 'رغيف عيش بلدي متوسط أو بطاطستين مسلوقتين متوسطتين',
            portion: 'رغيف عيش بلدي أو بطاطستين',
            icon: 'bread',
            protein: 8,
            carbs: 55,
            fats: 2,
            calories: 270,
            consumed: false,
          },
        ],
        options: [
          {
            id: 'opt-n5-1',
            title: '1. ٣ بيضات كاملة + رغيف عيش بلدي متوسط، أو بطاطستين مسلوقتين متوسطتين.',
            foods: [
              {
                id: 'f-n5-1',
                name: '٣ بيضات كاملة',
                portion: '٣ بيضات كاملة',
                icon: 'egg',
                protein: 18,
                carbs: 1,
                fats: 15,
                calories: 210,
                consumed: false,
              },
              {
                id: 'f-n5-2',
                name: 'رغيف عيش بلدي متوسط أو بطاطستين مسلوقتين متوسطتين',
                portion: 'رغيف عيش بلدي أو بطاطستين',
                icon: 'bread',
                protein: 8,
                carbs: 55,
                fats: 2,
                calories: 270,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n5-2',
            title: '2. طبق فول + رغيف عيش بلدي متوسط، أو بطاطسة مسلوقة متوسطة.',
            foods: [
              {
                id: 'f-n5-3',
                name: 'طبق فول',
                portion: 'طبق فول متوسط',
                icon: 'bowl',
                protein: 14,
                carbs: 38,
                fats: 4,
                calories: 240,
                consumed: false,
              },
              {
                id: 'f-n5-4',
                name: 'رغيف عيش بلدي متوسط أو بطاطسة مسلوقة متوسطة',
                portion: 'رغيف عيش بلدي أو بطاطسة',
                icon: 'bread',
                protein: 8,
                carbs: 55,
                fats: 2,
                calories: 270,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n5-3',
            title: '3. حوالي ١٥٠ جم جبنة قريش + عيش أو بطاطس مسلوقة + ٢٥٠ مل لبن.',
            foods: [
              {
                id: 'f-n5-5',
                name: 'جبنة قريش',
                portion: 'حوالي ١٥٠ جم',
                icon: 'salad',
                protein: 22,
                carbs: 5,
                fats: 2,
                calories: 130,
                consumed: false,
              },
              {
                id: 'f-n5-6',
                name: 'عيش بلدي أو بطاطس مسلوقة',
                portion: 'رغيف بلدي أو بطاطس مسلوقة',
                icon: 'bread',
                protein: 8,
                carbs: 55,
                fats: 2,
                calories: 270,
                consumed: false,
              },
              {
                id: 'f-n5-7',
                name: 'لبن',
                portion: '٢٥٠ مل لبن',
                icon: 'shake',
                protein: 8,
                carbs: 12,
                fats: 8,
                calories: 150,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n5-4',
            title: '4. بواقي فراخ أو لحمة أو كفتة + من ٥ إلى ٦ ملاعق أكل عادية رز أو مكرونة.',
            foods: [
              {
                id: 'f-n5-8',
                name: 'بواقي فراخ أو لحمة أو كفتة الغداء',
                portion: 'صدر فراخ أو قطعتان لحمة أو ٤ كفتة',
                icon: 'meat',
                protein: 35,
                carbs: 0,
                fats: 8,
                calories: 220,
                consumed: false,
              },
              {
                id: 'f-n5-9',
                name: 'رز أو مكرونة',
                portion: 'من ٥ إلى ٦ ملاعق أكل عادية',
                icon: 'bowl',
                protein: 4,
                carbs: 38,
                fats: 2,
                calories: 190,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n5-5',
            title: '5. طوارئ من الخارج: سندوتش فول + ٢٥٠ مل لبن.',
            foods: [
              {
                id: 'f-n5-10',
                name: 'سندوتش فول من الخارج',
                portion: 'سندوتش واحد',
                icon: 'bread',
                protein: 8,
                carbs: 30,
                fats: 4,
                calories: 190,
                consumed: false,
              },
              {
                id: 'f-n5-11',
                name: 'لبن',
                portion: '٢٥٠ مل لبن',
                icon: 'shake',
                protein: 8,
                carbs: 12,
                fats: 8,
                calories: 150,
                consumed: false,
              },
            ],
          },
          {
            id: 'opt-n5-6',
            title: '6. وجبة مخصصة: استخدم خاصية الإدخال اليدوي الموجودة بالفعل.',
            isCustom: true,
            foods: [
              {
                id: 'f-n5-12',
                name: 'وجبة مخصصة (إدخال يدوي)',
                portion: 'حسب المتاح',
                icon: 'bowl',
                protein: 0,
                carbs: 0,
                fats: 0,
                calories: 0,
                consumed: false,
              },
            ],
          },
        ],
      },
    ],
  },
];
