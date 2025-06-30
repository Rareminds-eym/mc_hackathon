import { Case } from '../types';

export const cases: Case[] = [
  {
    id: 1,
    title: "Cleaning Record Missing",
    scenario: "QA discovers that cleaning records for a mixer used in 3 batches were not filled. All batches passed QC visually.",
    questions: {
      violation: {
        question: "What GMP principle is violated?",
        options: [
          "Calibration",
          "Documentation",
          "Quality Control",
          "Personnel Hygiene"
        ],
        correct: 1
      },
      rootCause: {
        question: "What is the most likely root cause?",
        options: [
          "Inadequate training",
          "Negligence in recording",
          "Faulty equipment",
          "Lack of SOP"
        ],
        correct: 1
      },
      impact: {
        question: "What is the potential risk?",
        options: [
          "Product contamination due to unverified cleaning",
          "Delay in supply chain",
          "Labeling error",
          "Regulatory marketing delay"
        ],
        correct: 0
      }
    }
  },
  {
    id: 2,
    title: "Uncalibrated Equipment Used",
    scenario: "A batch was processed using a balance that had expired calibration. QA caught the error post-batch completion.",
    questions: {
      violation: {
        question: "What GMP aspect failed?",
        options: [
          "Equipment Calibration",
          "Vendor Qualification",
          "Training",
          "Documentation"
        ],
        correct: 0
      },
      rootCause: {
        question: "Likely root cause?",
        options: [
          "Missed verification of calibration schedule",
          "Operator fatigue",
          "Machine error",
          "Delayed batch release"
        ],
        correct: 0
      },
      impact: {
        question: "Immediate impact?",
        options: [
          "Potential inaccurate batch weight → risk of under/over potency",
          "Cold chain failure",
          "Wrong primary packaging",
          "Missing artwork"
        ],
        correct: 0
      }
    }
  },
  {
    id: 3,
    title: "Environmental Monitoring Failure",
    scenario: "The environmental monitoring system in a sterile manufacturing cleanroom (ISO Class 5) failed to record viable particle counts for a 4-hour period during an aseptic filling operation. The failure occurred due to a power outage that affected the monitoring equipment, but backup power systems did not activate as designed. Production continued during this period, and 2,500 vials of injectable product were filled. The environmental monitoring data gap was discovered during the daily review of batch records. No visual contamination was observed, and the filled vials appeared normal, but the sterility assurance cannot be verified for this time period.",
    questions: {
      violation: {
        question: "What critical GMP aspect was compromised during this incident?",
        options: [
          "Personnel qualification and training requirements",
          "Environmental monitoring and contamination control",
          "Raw material testing and release procedures",
          "Equipment cleaning and sanitization protocols"
        ],
        correct: 1
      },
      rootCause: {
        question: "What is the most likely systemic cause of this monitoring failure?",
        options: [
          "Inadequate preventive maintenance of backup power systems",
          "Insufficient operator training on emergency procedures",
          "Defective environmental monitoring sensors and equipment",
          "Poor communication between production and quality departments"
        ],
        correct: 0
      },
      impact: {
        question: "What is the most serious potential consequence of this environmental monitoring gap?",
        options: [
          "Compromised sterility assurance and potential patient safety risk",
          "Regulatory inspection findings and warning letters",
          "Increased production costs and manufacturing delays",
          "Loss of customer confidence and market reputation"
        ],
        correct: 0
      }
    }
  }
];