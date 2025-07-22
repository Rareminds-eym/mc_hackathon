import { Case } from '../types';

export const casesByModule: Record<number, Case[]> = {
  1: [
    {
      id: 1,
      title: "Cleaning Record Missing",
      scenario: "QA discovers that cleaning records for a mixer used in 3 batches were not filled. All batches passed QC visually.",
      productName: "Paracetamol Syrup",
      batchNumber: "BATCH-001",
      imageSrc: "/Level4/product1.webp",
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
      imageSrc: "/Level4/product2.webp",
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
    }
  ],
  4: [
    {
      id: 1,
      title: "Deviation in Batch Yield",
      scenario: "Final yield of a batch was significantly lower than expected, with no clear documentation of losses.",
      productName: "Iron Syrup",
      batchNumber: "BATCH-301",
      imageSrc: "/Level4/product1.webp",
      deviationType: "Yield Deviation",
      questions: {
        violation: {
          question: "Which GMP principle is violated?",
          options: [
            "Documentation",
            "Quality Control",
            "Equipment Calibration",
            "Personnel Hygiene"
          ],
          correct: 0
        },
        rootCause: {
          question: "Most likely root cause?",
          options: [
            "Losses not recorded",
            "Equipment malfunction",
            "Operator error",
            "Improper SOP"
          ],
          correct: 0
        },
        impact: {
          question: "Potential risk?",
          options: [
            "Regulatory investigation",
            "Supply chain delay",
            "No impact",
            "Labeling error"
          ],
          correct: 0
        }
      }
    },
    {
      id: 2,
      title: "Improper Personnel Hygiene",
      scenario: "Operator entered production area without proper gowning, risking contamination of the batch.",
      productName: "Calcium Syrup",
      batchNumber: "BATCH-302",
      imageSrc: "/Level4/product2.webp",
      deviationType: "Personnel Hygiene",
      questions: {
        violation: {
          question: "What GMP aspect failed?",
          options: [
            "Personnel Hygiene",
            "Equipment Calibration",
            "Training",
            "Documentation"
          ],
          correct: 0
        },
        rootCause: {
          question: "Likely root cause?",
          options: [
            "Operator negligence",
            "Improper SOP",
            "Missed training",
            "Delayed batch release"
          ],
          correct: 0
        },
        impact: {
          question: "Immediate impact?",
          options: [
            "Product contamination",
            "Wrong primary packaging",
            "No impact",
            "Missing artwork"
          ],
          correct: 0
        }
      }
    }
  ]
};