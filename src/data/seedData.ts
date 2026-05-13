// Auto-generated seed data from CSV files
// Generated: 2026-05-13T13:14:05.654Z

export interface SetEntry {
  weight: number;
  reps: number;
  notes?: string;
}

export interface ExerciseEntry {
  name: string;
  sets: SetEntry[];
}

export interface WorkoutEntry {
  id: string;
  date: string;
  type: 'pull' | 'push' | 'leg';
  exercises: ExerciseEntry[];
}

export const seedWorkouts: Omit<WorkoutEntry, 'id'>[] = [
  {
    date: "2025-03-05",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 67.5,
            reps: 8
          },
          {
            weight: 67.5,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 22.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      },
      {
        name: "Bench Press",
        sets: [
          {
            weight: 85,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-06",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 70,
            reps: 8
          },
          {
            weight: 70,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 65,
            reps: 7.5
          },
          {
            weight: 60,
            reps: 7.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 14,
            reps: 7
          },
          {
            weight: 14,
            reps: 6
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 40,
            reps: 8
          }
        ]
      },
      {
        name: "Back Ext",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-09",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 70,
            reps: 8
          },
          {
            weight: 72.5,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      },
      {
        name: "Bench Press",
        sets: [
          {
            weight: 90,
            reps: 5
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-10",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 75,
            reps: 8
          },
          {
            weight: 80,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 65,
            reps: 8
          },
          {
            weight: 70,
            reps: 6.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 60,
            reps: 8
          },
          {
            weight: 65,
            reps: 7
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-11",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 120,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 75,
            reps: 8
          },
          {
            weight: 77.5,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 130,
            reps: 8
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 47.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-13",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 72.5,
            reps: 8
          },
          {
            weight: 75,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 90,
            reps: 7
          }
        ]
      },
      {
        name: "Bench Press",
        sets: [
          {
            weight: 87.5,
            reps: 4
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-14",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 92.5,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      },
      {
        name: "Bench Press",
        sets: [
          {
            weight: 87.5,
            reps: 5
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-15",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 70,
            reps: 7.5
          },
          {
            weight: 65,
            reps: 8
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 65,
            reps: 8
          },
          {
            weight: 65,
            reps: 8
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 70,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-15",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 85,
            reps: 7
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 100,
            reps: 7.5
          },
          {
            weight: 100,
            reps: 4.25
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 4.25
          },
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-17",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 70,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 75,
            reps: 7
          },
          {
            weight: 75,
            reps: 7.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 87.5,
            reps: 8
          }
        ]
      },
      {
        name: "Bench Press",
        sets: [
          {
            weight: 95,
            reps: 5
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-18",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 95,
            reps: 6
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 82.5,
            reps: 8
          },
          {
            weight: 82.5,
            reps: 5.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 26.25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-19",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 65,
            reps: 8
          },
          {
            weight: 70,
            reps: 8
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 70,
            reps: 8
          },
          {
            weight: 70,
            reps: 7
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      },
      {
        name: "Back Ext",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-24",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 75,
            reps: 8
          },
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 26.25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      },
      {
        name: "Bench Press",
        sets: [
          {
            weight: 85,
            reps: 6
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-26",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 85,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 75,
            reps: 4
          },
          {
            weight: 65,
            reps: 8
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 65,
            reps: 8
          },
          {
            weight: 70,
            reps: 6
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-29",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 92.5,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      },
      {
        name: "Bench Press",
        sets: [
          {
            weight: 85,
            reps: 4
          }
        ]
      }
    ]
  },
  {
    date: "2025-03-31",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 85,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 70,
            reps: 8
          },
          {
            weight: 70,
            reps: 8
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 70,
            reps: 8
          },
          {
            weight: 70,
            reps: 7
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      },
      {
        name: "Back Ext",
        sets: [
          {
            weight: 35,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-04-07",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 75,
            reps: 8
          },
          {
            weight: 75,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 81.25,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-04-10",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 92.5,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 77.5,
            reps: 8
          },
          {
            weight: 77.5,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 26.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-04-12",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 70,
            reps: 8
          },
          {
            weight: 70,
            reps: 8
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 40,
            reps: 8
          },
          {
            weight: 40,
            reps: 6
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-04-15",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 75,
            reps: 7
          },
          {
            weight: 75,
            reps: 5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 65,
            reps: 8
          },
          {
            weight: 72.5,
            reps: 6
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 65,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-04-19",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 85,
            reps: 8
          },
          {
            weight: 90,
            reps: 8,
            notes: "0 rir"
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 75,
            reps: 8,
            notes: "0rir"
          },
          {
            weight: 75,
            reps: 7
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 72.5,
            reps: 7
          },
          {
            weight: 72.5,
            reps: 6
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 82.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-04-20",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 120,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 77.5,
            reps: 8
          },
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 105,
            reps: 8
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 140,
            reps: 8
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 50,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-04-22",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 60,
            reps: 8
          },
          {
            weight: 60,
            reps: 6
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 82.5,
            reps: 8
          },
          {
            weight: 82.5,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-04-23",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 75,
            reps: 8
          },
          {
            weight: 75,
            reps: 7
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 72.5,
            reps: 8
          },
          {
            weight: 72.5,
            reps: 6
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 87.5,
            reps: 9
          }
        ]
      }
    ]
  },
  {
    date: "2025-04-26",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 82.5,
            reps: 8
          },
          {
            weight: 82.5,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-04-28",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 8,
            notes: "(nicht mehr machen)"
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 75,
            reps: 8
          },
          {
            weight: 75,
            reps: 8,
            notes: "(letzten 3 partials)"
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 72.5,
            reps: 7
          },
          {
            weight: 72.5,
            reps: 6
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 82.5,
            reps: 8
          }
        ]
      },
      {
        name: "Back Ext",
        sets: [
          {
            weight: 35,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-05-02",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 82.5,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-05-03",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 75,
            reps: 8,
            notes: "letzter partial"
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 72.5,
            reps: 8
          },
          {
            weight: 72.5,
            reps: 6
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 82.5,
            reps: 8
          }
        ]
      },
      {
        name: "Back Ext",
        sets: [
          {
            weight: 40,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-05-07",
    type: "push",
    exercises: [
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 82.5,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 20,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-05-12",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 70,
            reps: 8
          },
          {
            weight: 60,
            reps: 7
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 82.5,
            reps: 8
          },
          {
            weight: 85,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 7
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 27.5,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2025-05-13",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 95,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 7
          },
          {
            weight: 80,
            reps: 6
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 50,
            reps: 8
          },
          {
            weight: 50,
            reps: 5.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 70,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-05-16",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 82.5,
            reps: 8
          },
          {
            weight: 85,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-05-18",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 85,
            reps: 8
          },
          {
            weight: 87.5,
            reps: 7.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 6
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 50,
            reps: 6
          },
          {
            weight: 45,
            reps: 7
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-05-19",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 120,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 85,
            reps: 7
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 105,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 60,
            reps: 9
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 55,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-05-22",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 85,
            reps: 8
          },
          {
            weight: 85,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-05-26",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 85,
            reps: 8
          },
          {
            weight: 85,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-05-28",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 90,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 6
          },
          {
            weight: 75,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 70,
            reps: 8
          },
          {
            weight: 72.5,
            reps: 5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-03",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 6
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 67.5,
            reps: 8
          }
        ]
      },
      {
        name: "Back Ext",
        sets: [
          {
            weight: 40,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-05",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 85,
            reps: 8
          },
          {
            weight: 85,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 28.75,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-08",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 5.5
          },
          {
            weight: 75,
            reps: 7.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 72.5,
            reps: 7.5
          },
          {
            weight: 72.5,
            reps: 7
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 70,
            reps: 8
          }
        ]
      },
      {
        name: "Back Ext",
        sets: [
          {
            weight: 55,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-10",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 85,
            reps: 8
          },
          {
            weight: 87.5,
            reps: 7.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-11",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 7.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 5.5
          },
          {
            weight: 75,
            reps: 7.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 50,
            reps: 7.5
          },
          {
            weight: 50,
            reps: 6
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Back Ext",
        sets: [
          {
            weight: 55,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-13",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 90,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 28.75,
            reps: 3.5,
            notes: "->"
          },
          {
            weight: 27.5,
            reps: 5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 27.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-14",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 95,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 50,
            reps: 8
          },
          {
            weight: 50,
            reps: 6
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 72.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-17",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 90,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 85,
            reps: 6
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-18",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 95,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 82.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 50,
            reps: 8
          },
          {
            weight: 50,
            reps: 6.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      },
      {
        name: "Back Ext",
        sets: [
          {
            weight: 40,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-20",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 120,
            reps: 8
          },
          {
            weight: 140,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 85,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 100,
            reps: 7.5
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 150,
            reps: 8
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 50,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-21",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 90,
            reps: 7
          },
          {
            weight: 90,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-23",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 82.5,
            reps: 7
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 50,
            reps: 8
          },
          {
            weight: 50,
            reps: 6.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-25",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 90,
            reps: 5.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 27.5,
            reps: 7.5
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-27",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 7
          },
          {
            weight: 75,
            reps: 7
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 75,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2025-06-30",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 90,
            reps: 5.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-07-01",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 7
          },
          {
            weight: 75,
            reps: 7.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 50,
            reps: 6
          }
        ]
      }
    ]
  },
  {
    date: "2025-07-06",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 90,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-07-09",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 7.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 75,
            reps: 7.5
          },
          {
            weight: 75,
            reps: 6.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 20,
            reps: 6
          },
          {
            weight: 18,
            reps: 8
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-07-10",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 120,
            reps: 8
          },
          {
            weight: 140,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 150,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-07-13",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 90,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 27.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-07-14",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 70,
            reps: 8
          },
          {
            weight: 80,
            reps: 6.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 18,
            reps: 8
          },
          {
            weight: 18,
            reps: 8
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-07-17",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 90,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-07-19",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 82.5,
            reps: 8
          },
          {
            weight: 90,
            reps: 7.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 6
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 50,
            reps: 8
          },
          {
            weight: 50,
            reps: 6
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-07-21",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 120,
            reps: 8
          },
          {
            weight: 140,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 85,
            reps: 6.5
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 100,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-07-22",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 70,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 90,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 35,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-07-23",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 20,
            reps: 8
          },
          {
            weight: 20,
            reps: 6
          }
        ]
      }
    ]
  },
  {
    date: "2025-07-29",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 90,
            reps: 4
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-07-31",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 6
          },
          {
            weight: 75,
            reps: 8
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 50,
            reps: 8
          },
          {
            weight: 50,
            reps: 6.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-08-08",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 95,
            reps: 5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 75,
            reps: 8
          },
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 45,
            reps: 8
          },
          {
            weight: 50,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 87.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-08-13",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 87.5,
            reps: 5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-08-18",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 85,
            reps: 8
          },
          {
            weight: 90,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 75,
            reps: 8
          },
          {
            weight: 75,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 50,
            reps: 7
          },
          {
            weight: 45,
            reps: 8,
            notes: "0rir"
          }
        ]
      }
    ]
  },
  {
    date: "2025-08-20",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 90,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 95,
            reps: 5
          }
        ]
      }
    ]
  },
  {
    date: "2025-08-22",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 140,
            reps: 8
          },
          {
            weight: 150,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 87.5,
            reps: 7.5
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 155,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-08-23",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 90,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 90,
            reps: 6
          }
        ]
      }
    ]
  },
  {
    date: "2025-08-24",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 65,
            reps: 8
          },
          {
            weight: 72.5,
            reps: 8
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 50,
            reps: 8
          },
          {
            weight: 50,
            reps: 7
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 77.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-08-27",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-08-29",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 85,
            reps: 6.5
          }
        ]
      }
    ]
  },
  {
    date: "2025-09-29",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-09-30",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 85,
            reps: 8
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 70,
            reps: 8
          },
          {
            weight: 70,
            reps: 8
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 72.5,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-01",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 140,
            reps: 8
          },
          {
            weight: 140,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 85,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 100,
            reps: 7
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 150,
            reps: 8
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 40,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-03",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 7.5
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 85,
            reps: 8
          },
          {
            weight: 85,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 28.75,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 58,
            reps: 9
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-04",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 7
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 72.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-05",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 140,
            reps: 8
          },
          {
            weight: 140,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 40,
            reps: 8
          },
          {
            weight: 45,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 100,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 160,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-07",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 6.5
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 85,
            reps: 8
          },
          {
            weight: 85,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 65,
            reps: 9
          }
        ]
      },
      {
        name: "Bench Press",
        sets: [
          {
            weight: 75,
            reps: 8,
            notes: "2rir"
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-08",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 85,
            reps: 8
          },
          {
            weight: 90,
            reps: 7.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 85,
            reps: 8
          },
          {
            weight: 85,
            reps: 7
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-09",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 140,
            reps: 8
          },
          {
            weight: 150,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 45,
            reps: 8
          },
          {
            weight: 47.5,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 50,
            reps: 8
          },
          {
            weight: 52.5,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 165,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-12",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 87.5,
            reps: 5.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-13",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 90,
            reps: 7.5
          },
          {
            weight: 90,
            reps: 6.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-14",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 145,
            reps: 8
          },
          {
            weight: 150,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 47.5,
            reps: 8
          },
          {
            weight: 50,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 52.5,
            reps: 8
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 165,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-16",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 6
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 87.5,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-17",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 6.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-20",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 90,
            reps: 7
          },
          {
            weight: 90,
            reps: 5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 7.5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-21",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 7.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 8
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 77.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-22",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 140,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 85,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 105,
            reps: 8
          },
          {
            weight: 105,
            reps: 8
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 170,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-24",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 90,
            reps: 7.5
          },
          {
            weight: 90,
            reps: 5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-25",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 6
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-26",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 130,
            reps: 8
          },
          {
            weight: 140,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 85,
            reps: 8
          },
          {
            weight: 87.5,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 105,
            reps: 9
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 175,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-28",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 90,
            reps: 7
          },
          {
            weight: 90,
            reps: 5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 82.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-10-29",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 95,
            reps: 7
          },
          {
            weight: 95,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 77.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-03",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-04",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 77.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-05",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 140,
            reps: 8
          },
          {
            weight: 150,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 87.5,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 110,
            reps: 8
          },
          {
            weight: 115,
            reps: 7
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 175,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-07",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 90,
            reps: 6.5
          },
          {
            weight: 90,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-08",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 5.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 5.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 87.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-09",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 140,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 85,
            reps: 8
          },
          {
            weight: 85,
            reps: 7.5
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 115,
            reps: 8
          },
          {
            weight: 115,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 175,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-11",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 80,
            reps: 6
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 87.5,
            reps: 5
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-12",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 7.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 6.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 87.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-13",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 150,
            reps: 8
          },
          {
            weight: 150,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 57.5,
            reps: 8
          },
          {
            weight: 57.5,
            reps: 4
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 175,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-15",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 5.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 31.25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-15",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 160,
            reps: 8
          },
          {
            weight: 165,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 92.5,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 60,
            reps: 8
          },
          {
            weight: 60,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 180,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-16",
    type: "pull",
    exercises: [
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 7.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 7
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 77.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-17",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 150,
            reps: 8
          },
          {
            weight: 155,
            reps: 8,
            notes: "geht noch was"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 92.5,
            reps: 8
          },
          {
            weight: 92.5,
            reps: 6
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 115,
            reps: 8
          },
          {
            weight: 115,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-19",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 31.25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 87.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-20",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 85,
            reps: 8
          },
          {
            weight: 90,
            reps: 7.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 7
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 77.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-21",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 150,
            reps: 8
          },
          {
            weight: 150,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 92.5,
            reps: 8
          },
          {
            weight: 92.5,
            reps: 6
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 177.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-23",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 31.25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 87.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-24",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 5.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 7
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 52.5,
            reps: 8
          },
          {
            weight: 52.5,
            reps: 6
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-25",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 155,
            reps: 8
          },
          {
            weight: 155,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 92.5,
            reps: 8
          },
          {
            weight: 92.5,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 117.5,
            reps: 8
          },
          {
            weight: 117.5,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 180,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-27",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 31.25,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 65,
            reps: 6
          }
        ]
      },
      {
        name: "Bench Press",
        sets: [
          {
            weight: 70,
            reps: 8,
            notes: "0rir"
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-28",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 6
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 7.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 55,
            reps: 8
          },
          {
            weight: 55,
            reps: 5.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 87.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-11-29",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 155,
            reps: 8
          },
          {
            weight: 160,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 87.5,
            reps: 8
          },
          {
            weight: 90,
            reps: 6.5
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 57.5,
            reps: 8
          },
          {
            weight: 57.5,
            reps: 7
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 180,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-01",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 92.5,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 32.5,
            reps: 7
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 62.5,
            reps: 6
          }
        ]
      },
      {
        name: "Bench Press",
        sets: [
          {
            weight: 57.5,
            reps: 5
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-02",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 90,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 40,
            reps: 7
          },
          {
            weight: 35,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-03",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 160,
            reps: 8
          },
          {
            weight: 160,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 92.5,
            reps: 8
          },
          {
            weight: 92.5,
            reps: 7.5
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 57.5,
            reps: 8
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 180,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-05",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 92.5,
            reps: 8
          },
          {
            weight: 92.5,
            reps: 5.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 32.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 62.5,
            reps: 5.5
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-06",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 97.5,
            reps: 7.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 55,
            reps: 6.5
          },
          {
            weight: 55,
            reps: 5.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-07",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 155,
            reps: 8
          },
          {
            weight: 155,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 57.5,
            reps: 8
          },
          {
            weight: 57.5,
            reps: 7
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-09",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 92.5,
            reps: 8
          },
          {
            weight: 92.5,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 32.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 60,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-10",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 90,
            reps: 7
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 7
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 55,
            reps: 6.5
          },
          {
            weight: 55,
            reps: 5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 82.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-11",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 160,
            reps: 8
          },
          {
            weight: 160,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 92.5,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 57.5,
            reps: 8
          },
          {
            weight: 57.5,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 77.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-13",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 92.5,
            reps: 7.5
          },
          {
            weight: 92.5,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 32.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-14",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 90,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 55,
            reps: 6.5
          },
          {
            weight: 55,
            reps: 6
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 82.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-17",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 92.5,
            reps: 8
          },
          {
            weight: 92.5,
            reps: 5.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 35,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-18",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 7.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 82.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-19",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 160,
            reps: 8
          },
          {
            weight: 165,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 60,
            reps: 8
          },
          {
            weight: 60,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 180,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-21",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 80,
            reps: 7.5
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 92.5,
            reps: 8
          },
          {
            weight: 92.5,
            reps: 5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 34,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-22",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 90,
            reps: 7.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 95,
            reps: 6.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 82.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-23",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 60,
            reps: 8
          },
          {
            weight: 60,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 75,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-25",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 92.5,
            reps: 8
          },
          {
            weight: 92.5,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 35,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-26",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          },
          {
            weight: 100,
            reps: 7
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-27",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 160,
            reps: 8
          },
          {
            weight: 165,
            reps: 8,
            notes: "2rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 60,
            reps: 8
          },
          {
            weight: 62.5,
            reps: 7.5
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 180,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-29",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 80,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 92.5,
            reps: 8
          },
          {
            weight: 95,
            reps: 5.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 35,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 87.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-30",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 92.5,
            reps: 7.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 97.5,
            reps: 8
          },
          {
            weight: 97.5,
            reps: 6.5
          }
        ]
      }
    ]
  },
  {
    date: "2025-12-31",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 160,
            reps: 8
          },
          {
            weight: 170,
            reps: 5
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 97.5,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 62.5,
            reps: 8
          },
          {
            weight: 65,
            reps: 6
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 185,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-02",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 92.5,
            reps: 8
          },
          {
            weight: 97.5,
            reps: 7
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 37.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 87.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-02",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 87.5,
            reps: 7
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 97.5,
            reps: 8
          },
          {
            weight: 97.5,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 70,
            reps: 7
          },
          {
            weight: 37.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 95,
            reps: 6
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-03",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 100,
            reps: 7.5
          },
          {
            weight: 100,
            reps: 5.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-04",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 165,
            reps: 8
          },
          {
            weight: 170,
            reps: 5
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 97.5,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 65,
            reps: 8
          },
          {
            weight: 65,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-06",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 95,
            reps: 8
          },
          {
            weight: 97.5,
            reps: 4.5
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-07",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 100,
            reps: 7.5
          },
          {
            weight: 100,
            reps: 6
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 55,
            reps: 8
          },
          {
            weight: 57.5,
            reps: 4.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 60,
            reps: 6
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-08",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 170,
            reps: 8
          },
          {
            weight: 170,
            reps: 7
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 97.5,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 67.5,
            reps: 8
          },
          {
            weight: 67.5,
            reps: 5
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 185,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-10",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 36,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 97.5,
            reps: 6.5
          },
          {
            weight: 97.5,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 37.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 92.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-11",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 100,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 100,
            reps: 6.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 57.5,
            reps: 4
          },
          {
            weight: 55,
            reps: 5
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-12",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 170,
            reps: 8
          },
          {
            weight: 170,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 97.5,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 67.5,
            reps: 8
          },
          {
            weight: 67.5,
            reps: 6
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-14",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 87.5,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 97.5,
            reps: 7
          },
          {
            weight: 97.5,
            reps: 5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 37.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 95,
            reps: 5
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-15",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 100,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 100,
            reps: 6.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-16",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 172.5,
            reps: 8
          },
          {
            weight: 172.5,
            reps: 6
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 100,
            reps: 7
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 67.5,
            reps: 8
          },
          {
            weight: 67.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 190,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-18",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 36,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 35,
            reps: 8,
            notes: "0rir"
          },
          {
            weight: 35,
            reps: 5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 37.5,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 95,
            reps: 8,
            notes: "0rir"
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-19",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 100,
            reps: 7
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 100,
            reps: 7
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 87.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-20",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 172.5,
            reps: 8
          },
          {
            weight: 175,
            reps: 5
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 95,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 70,
            reps: 7
          },
          {
            weight: 70,
            reps: 6
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 195,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-22",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 90,
            reps: 5.25
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 97.5,
            reps: 8
          },
          {
            weight: 97.5,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 72.5,
            reps: 6
          },
          {
            weight: 37.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 95,
            reps: 6.5
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-28",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 100,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 100,
            reps: 7.5
          },
          {
            weight: 100,
            reps: 6.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 55,
            reps: 8
          },
          {
            weight: 55,
            reps: 4.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 90,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-29",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 100,
            reps: 6
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 70,
            reps: 8
          },
          {
            weight: 70,
            reps: 6.5
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 195,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-30",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 90,
            reps: 4.5
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 97.5,
            reps: 8
          },
          {
            weight: 97.5,
            reps: 4
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 70,
            reps: 6.5
          },
          {
            weight: 35,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 95,
            reps: 8,
            notes: "0rir"
          }
        ]
      }
    ]
  },
  {
    date: "2026-01-31",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 100,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 100,
            reps: 7
          },
          {
            weight: 100,
            reps: 6
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 55,
            reps: 6
          },
          {
            weight: 55,
            reps: 4.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-01",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 110,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 100,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 70,
            reps: 8
          },
          {
            weight: 70,
            reps: 7
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 197.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-03",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 100,
            reps: 7.5
          },
          {
            weight: 100,
            reps: 6
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 55,
            reps: 8
          },
          {
            weight: 55,
            reps: 5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-04",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 110,
            reps: 8
          },
          {
            weight: 110,
            reps: 8,
            notes: "3rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 100,
            reps: 7
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 70,
            reps: 8
          },
          {
            weight: 70,
            reps: 7
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 197.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-05",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 97.5,
            reps: 6.5
          },
          {
            weight: 95,
            reps: 5.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 72.5,
            reps: 6
          },
          {
            weight: 38.75,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-07",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 100,
            reps: 7.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 100,
            reps: 7
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 55,
            reps: 7.5
          },
          {
            weight: 55,
            reps: 5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-08",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 175,
            reps: 8
          },
          {
            weight: 175,
            reps: 6
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 100,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 200,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-09",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 87.5,
            reps: 6
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 97.5,
            reps: 8
          },
          {
            weight: 97.5,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 72.5,
            reps: 4.5
          },
          {
            weight: 38.75,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 85,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-10",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 100,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 110,
            reps: 5.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 55,
            reps: 7.5
          },
          {
            weight: 55,
            reps: 5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-12",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 180,
            reps: 8
          },
          {
            weight: 185,
            reps: 7
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 70,
            reps: 8
          },
          {
            weight: 72.5,
            reps: 7
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 200,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-13",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 87.5,
            reps: 7
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 100,
            reps: 6.5
          },
          {
            weight: 97.5,
            reps: 5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 25,
            reps: 5
          },
          {
            weight: 40,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 95,
            reps: 6
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-14",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 100,
            reps: 7.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 102.5,
            reps: 7.5
          },
          {
            weight: 100,
            reps: 6.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 55,
            reps: 8
          },
          {
            weight: 55,
            reps: 4.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 92.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-16",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 100,
            reps: 5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 5
          },
          {
            weight: 40,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      },
      {
        name: "Bench Press",
        sets: [
          {
            weight: 97.5,
            reps: 5
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-17",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 102.5,
            reps: 8
          },
          {
            weight: 102.5,
            reps: 5.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 57.5,
            reps: 5.5
          },
          {
            weight: 55,
            reps: 4.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 92.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-18",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 185,
            reps: 8
          },
          {
            weight: 185,
            reps: 5
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 72.5,
            reps: 8
          },
          {
            weight: 72.5,
            reps: 5
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 200,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-20",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 87.5,
            reps: 7.5
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 102.5,
            reps: 6
          },
          {
            weight: 100,
            reps: 5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 6
          },
          {
            weight: 35,
            reps: 4.5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 97.5,
            reps: 7.5
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-21",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 102.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 105,
            reps: 6
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 57.5,
            reps: 6.5
          },
          {
            weight: 57.5,
            reps: 4.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 95,
            reps: 7.5
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-22",
    type: "leg",
    exercises: [
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 72.5,
            reps: 8
          },
          {
            weight: 72.5,
            reps: 7
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 202.5,
            reps: 8,
            notes: "1rir"
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-23",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 105,
            reps: 7
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 102.5,
            reps: 6.5
          },
          {
            weight: 100,
            reps: 5.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 5
          },
          {
            weight: 32.5,
            reps: 7.5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 97.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-25",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 102.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 105,
            reps: 7
          },
          {
            weight: 105,
            reps: 5.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 57.5,
            reps: 7.5
          },
          {
            weight: 57.5,
            reps: 4
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-26",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 187.5,
            reps: 8,
            notes: "0rir"
          },
          {
            weight: 187.5,
            reps: 6,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 102.5,
            reps: 7.5
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 75,
            reps: 7
          },
          {
            weight: 75,
            reps: 4
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 205,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-02-28",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 87.5,
            reps: 6
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 102.5,
            reps: 7
          },
          {
            weight: 102.5,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 6
          },
          {
            weight: 32.5,
            reps: 7.5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 100,
            reps: 5
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-01",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 102.5,
            reps: 7.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 90,
            reps: 8
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 60,
            reps: 8,
            notes: "1rir"
          },
          {
            weight: 60,
            reps: 5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 97.5,
            reps: 7.5
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-02",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 187.5,
            reps: 8,
            notes: "0-1rir"
          },
          {
            weight: 187.5,
            reps: 5,
            notes: "1-2rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 102.5,
            reps: 7
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 75,
            reps: 7
          },
          {
            weight: 75,
            reps: 5
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 210,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-14",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 180,
            reps: 8
          },
          {
            weight: 180,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 200,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-15",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 200,
            reps: 8
          },
          {
            weight: 200,
            reps: 6
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 77.5,
            reps: 8
          },
          {
            weight: 77.5,
            reps: 6
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 220,
            reps: 8,
            notes: "1rir"
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 152.5,
            reps: 8,
            notes: "0rir"
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-16",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 102.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 95,
            reps: 9.5,
            notes: "(kelso)"
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 60,
            reps: 6.5
          },
          {
            weight: 60,
            reps: 4.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 97.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-18",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 187.5,
            reps: 8,
            notes: "0-1rir"
          },
          {
            weight: 187.5,
            reps: 6
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 102.5,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 72.5,
            reps: 8
          },
          {
            weight: 72.5,
            reps: 6
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 210,
            reps: 8
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-19",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 87.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 102.5,
            reps: 6.5
          },
          {
            weight: 102.5,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 4.5
          },
          {
            weight: 32.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 97.5,
            reps: 5
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-20",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 102.5,
            reps: 7
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 100,
            reps: 8
          },
          {
            weight: 105,
            reps: 8,
            notes: "2rir"
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 60,
            reps: 8,
            notes: "1rir"
          },
          {
            weight: 60,
            reps: 5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 100,
            reps: 6
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-22",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 190,
            reps: 8
          },
          {
            weight: 190,
            reps: 6
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 105,
            reps: 7
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 75,
            reps: 8
          },
          {
            weight: 75,
            reps: 5
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 210,
            reps: 8
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 125,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-23",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 87.5,
            reps: 7
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 102.5,
            reps: 5.5
          },
          {
            weight: 100,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 5
          },
          {
            weight: 35,
            reps: 6.5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 95,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-24",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 105,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 107.5,
            reps: 8
          },
          {
            weight: 110,
            reps: 8,
            notes: "1-2rir"
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 24,
            reps: 7
          },
          {
            weight: 24,
            reps: 4.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 100,
            reps: 7.5
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-24",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 200,
            reps: 8
          },
          {
            weight: 200,
            reps: 6
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 107.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 77.5,
            reps: 8
          },
          {
            weight: 77.5,
            reps: 7
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 225,
            reps: 7
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 152.5,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-25",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 192.5,
            reps: 8
          },
          {
            weight: 192.5,
            reps: 6,
            notes: "0-1 rir"
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 105,
            reps: 7.5
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 75,
            reps: 8
          },
          {
            weight: 75,
            reps: 6.75
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 215,
            reps: 8
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 127.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-26",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 87.5,
            reps: 7.25
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 102.5,
            reps: 6
          },
          {
            weight: 102.5,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 27.5,
            reps: 6.5
          },
          {
            weight: 35,
            reps: 6.5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 97.5,
            reps: 6.25
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-27",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 105,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 115,
            reps: 8
          },
          {
            weight: 117.5,
            reps: 8,
            notes: "0-1rir"
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 62.5,
            reps: 6
          },
          {
            weight: 60,
            reps: 5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-29",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 195,
            reps: 8
          },
          {
            weight: 195,
            reps: 7
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 105,
            reps: 7.5
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 77.5,
            reps: 6
          },
          {
            weight: 77.5,
            reps: 4
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 215,
            reps: 8
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 140,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-30",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 80,
            reps: 6
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 102.5,
            reps: 6.5
          },
          {
            weight: 102.5,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 5
          },
          {
            weight: 35,
            reps: 5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 97.5,
            reps: 8,
            notes: "0rir"
          }
        ]
      }
    ]
  },
  {
    date: "2026-03-31",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 105,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 120,
            reps: 8
          },
          {
            weight: 122.5,
            reps: 7
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 62.5,
            reps: 7.5
          },
          {
            weight: 62.5,
            reps: 4.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 102.5,
            reps: 7.5
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-03",
    type: "leg",
    exercises: [
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 107.5,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 80,
            reps: 6
          },
          {
            weight: 80,
            reps: 5
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 225,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 155,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-04",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 30,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 102.5,
            reps: 7.5
          },
          {
            weight: 102.5,
            reps: 5.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 35,
            reps: 5.5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 100,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-05",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 105,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 125,
            reps: 7
          },
          {
            weight: 125,
            reps: 6.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 62.5,
            reps: 7.5
          },
          {
            weight: 62.5,
            reps: 4.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 102.5,
            reps: 8,
            notes: "0rir"
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-06",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 197.5,
            reps: 8
          },
          {
            weight: 197.5,
            reps: 7
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 105,
            reps: 8
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 77.5,
            reps: 7
          },
          {
            weight: 77.5,
            reps: 5
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 215,
            reps: 8
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 147.5,
            reps: 8,
            notes: "0rir"
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-08",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 87.5,
            reps: 7
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 105,
            reps: 5
          },
          {
            weight: 102.5,
            reps: 4
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 5
          },
          {
            weight: 35,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 100,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-09",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 105,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 125,
            reps: 8,
            notes: "0rir"
          },
          {
            weight: 125,
            reps: 6.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 62.5,
            reps: 7.5
          },
          {
            weight: 62.5,
            reps: 4.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 105,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-10",
    type: "leg",
    exercises: [
      {
        name: "Hex Squat",
        sets: [
          {
            weight: 200,
            reps: 7
          },
          {
            weight: 200,
            reps: 6
          }
        ]
      },
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 105,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 77.5,
            reps: 8
          },
          {
            weight: 77.5,
            reps: 6
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 220,
            reps: 7.5
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 150,
            reps: 8,
            notes: "0rir"
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-13",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 38,
            reps: 6
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 105,
            reps: 6.5
          },
          {
            weight: 105,
            reps: 4
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 4.5
          },
          {
            weight: 35,
            reps: 6.5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 100,
            reps: 8,
            notes: "1rir"
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-14",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 105,
            reps: 7
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 127.5,
            reps: 7
          },
          {
            weight: 127.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 62.5,
            reps: 7
          },
          {
            weight: 62.5,
            reps: 5.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 105,
            reps: 7.5
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-18",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 87.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 105,
            reps: 6.5
          },
          {
            weight: 105,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 6.5
          },
          {
            weight: 37.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 40,
            reps: 5.5
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-19",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 105,
            reps: 7.25
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 127.5,
            reps: 7.5
          },
          {
            weight: 127.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 62.5,
            reps: 6.5
          },
          {
            weight: 62.5,
            reps: 4.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 105,
            reps: 7.5
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-22",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 105,
            reps: 6.5
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 32.5,
            reps: 8
          },
          {
            weight: 32.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 5
          },
          {
            weight: 35,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 102.5,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-23",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 105,
            reps: 7.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 130,
            reps: 6.5
          },
          {
            weight: 130,
            reps: 5.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 62.5,
            reps: 7.5
          },
          {
            weight: 62.5,
            reps: 5.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 107.5,
            reps: 5.5
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-26",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 90,
            reps: 5
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 105,
            reps: 6.5
          },
          {
            weight: 105,
            reps: 4.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 32.5,
            reps: 3.5
          },
          {
            weight: 37.5,
            reps: 5.5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 102.5,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-27",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 105,
            reps: 7.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 130,
            reps: 6.5
          },
          {
            weight: 130,
            reps: 6
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 45,
            reps: 8
          },
          {
            weight: 50,
            reps: 8,
            notes: "2-3rir"
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 65,
            reps: 5
          },
          {
            weight: 65,
            reps: 3.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 107.5,
            reps: 5
          }
        ]
      }
    ]
  },
  {
    date: "2026-04-28",
    type: "leg",
    exercises: [
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 107.5,
            reps: 7.5
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 80,
            reps: 5.5
          },
          {
            weight: 80,
            reps: 4
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 225,
            reps: 7
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 152.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-05-01",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 38,
            reps: 5.5
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 105,
            reps: 5
          },
          {
            weight: 105,
            reps: 3.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 5
          },
          {
            weight: 50,
            reps: 7.5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 42.5,
            reps: 5
          }
        ]
      }
    ]
  },
  {
    date: "2026-05-02",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 105,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 130,
            reps: 7
          },
          {
            weight: 130,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 55,
            reps: 8
          },
          {
            weight: 57.5,
            reps: 6
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 65,
            reps: 4.5
          },
          {
            weight: 65,
            reps: 5.5
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 107.5,
            reps: 5.5
          }
        ]
      }
    ]
  },
  {
    date: "2026-05-04",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 38,
            reps: 6
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 105,
            reps: 5.5
          },
          {
            weight: 105,
            reps: 4
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 5
          },
          {
            weight: 52.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 42.5,
            reps: 4
          }
        ]
      }
    ]
  },
  {
    date: "2026-05-05",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 105,
            reps: 6.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 130,
            reps: 7.5
          },
          {
            weight: 130,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 57.5,
            reps: 8
          },
          {
            weight: 57.5,
            reps: 8,
            notes: "1-2rir"
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 62.5,
            reps: 6.5,
            notes: "-7"
          },
          {
            weight: 62.5,
            reps: 3
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 107.5,
            reps: 6.5
          }
        ]
      }
    ]
  },
  {
    date: "2026-05-06",
    type: "leg",
    exercises: [
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 110,
            reps: 7.5
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 80,
            reps: 7
          },
          {
            weight: 80,
            reps: 5
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 225,
            reps: 8
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 157.5,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-05-08",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 38,
            reps: 5.5
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 105,
            reps: 5.5
          },
          {
            weight: 105,
            reps: 3.75
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 6
          },
          {
            weight: 52.5,
            reps: 8
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 40,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2026-05-09",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 105,
            reps: 7.5
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 132.5,
            reps: 6.5
          },
          {
            weight: 132.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 60,
            reps: 7.5
          },
          {
            weight: 60,
            reps: 5.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 65,
            reps: 5.5
          },
          {
            weight: 65,
            reps: 4
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 107.5,
            reps: 5
          }
        ]
      }
    ]
  },
  {
    date: "2026-05-10",
    type: "leg",
    exercises: [
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 110,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 80,
            reps: 8
          },
          {
            weight: 80,
            reps: 7
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 227.5,
            reps: 8
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 160,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    date: "2026-05-11",
    type: "push",
    exercises: [
      {
        name: "Incline Chest Press",
        sets: [
          {
            weight: 38,
            reps: 6
          }
        ]
      },
      {
        name: "Chest Fly",
        sets: [
          {
            weight: 105,
            reps: 5.5
          },
          {
            weight: 105,
            reps: 3.5
          }
        ]
      },
      {
        name: "Lat Raises",
        sets: [
          {
            weight: 30,
            reps: 6
          },
          {
            weight: 55,
            reps: 6.5
          }
        ]
      },
      {
        name: "Tri Pushdown",
        sets: [
          {
            weight: 40,
            reps: 7
          }
        ]
      }
    ]
  },
  {
    date: "2026-05-12",
    type: "pull",
    exercises: [
      {
        name: "Pullups",
        sets: [
          {
            weight: 107.5,
            reps: 6
          }
        ]
      },
      {
        name: "Rows Wide Grip",
        sets: [
          {
            weight: 132.5,
            reps: 7
          },
          {
            weight: 132.5,
            reps: 6.5
          }
        ]
      },
      {
        name: "Lat Pulldown",
        sets: [
          {
            weight: 62.5,
            reps: 6.5
          },
          {
            weight: 62.5,
            reps: 5.5
          }
        ]
      },
      {
        name: "Bi Curls",
        sets: [
          {
            weight: 65,
            reps: 6.5
          },
          {
            weight: 65,
            reps: 4
          }
        ]
      },
      {
        name: "Facepulls",
        sets: [
          {
            weight: 107.5,
            reps: 6.5
          }
        ]
      }
    ]
  },
  {
    date: "2026-05-13",
    type: "leg",
    exercises: [
      {
        name: "Leg Curls",
        sets: [
          {
            weight: 110,
            reps: 8,
            notes: "0rir"
          }
        ]
      },
      {
        name: "Leg Extensions",
        sets: [
          {
            weight: 82.5,
            reps: 6
          },
          {
            weight: 82.5,
            reps: 5
          }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          {
            weight: 230,
            reps: 7
          }
        ]
      },
      {
        name: "Abs",
        sets: [
          {
            weight: 162.5,
            reps: 12,
            notes: "????"
          }
        ]
      }
    ]
  }
];

export const EXERCISES_BY_TYPE: Record<string, string[]> = {
  "pull": [
    "Pullups",
    "Rows Wide Grip",
    "Lat Pulldown",
    "Bi Curls",
    "Facepulls",
    "Back Ext"
  ],
  "push": [
    "Incline Chest Press",
    "Chest Fly",
    "Lat Raises",
    "Tri Pushdown",
    "Bench Press"
  ],
  "leg": [
    "Hex Squat",
    "Leg Curls",
    "Leg Extensions",
    "Calf Raises",
    "Abs"
  ]
};
