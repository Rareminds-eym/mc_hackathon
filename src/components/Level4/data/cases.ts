import { Case } from '../types';

export const cases: Case[] = [
  {
    id: 1,
    title: "Cleaning Record Missing",
    scenario: "QA discovers that cleaning records for a mixer used in 3 batches were not filled. All batches passed QC visually.",
    productName: "Paracetamol Syrup",
    batchNumber: "BATCH-001",
    imageSrc: "/Level4/product1.webp", // Example image, update as needed
    deviationType: "Documentation",
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
    productName: "Cough Syrup",
    batchNumber: "BATCH-002",
    imageSrc: "/Level4/product2.webp", // Example image, update as needed
    deviationType: "Equipment Calibration",
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
  
];