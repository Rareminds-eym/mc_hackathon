// src/data/level3Scenarios.ts

export interface PuzzlePiece {
  id: string;
  text: string;
  category: "violation" | "action";
  isCorrect: boolean;
}

export interface Scenario {
  title: string;
  description: string;
  pieces: PuzzlePiece[];
}

export const level3Scenarios: Scenario[] = [
  {
    title: "Cleanroom Entry Violation",
    description:
      "A production worker enters the cleanroom without gloves and skips the entry logbook.",
    pieces: [
      {
        id: "v1",
        text: "Personnel Hygiene",
        category: "violation",
        isCorrect: true,
      },
      {
        id: "v2",
        text: "Documentation",
        category: "violation",
        isCorrect: true,
      },
      {
        id: "v3",
        text: "Quality Control",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "v4",
        text: "Equipment Qualification",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "a1",
        text: "Follow gowning SOP",
        category: "action",
        isCorrect: true,
      },
      {
        id: "a2",
        text: "Sign and verify entry in log",
        category: "action",
        isCorrect: true,
      },
      {
        id: "a3",
        text: "Use cleanroom air filters",
        category: "action",
        isCorrect: false,
      },
      {
        id: "a4",
        text: "Initiate audit trail",
        category: "action",
        isCorrect: false,
      },
    ],
  },
  {
    title: "Expired Balance Used",
    description:
      "An expired balance is used to weigh materials for a production batch.",
    pieces: [
      {
        id: "s2v1",
        text: "Equipment Calibration",
        category: "violation",
        isCorrect: true,
      },
      { id: "s2v2", text: "Training", category: "violation", isCorrect: false },
      {
        id: "s2v3",
        text: "Cleaning Validation",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "s2v4",
        text: "Material Storage",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "s2a1",
        text: "Stop use, recalibrate",
        category: "action",
        isCorrect: true,
      },
      {
        id: "s2a2",
        text: "Repeat training",
        category: "action",
        isCorrect: false,
      },
      { id: "s2a3", text: "Update MSDS", category: "action", isCorrect: false },
      {
        id: "s2a4",
        text: "Document deviation & assess risk",
        category: "action",
        isCorrect: true,
      },
    ],
  },
  {
    title: "Batch Record Not Reviewed by QA",
    description:
      "A batch record is signed only by Production Head. QA has not reviewed or signed.",
    pieces: [
      {
        id: "s3v1",
        text: "Documentation",
        category: "violation",
        isCorrect: true,
      },
      {
        id: "s3v2",
        text: "Root Cause Analysis",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "s3v3",
        text: "Market Complaint Handling",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "s3a1",
        text: "QA counter-sign required",
        category: "action",
        isCorrect: true,
      },
      {
        id: "s3a2",
        text: "Recall product",
        category: "action",
        isCorrect: false,
      },
      {
        id: "s3a3",
        text: "Skip QA review",
        category: "action",
        isCorrect: false,
      },
    ],
  },
];
