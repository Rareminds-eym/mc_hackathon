import { Case } from '../types';

export const casesByModule: Record<number, Case[]> = {
 
 1: [
    {
      id: 1,
      title: "Incorrect Use of 'Gastralgia'",
      scenario: "The patient report mentions 'gastralgia' due to a viral infection.",
      productName: "Gastro-Relief Tablets",
      batchNumber: "GRT-2024-1157",
      imageSrc: "",
      deviationType: "Terminology Misuse",
      questions: {
        violation: {
          question: "Is 'gastralgia' correct in this context?",
          options: [
            "Yes, it implies stomach inflammation",
            "No, gastritis is more accurate",
            "It depends on patient history",
            "It is used in bacterial infections only"
          ],
          correct: 1
        },
        rootCause: {
          question: "What is the analysis?",
          options: [
            "Terminology not aligned with cause",
            "Incorrect dosage coding",
            "Unverified test results",
            "Lab report delay"
          ],
          correct: 0
        },
        impact: {
          question: "What could be the result?",
          options: [
            "Miscommunication in diagnosis",
            "Insurance claim rejection",
            "Incorrect drug administration",
            "All of the above"
          ],
          correct: 3
        }
      }
    },
    {
      id: 2,
      title: "Misuse of 'Osteorrhea'",
      scenario: "Diagnosis is listed as 'osteorrhea' for a patient with bone fracture and discharge.",
      productName: "BoneHeal Antibiotic Cream",
      batchNumber: "BHA-2024-0892",
      imageSrc: "",
      deviationType: "Incorrect Diagnosis Term",
      questions: {
        violation: {
          question: "Is 'osteorrhea' the right term?",
          options: [
            "Yes, it is used for bone discharge",
            "No, osteomyelitis is correct",
            "Only valid in rare trauma",
            "Depends on the imaging report"
          ],
          correct: 1
        },
        rootCause: {
          question: "Why was this error made?",
          options: [
            "Non-existent term used",
            "Typographical error",
            "Imaging misread",
            "Wrong ICD code"
          ],
          correct: 0
        },
        impact: {
          question: "Likely consequence?",
          options: [
            "Confusion in treatment planning",
            "Lab retesting",
            "Incorrect specialist referral",
            "None"
          ],
          correct: 0
        }
      }
    },
    {
      id: 3,
      title: "Surgical Code Misuse",
      scenario: "A medical coder assigns 'nephrectomy' for a diagnostic imaging procedure of the kidneys.",
      productName: "RadioContrast Solution",
      batchNumber: "RCS-2024-2341",
      imageSrc: "",
      deviationType: "Procedure Code Error",
      questions: {
        violation: {
          question: "Is 'nephrectomy' appropriate?",
          options: [
            "Yes, if biopsy is included",
            "No, it refers to kidney removal",
            "Yes, in case of kidney trauma",
            "Depends on patient symptoms"
          ],
          correct: 1
        },
        rootCause: {
          question: "What caused the error?",
          options: [
            "Misunderstood clinical term",
            "System bug",
            "Double entry",
            "Lab result delay"
          ],
          correct: 0
        },
        impact: {
          question: "What can this lead to?",
          options: [
            "Wrong insurance billing",
            "Unnecessary surgical planning",
            "Delay in actual diagnosis",
            "All of the above"
          ],
          correct: 3
        }
      }
    },
    {
      id: 4,
      title: "Incorrect Head Pain Code",
      scenario: "The clinical note lists 'cephalitis' for head pain post-trauma.",
      productName: "NeuroCalm Pain Relief",
      batchNumber: "NCR-2024-1674",
      imageSrc: "",
      deviationType: "Diagnosis Term Error",
      questions: {
        violation: {
          question: "Does 'cephalitis' fit the symptoms?",
          options: [
            "Yes, if inflammation is observed",
            "No, 'cephalalgia' is better",
            "Yes, both are interchangeable",
            "Only valid in infants"
          ],
          correct: 1
        },
        rootCause: {
          question: "Most likely reason?",
          options: [
            "Confusion between similar terms",
            "Lab data delay",
            "Wrong patient ID",
            "Consultation mismatch"
          ],
          correct: 0
        },
        impact: {
          question: "Expected result?",
          options: [
            "Wrong follow-up test ordered",
            "Incorrect medicine given",
            "Patient confusion",
            "All of the above"
          ],
          correct: 3
        }
      }
    },
    {
      id: 5,
      title: "Correct Use of 'Dermatitis'",
      scenario: "A student codes 'dermatitis' for 'red skin patches due to allergy'.",
      productName: "DermaSoothe Cream",
      batchNumber: "DSC-2024-0567",
      imageSrc: "",
      deviationType: "Correct Terminology Use",
      questions: {
        violation: {
          question: "Is 'dermatitis' suitable here?",
          options: [
            "Yes, it matches allergic skin response",
            "No, eczema is more apt",
            "No, it's drug-induced",
            "Only use for bacterial cases"
          ],
          correct: 0
        },
        rootCause: {
          question: "Coding logic?",
          options: [
            "Accurate terminology understanding",
            "System suggestion",
            "Template autofill",
            "Peer recommendation"
          ],
          correct: 0
        },
        impact: {
          question: "Outcome of correct coding?",
          options: [
            "Proper treatment ensured",
            "Billing efficiency",
            "Accurate clinical communication",
            "All of the above"
          ],
          correct: 3
        }
      }
    }
  ],
  2: [
    {
      id: 1,
      title: "Overcoding for Short Visit",
      scenario: "Claim for 99215 submitted, but visit lasted only 10 minutes.",
      productName: "QuickCare Consultation Kit",
      batchNumber: "QCK-2024-3421",
      imageSrc: "",
      deviationType: "Overcoding",
      questions: {
        violation: {
          question: "What coding issue is present?",
          options: [
            "Undercoding",
            "Upcoding",
            "Overcoding",
            "Unbundling"
          ],
          correct: 2
        },
        rootCause: {
          question: "Likely reason for denial?",
          options: [
            "Time documentation mismatch",
            "Missing consent form",
            "Incorrect diagnosis",
            "Unlinked CPT"
          ],
          correct: 0
        },
        impact: {
          question: "Suggested correction?",
          options: [
            "Change to 99212",
            "Add diagnosis",
            "Submit new claim",
            "None needed"
          ],
          correct: 0
        }
      }
    },
    {
      id: 2,
      title: "Unsupported CPT Submission",
      scenario: "CPT code submitted but no supporting documentation.",
      productName: "",
      batchNumber: "",
      imageSrc: "",
      deviationType: "Documentation Deficiency",
      questions: {
        violation: {
          question: "What's the error in submission?",
          options: [
            "Duplicate billing",
            "Documentation deficiency",
            "Wrong modifier",
            "Invalid diagnosis"
          ],
          correct: 1
        },
        rootCause: {
          question: "Why was the claim denied?",
          options: [
            "No clinical notes provided",
            "Expired policy",
            "Incorrect payer info",
            "Unlicensed provider"
          ],
          correct: 0
        },
        impact: {
          question: "Suggested action?",
          options: [
            "Attach proper documentation",
            "Use modifier -59",
            "Add ICD-10 code",
            "Use appeal code"
          ],
          correct: 0
        }
      }
    },
    {
      id: 3,
      title: "Modifier -25 Misuse",
      scenario: "Modifier -25 used for all E/M visits, including single-service visits.",
      productName: "",
      batchNumber: "",
      imageSrc: "",
      deviationType: "Modifier Misuse",
      questions: {
        violation: {
          question: "What's wrong with this coding?",
          options: [
            "Unbundling",
            "Global period error",
            "Modifier misuse",
            "Incorrect CPT pairing"
          ],
          correct: 2
        },
        rootCause: {
          question: "What caused the misuse?",
          options: [
            "Lack of understanding of modifier purpose",
            "Duplicate submission",
            "Unapproved service",
            "Missed claim deadline"
          ],
          correct: 0
        },
        impact: {
          question: "What's the result?",
          options: [
            "Claim denial",
            "Partial reimbursement",
            "Audit trigger",
            "All of the above"
          ],
          correct: 3
        }
      }
    },
    {
      id: 4,
      title: "Flu Shot Billed as Office Visit",
      scenario: "Flu shot billed as 99213 with I10 as diagnosis.",
      productName: "",
      batchNumber: "",
      imageSrc: "",
      deviationType: "Service-Diagnosis Mismatch",
      questions: {
        violation: {
          question: "What's the primary error?",
          options: [
            "Upcoding",
            "Service and diagnosis mismatch",
            "Missing NPI",
            "Wrong payer type"
          ],
          correct: 1
        },
        rootCause: {
          question: "What caused the denial?",
          options: [
            "Incorrect CPT for vaccine",
            "No documentation",
            "Expired diagnosis code",
            "Provider mismatch"
          ],
          correct: 0
        },
        impact: {
          question: "How should it be coded?",
          options: [
            "G0008 and vaccine CPT with Z-code",
            "Use 99214 instead",
            "Replace I10 with J10",
            "Only bill for admin"
          ],
          correct: 0
        }
      }
    },
    {
      id: 5,
      title: "Ambulance Code Without Justification",
      scenario: "Ambulance code A0429 used without medical necessity statement.",
      productName: "",
      batchNumber: "",
      imageSrc: "",
      deviationType: "Missing Documentation",
      questions: {
        violation: {
          question: "What's the compliance issue?",
          options: [
            "No medical necessity documentation",
            "Code doesn't match service",
            "Improper place of service",
            "Modifier missing"
          ],
          correct: 0
        },
        rootCause: {
          question: "Why will this be denied?",
          options: [
            "Missing justification of service",
            "Delayed billing",
            "Incorrect POS code",
            "Duplicate CPT"
          ],
          correct: 0
        },
        impact: {
          question: "Suggested fix?",
          options: [
            "Submit supporting documents",
            "Use A0426",
            "Add modifier -Q6",
            "No correction possible"
          ],
          correct: 0
        }
      }
    }
  ]
,

  3: [
    {
      id: 17,
      title: "Incorrect Use of M16.11 for Bilateral Hip OA",
      scenario: "Code M16.11 is used for bilateral osteoarthritis of the hip.",
      productName: "",
      batchNumber: "",
      imageSrc: "",
      deviationType: "Incorrect Code Usage",
      questions: {
        violation: {
          question: "What is the issue with using M16.11 in this context?",
          options: [
            "M16.11 is correct for bilateral hip OA",
            "M16.11 refers to unilateral right hip OA",
            "M16.11 is for knee osteoarthritis",
            "M16.11 requires additional modifier"
          ],
          correct: 1
        },
        rootCause: {
          question: "What caused this coding error?",
          options: [
            "Misunderstanding of laterality codes",
            "System auto-population error",
            "Missing clinical documentation",
            "Incorrect ICD-10 reference"
          ],
          correct: 0
        },
        impact: {
          question: "What is the potential impact?",
          options: [
            "Incorrect treatment planning",
            "Insurance claim denial",
            "Inaccurate medical records",
            "All of the above"
          ],
          correct: 3
        }
      }
    },
    {
      id: 18,
      title: "Separate Coding of Hypertension and Heart Failure",
      scenario: "Hypertension and heart failure coded separately using I10 and I50.9.",
      productName: "",
      batchNumber: "",
      imageSrc: "",
      deviationType: "Combination Code Omission",
      questions: {
        violation: {
          question: "Why is using I10 and I50.9 separately incorrect?",
          options: [
            "Both codes are outdated",
            "Combination code I11.0 should be used",
            "Only I10 should be used",
            "Additional modifier is needed"
          ],
          correct: 1
        },
        rootCause: {
          question: "What led to this coding mistake?",
          options: [
            "Lack of knowledge about combination codes",
            "Missing physician documentation",
            "System coding limitations",
            "Time pressure during coding"
          ],
          correct: 0
        },
        impact: {
          question: "What could result from this error?",
          options: [
            "Underpayment from insurance",
            "Audit flags for unbundling",
            "Inaccurate disease tracking",
            "All of the above"
          ],
          correct: 3
        }
      }
    },
    {
      id: 19,
      title: "Z79.4 Used Without Diabetes",
      scenario: "Patient coded with Z79.4 (long-term insulin use) but is not diabetic.",
      productName: "",
      batchNumber: "",
      imageSrc: "",
      deviationType: "Code Misuse",
      questions: {
        violation: {
          question: "Why is Z79.4 inappropriate in this case?",
          options: [
            "Z79.4 is only for Type 1 diabetes",
            "Z79.4 requires diabetes diagnosis",
            "Z79.4 is for short-term insulin use",
            "Z79.4 needs additional documentation"
          ],
          correct: 1
        },
        rootCause: {
          question: "What caused this inappropriate code use?",
          options: [
            "Misunderstanding of Z-code purpose",
            "Incomplete medical history review",
            "Automatic coding suggestion error",
            "Confusion with other insulin codes"
          ],
          correct: 0
        },
        impact: {
          question: "What problems could this create?",
          options: [
            "Incorrect medication management",
            "Insurance coverage issues",
            "Misleading medical history",
            "All of the above"
          ],
          correct: 3
        }
      }
    },
    {
      id: 20,
      title: "Placeholder Missing in S06.5X0A",
      scenario: "S06.5X0A was assigned without a placeholder.",
      productName: "",
      batchNumber: "",
      imageSrc: "",
      deviationType: "Structural Coding Error",
      questions: {
        violation: {
          question: "What is the error with the code S06.5X0A?",
          options: [
            "Wrong injury classification",
            "Missing required placeholder 'X'",
            "Incorrect encounter type",
            "Wrong anatomical location"
          ],
          correct: 1
        },
        rootCause: {
          question: "Why was the placeholder omitted?",
          options: [
            "Lack of understanding of ICD-10 structure",
            "System validation failure",
            "Manual entry error",
            "Outdated coding reference"
          ],
          correct: 0
        },
        impact: {
          question: "What could happen as a result?",
          options: [
            "Claim rejection by payer",
            "Coding audit findings",
            "Data quality issues",
            "All of the above"
          ],
          correct: 3
        }
      }
    },
    {
      id: 21,
      title: "G20 Used as Principal Diagnosis for Rehab",
      scenario: "G20 (Parkinson’s disease) coded as principal diagnosis in a rehab admission.",
      productName: "",
      batchNumber: "",
      imageSrc: "",
      deviationType: "Incorrect Principal Diagnosis",
      questions: {
        violation: {
          question: "Why is G20 incorrect as a principal rehab diagnosis?",
          options: [
            "G20 is not a valid ICD-10 code",
            "Principal diagnosis should reflect rehab focus",
            "G20 requires additional specificity",
            "Parkinson's cannot be principal diagnosis"
          ],
          correct: 1
        },
        rootCause: {
          question: "What caused this principal diagnosis error?",
          options: [
            "Misunderstanding of rehab coding guidelines",
            "Incomplete documentation review",
            "System default selection",
            "Confusion with acute care coding"
          ],
          correct: 0
        },
        impact: {
          question: "What are the consequences?",
          options: [
            "Incorrect reimbursement calculation",
            "Quality measure reporting errors",
            "Audit compliance issues",
            "All of the above"
          ],
          correct: 3
        }
      }
    }
  ],

  4: [
    {
      id: 13,
      title: "Overcoding with CPT 99214 for a Short Visit",
      scenario: "A coder used CPT 99214 for a 15-minute follow-up visit with minimal history and exam.",
      productName: "",
      batchNumber: "",
      imageSrc: "",
      deviationType: "Overcoding",
      questions: {
        violation: {
          question: "Why is CPT 99214 not appropriate here?",
          options: [
            "99214 is for new patients only",
            "99214 requires moderate complexity and time",
            "99214 needs prior authorization",
            "99214 is for specialists only"
          ],
          correct: 1
        },
        rootCause: {
          question: "What likely caused this overcoding?",
          options: [
            "Misunderstanding of E/M complexity levels",
            "System auto-selection error",
            "Missing documentation",
            "Incorrect time calculation"
          ],
          correct: 0
        },
        impact: {
          question: "What could result from this error?",
          options: [
            "Claim denial or downcoding",
            "Audit flags for overcoding",
            "Revenue loss from corrections",
            "All of the above"
          ],
          correct: 3
        }
      }
    },
    {
      id: 14,
      title: "Duplicate Billing of CPT 11721",
      scenario: "CPT 11721 was billed twice for 10 nails treated on both feet.",
      productName: "",
      batchNumber: "",
      imageSrc: "",
      deviationType: "Duplicate Billing",
      questions: {
        violation: {
          question: "What is the issue with billing CPT 11721 twice?",
          options: [
            "11721 requires modifier for bilateral",
            "11721 is billed once per session",
            "11721 needs separate diagnosis codes",
            "11721 is only for single foot"
          ],
          correct: 1
        },
        rootCause: {
          question: "Why was this billed incorrectly?",
          options: [
            "Misunderstanding of CPT billing rules",
            "System duplication error",
            "Confusion about bilateral procedures",
            "Incomplete procedure documentation"
          ],
          correct: 0
        },
        impact: {
          question: "What will likely happen?",
          options: [
            "Claim will be partially denied",
            "Audit investigation triggered",
            "Overpayment recovery request",
            "All of the above"
          ],
          correct: 3
        }
      }
    },
    {
      id: 15,
      title: "Add-on Code Without Primary Code",
      scenario: "An add-on code was reported without a primary code.",
      productName: "",
      batchNumber: "",
      imageSrc: "",
      deviationType: "Missing Primary Code",
      questions: {
        violation: {
          question: "Why is it incorrect to submit an add-on code alone?",
          options: [
            "Add-on codes need special authorization",
            "Add-on codes must be paired with primary procedure",
            "Add-on codes are only for hospitals",
            "Add-on codes require modifier 59"
          ],
          correct: 1
        },
        rootCause: {
          question: "What caused this coding error?",
          options: [
            "Lack of understanding of add-on code rules",
            "System processing error",
            "Missing primary procedure documentation",
            "Incorrect CPT code selection"
          ],
          correct: 0
        },
        impact: {
          question: "What will be the outcome?",
          options: [
            "Claim will be denied",
            "Payment will be delayed",
            "Audit flag will be raised",
            "All of the above"
          ],
          correct: 3
        }
      }
    },
    {
      id: 16,
      title: "Incorrect Use of Modifier 26 by Facility",
      scenario: "Modifier 26 was used on a global code by a facility billing for the equipment.",
      productName: "",
      batchNumber: "",
      imageSrc: "",
      deviationType: "Incorrect Modifier Usage",
      questions: {
        violation: {
          question: "Why should Modifier 26 not be used by the facility?",
          options: [
            "Modifier 26 is for emergency services only",
            "Modifier 26 is for professional services",
            "Modifier 26 requires prior authorization",
            "Modifier 26 is for outpatient only"
          ],
          correct: 1
        },
        rootCause: {
          question: "What caused this modifier error?",
          options: [
            "Confusion about professional vs technical components",
            "System default modifier selection",
            "Incomplete billing training",
            "Missing documentation review"
          ],
          correct: 0
        },
        impact: {
          question: "What will be the result?",
          options: [
            "Claim will be denied",
            "Incorrect reimbursement amount",
            "Compliance audit issues",
            "All of the above"
          ],
          correct: 3
        }
      }
    },
    {
      id: 17,
      title: "Improper Use of Modifier 51 on Add-on Code",
      scenario: "A coder used Modifier 51 on an add-on code.",
      productName: "",
      batchNumber: "",
      imageSrc: "",
      deviationType: "Modifier Misuse",
      questions: {
        violation: {
          question: "What is wrong with using Modifier 51 here?",
          options: [
            "Modifier 51 is for bilateral procedures only",
            "Add-on codes are exempt from Modifier 51",
            "Modifier 51 requires prior authorization",
            "Add-on codes need Modifier 59 instead"
          ],
          correct: 1
        },
        rootCause: {
          question: "Why was this modifier applied incorrectly?",
          options: [
            "Lack of knowledge about add-on code rules",
            "System auto-application of modifier",
            "Confusion with multiple procedure rules",
            "Incomplete CPT guideline review"
          ],
          correct: 0
        },
        impact: {
          question: "What could happen as a result?",
          options: [
            "Claim processing delay",
            "Incorrect payment calculation",
            "Compliance audit findings",
            "All of the above"
          ],
          correct: 3
        }
      }
    }
  ]


};