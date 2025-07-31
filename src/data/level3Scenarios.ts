
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

// Module 1 - Level 3 Scenarios
export const level3ScenariosModule1: Scenario[] = [
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

// Module 2 - Level 3 Scenarios
export const level3ScenariosModule2: Scenario[] = [
  {
    title: "Backdated Entry by Technician",
    description: "A technician backdates an entry to make it look like it was recorded earlier.",
    pieces: [
      { id: "m2s1v1", text: "Contemporaneous", category: "violation", isCorrect: true },
      { id: "m2s1v2", text: "Accurate", category: "violation", isCorrect: false },
      { id: "m2s1v3", text: "Original", category: "violation", isCorrect: false },
      { id: "m2s1a1", text: "Record data at the time of activity", category: "action", isCorrect: true },
      { id: "m2s1a2", text: "Add duplicate entry", category: "action", isCorrect: false },
      { id: "m2s1a3", text: "Remove old record", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Logbook Entry Scratched Out",
    description: "A logbook has two entries, one of which is completely scratched out with no initials.",
    pieces: [
      { id: "m2s2v1", text: "Improper Error Correction", category: "violation", isCorrect: true },
      { id: "m2s2v2", text: "Missing Signature", category: "violation", isCorrect: false },
      { id: "m2s2v3", text: "Data Retention Violation", category: "violation", isCorrect: false },
      { id: "m2s2a1", text: "Use single-line strike-through with initials & date", category: "action", isCorrect: true },
      { id: "m2s2a2", text: "Use white ink", category: "action", isCorrect: false },
      { id: "m2s2a3", text: "Delete the entry", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Colleague's Password Used for Login",
    description: "A user logs into the software using their colleague's password to enter values.",
    pieces: [
      { id: "m2s3v1", text: "Attributable", category: "violation", isCorrect: true },
      { id: "m2s3v2", text: "Legible", category: "violation", isCorrect: false },
      { id: "m2s3v3", text: "Timely", category: "violation", isCorrect: false },
      { id: "m2s3a1", text: "Ensure unique login for each user", category: "action", isCorrect: true },
      { id: "m2s3a2", text: "Disable password requirements", category: "action", isCorrect: false },
      { id: "m2s3a3", text: "Re-enter data manually", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Batch Number Missing in Cleaning Records",
    description: "Cleaning records are signed, but the batch number of the cleaning agent is missing.",
    pieces: [
      { id: "m2s4v1", text: "Incomplete Record", category: "violation", isCorrect: true },
      { id: "m2s4v2", text: "Unauthorized Access", category: "violation", isCorrect: false },
      { id: "m2s4v3", text: "Deviation Not Filed", category: "violation", isCorrect: false },
      { id: "m2s4a1", text: "Add note referencing batch number, assess if re-cleaning needed", category: "action", isCorrect: true },
      { id: "m2s4a2", text: "Ignore missing info", category: "action", isCorrect: false },
      { id: "m2s4a3", text: "Shred the form", category: "action", isCorrect: false },
    ],
  },
  {
    title: "System Audit Trail for pH Data",
    description: "A system automatically logs pH data changes with user and timestamp.",
    pieces: [
      { id: "m2s5v1", text: "Audit Trail", category: "violation", isCorrect: true },
      { id: "m2s5v2", text: "Manual Log", category: "violation", isCorrect: false },
      { id: "m2s5v3", text: "Real-time Editing", category: "violation", isCorrect: false },
      { id: "m2s5a1", text: "Data Integrity", category: "action", isCorrect: true },
      { id: "m2s5a2", text: "Training SOP", category: "action", isCorrect: false },
      { id: "m2s5a3", text: "Equipment Qualification", category: "action", isCorrect: false },
    ],
  },
];



// Module 3 - Level 3 Scenarios
export const level3ScenariosModule3: Scenario[] = [
  {
    title: "Missing Audit Trails in Data Edits",
    description: "A data file is edited without any audit trail or user ID trace.",
    pieces: [
      { id: "m3s3v1", text: "Attributable", category: "violation", isCorrect: true },
      { id: "m3s3v2", text: "Consistent", category: "violation", isCorrect: false },
      { id: "m3s3v3", text: "Complete", category: "violation", isCorrect: false },
      { id: "m3s3a1", text: "Enable electronic audit trail with user tracking", category: "action", isCorrect: true },
      { id: "m3s3a2", text: "Allow edits without trace if reviewed later", category: "action", isCorrect: false },
      { id: "m3s3a3", text: "Keep manual log of changes only", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Delay in Real-Time Documentation",
    description: "A QA officer asks for real-time data, but the production team submits a report completed at end of shift.",
    pieces: [
      { id: "m3s4v1", text: "Timely documentation", category: "violation", isCorrect: true },
      { id: "m3s4v2", text: "Consistent", category: "violation", isCorrect: false },
      { id: "m3s4v3", text: "Original", category: "violation", isCorrect: false },
      { id: "m3s4a1", text: "Document information contemporaneously during the activity", category: "action", isCorrect: true },
      { id: "m3s4a2", text: "Submit end-of-shift notes as official records", category: "action", isCorrect: false },
      { id: "m3s4a3", text: "Provide verbal confirmation only", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Unacceptable Correction Practices in Records",
    description: "A production record has white ink used to correct a wrong batch number.",
    pieces: [
      { id: "m3s7v1", text: "Original", category: "violation", isCorrect: true },
      { id: "m3s7v2", text: "Contemporaneous", category: "violation", isCorrect: false },
      { id: "m3s7v3", text: "Accurate", category: "violation", isCorrect: false },
      { id: "m3s7a1", text: "Use a single strike-through, then rewrite with initials/date", category: "action", isCorrect: true },
      { id: "m3s7a2", text: "Apply correction fluid", category: "action", isCorrect: false },
      { id: "m3s7a3", text: "Cover error with new label", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Documentation by an Unauthorized Person",
    description: "An analyst completes documentation for an activity they didn’t perform.",
    pieces: [
      { id: "m3s8v1", text: "Attributable", category: "violation", isCorrect: true },
      { id: "m3s8v2", text: "Complete", category: "violation", isCorrect: false },
      { id: "m3s8v3", text: "Accurate", category: "violation", isCorrect: false },
      { id: "m3s8a1", text: "Treat as data falsification and initiate deviation/CAPA", category: "action", isCorrect: true },
      { id: "m3s8a2", text: "Allow analyst to verify later", category: "action", isCorrect: false },
      { id: "m3s8a3", text: "Sign it off by supervisor", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Document Without Control or Traceability",
    description: "A document is missing page numbers and a revision history.",
    pieces: [
      { id: "m3s10v1", text: "Document Version Control", category: "violation", isCorrect: true },
      { id: "m3s10v2", text: "Data Entry Log", category: "violation", isCorrect: false },
      { id: "m3s10v3", text: "QA Signoff", category: "violation", isCorrect: false },
      { id: "m3s10a1", text: "Apply unique page numbers and maintain revision history", category: "action", isCorrect: true },
      { id: "m3s10a2", text: "Use sticky notes to mark changes", category: "action", isCorrect: false },
      { id: "m3s10a3", text: "Only date the document footer", category: "action", isCorrect: false },
    ],
  },
];

// Module 4 - Level 3 Scenarios
export const level3ScenariosModule4: Scenario[] = [
  {
    title: "Unexplained Temperature Spikes Demand Investigation",
    description: "Environmental data shows unexplained fluctuations in temperature for 3 hours.",
    pieces: [
      { id: "m4s1v1", text: "Data Integrity", category: "violation", isCorrect: true },
      { id: "m4s1v2", text: "Environmental Control", category: "violation", isCorrect: true },
      { id: "m4s1v3", text: "Calibration Error", category: "violation", isCorrect: false },
      { id: "m4s1a1", text: "Initiate deviation report and investigate cause", category: "action", isCorrect: true },
      { id: "m4s1a2", text: "Perform impact analysis on affected batches", category: "action", isCorrect: true },
      { id: "m4s1a3", text: "Review HVAC monitoring systems for faults", category: "action", isCorrect: true },
      { id: "m4s1a4", text: "Discard all batches without investigation", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Operator Relies on Obsolete Procedures",
    description: "An operator is found using outdated SOPs during a process.",
    pieces: [
      { id: "m4s2v1", text: "SOP Non-Compliance", category: "violation", isCorrect: true },
      { id: "m4s2v2", text: "Equipment Malfunction", category: "violation", isCorrect: false },
      { id: "m4s2v3", text: "Documentation Lapse", category: "violation", isCorrect: true },
      { id: "m4s2a1", text: "Withdraw all outdated SOPs immediately", category: "action", isCorrect: true },
      { id: "m4s2a2", text: "Retrain all relevant staff", category: "action", isCorrect: true },
      { id: "m4s2a3", text: "Revise and reissue SOP with version control", category: "action", isCorrect: true },
      { id: "m4s2a4", text: "Sign off the existing SOP post-facto", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Breakdown in SOP Distribution and Document Control",
    description: "A QA officer notes inconsistent version numbers across SOP copies in departments.",
    pieces: [
      { id: "m4s3v1", text: "Document Control", category: "violation", isCorrect: true },
      { id: "m4s3v2", text: "SOP Distribution Process", category: "violation", isCorrect: true },
      { id: "m4s3v3", text: "Risk Assessment Gap", category: "violation", isCorrect: false },
      { id: "m4s3a1", text: "Ensure only controlled copies are circulated", category: "action", isCorrect: true },
      { id: "m4s3a2", text: "Revalidate all departmental SOP copies", category: "action", isCorrect: true },
      { id: "m4s3a3", text: "Implement version tracking on all documents", category: "action", isCorrect: true },
      { id: "m4s3a4", text: "Ask departments to label documents manually", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Deviation Left Hanging with No Action Taken",
    description: "During an audit, it’s discovered that a deviation raised last month is still open with no investigation or closure.",
    pieces: [
      { id: "m4s4v1", text: "Deviation Handling Failure", category: "violation", isCorrect: true },
      { id: "m4s4v2", text: "CAPA Delay", category: "violation", isCorrect: true },
      { id: "m4s4v3", text: "Change Control", category: "violation", isCorrect: false },
      { id: "m4s4a1", text: "Escalate to QA Manager for review", category: "action", isCorrect: true },
      { id: "m4s4a2", text: "Initiate root cause analysis immediately", category: "action", isCorrect: true },
      { id: "m4s4a3", text: "Update deviation logs and set closure timeline", category: "action", isCorrect: true },
      { id: "m4s4a4", text: "Ignore as long as the product met specs", category: "action", isCorrect: false },
    ],
  },
];

// Default export for backward compatibility (Module 1 scenarios)
export const level3Scenarios = level3ScenariosModule1;
export default level3Scenarios;

/**
 * Utility to get Level 3 scenarios by module number.
 * @param moduleNumber 1, 2, 3, or 4
 */
export function getLevel3ScenariosByModule(moduleNumber: number): Scenario[] {
  if (moduleNumber === 4) return level3ScenariosModule4;
  if (moduleNumber === 3) return level3ScenariosModule3;
  if (moduleNumber === 2) return level3ScenariosModule2;
  return level3ScenariosModule1;
}

// Usage example for Module 2 - Level 3 Scenarios:
// import { getLevel3ScenariosByModule } from 'src/data/level3Scenarios';
// const scenarios = getLevel3ScenariosByModule(2);
