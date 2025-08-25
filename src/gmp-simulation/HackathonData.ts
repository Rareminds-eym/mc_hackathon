export interface Question {
  id: number;
  caseFile: string;
  violationOptions: string[];
  correctViolation: string;
  rootCauseOptions: string[];
  correctRootCause: string;
  solutionOptions: string[];
  correctSolution: string;
}

export const hackathonData: Question[] = [
  {
    "id": 1,
    "caseFile": "An adult came to the ER with cough, fever, and trouble breathing. The chest x‑ray later showed pneumonia, and the discharge summary clearly says 'community‑acquired pneumonia.' The coder looked at the ER note first and chose cough + fever as the main diagnosis. No one checked the discharge summary before billing. The bill now tells the story that the patient had only symptoms, not the real illness. This can confuse payers and change reports about hospital cases.",
    "violationOptions": [
      "Used symptoms as principal instead of the confirmed disease",
      "Used pneumonia as principal (correct)",
      "Added an external cause for cough",
      "Used 'unspecified viral illness' as a placeholder"
    ],
    "correctViolation": "Used symptoms as principal instead of the confirmed disease",
    "rootCauseOptions": [
      "Coder chose the first note (ER) and skipped the discharge summary",
      "Doctor hid the diagnosis on purpose",
      "Pharmacy note had no medicines listed",
      "The software blocked all pneumonia codes"
    ],
    "correctRootCause": "Coder chose the first note (ER) and skipped the discharge summary",
    "solutionOptions": [
      "Add a 'final diagnosis check' before billing; train coder; flag when symptoms are chosen over a final disease",
      "Delete all symptom codes from the system",
      "Only accept ER notes as the principal source",
      "Ask doctors to delete ER notes after admission"
    ],
    "correctSolution": "Add a 'final diagnosis check' before billing; train coder; flag when symptoms are chosen over a final disease"
  },
  {
    "id": 2,
    "caseFile": "A patient had arthroscopy on the left knee. The consent, imaging, and operative note all say left side. The claim went out with 'unspecified knee' because the template did not ask for side, and the coder did not recheck the operation note. The payer cannot tell which leg was treated. That can lead to denials or wrong quality data. The story of care is incomplete without left/right.",
    "violationOptions": [
      "Left/right side (laterality) not captured",
      "Correct left knee code used",
      "Added weeks of pregnancy",
      "Added external place code"
    ],
    "correctViolation": "Left/right side (laterality) not captured",
    "rootCauseOptions": [
      "Template didn't ask for side and coder didn't verify the op report",
      "Surgeon refused to help the coder",
      "Images were low quality",
      "Patient changed knees mid-surgery"
    ],
    "correctRootCause": "Template didn't ask for side and coder didn't verify the op report",
    "solutionOptions": [
      "Make side a required field; link op note side to code picker; block 'unspecified' when side exists",
      "Remove all side info from reports",
      "Use unspecified codes to save time",
      "Bill both knees 'just in case'"
    ],
    "correctSolution": "Make side a required field; link op note side to code picker; block 'unspecified' when side exists"
  },
  {
    "id": 3,
    "caseFile": "A 68‑year‑old has right‑side weakness from a stroke years ago. Today's visit is for help with walking aids. The note says 'history of stroke; residual weakness,' and there are no new stroke symptoms. The coder chose an 'acute stroke' code from the problem list. This makes it look like a new emergency when it is not. The record should show long‑term effects of an old stroke, not a fresh event.",
    "violationOptions": [
      "Coded acute stroke; should have used late effect (sequela)",
      "Correctly coded residual weakness from old stroke",
      "Added contrast CT code",
      "Used external cause"
    ],
    "correctViolation": "Coded acute stroke; should have used late effect (sequela)",
    "rootCauseOptions": [
      "Problem list showed 'stroke' without dates; coder didn't read visit details",
      "Radiology server was down",
      "Nurses wrote in blue ink",
      "Clinic closed on weekends"
    ],
    "correctRootCause": "Problem list showed 'stroke' without dates; coder didn't read visit details",
    "solutionOptions": [
      "Add 'current vs past' prompt; check dates; train on sequela vs active",
      "Always code acute for old issues",
      "Delete the problem list",
      "Let patients pick codes"
    ],
    "correctSolution": "Add 'current vs past' prompt; check dates; train on sequela vs active"
  },
  {
    "id": 4,
    "caseFile": "A pregnant patient comes for a clinic visit at about 32 weeks. The note shows blood pressure, baby's status, and the problem 'mild preeclampsia.' The coder entered the problem code but forgot the simple code that tells how many weeks pregnant the patient is. Without weeks, others cannot judge risk or compare cases. Many payers expect the week code on OB visits. The story of the visit is missing a key detail.",
    "violationOptions": [
      "Weeks of pregnancy (Z3A) missing",
      "Weeks coded correctly",
      "Wrong modifier used",
      "External cause added"
    ],
    "correctViolation": "Weeks of pregnancy (Z3A) missing",
    "rootCauseOptions": [
      "OB template hides the weeks field; coder focused only on the problem code",
      "Ultrasound room was noisy",
      "Lab had no gloves",
      "Patient hid age"
    ],
    "correctRootCause": "OB template hides the weeks field; coder focused only on the problem code",
    "solutionOptions": [
      "Make weeks required; auto-pull from OB chart; block OB claims without weeks",
      "Never code weeks",
      "Use 40 weeks for everyone",
      "Ask payer to guess weeks"
    ],
    "correctSolution": "Make weeks required; auto-pull from OB chart; block OB claims without weeks"
  },
  {
    "id": 5,
    "caseFile": "A student fell off a bicycle on a city street and broke a wrist. The doctor wrote how it happened and where. The coder sent only the fracture code and skipped the 'how/where' parts. Later, the trauma data team could not tell if this was a road crash, a sports fall, or something else. That makes safety tracking and reports less useful. The case record looks unfinished.",
    "violationOptions": [
      "External cause/activity/place codes missing",
      "Cause/place coded correctly",
      "OB weeks added",
      "Vaccine code added"
    ],
    "correctViolation": "External cause/activity/place codes missing",
    "rootCauseOptions": [
      "Coder didn't read triage; shortcut skipped the external cause screen",
      "Patient refused x-ray",
      "Doctor used black pen",
      "No elevators in ED"
    ],
    "correctRootCause": "Coder didn't read triage; shortcut skipped the external cause screen",
    "solutionOptions": [
      "Show an injury prompt for cause/activity/place; red banner if blank",
      "Never use cause codes",
      "Add cause to every visit",
      "Let patients choose the cause"
    ],
    "correctSolution": "Show an injury prompt for cause/activity/place; red banner if blank"
  },
  {
    "id": 6,
    "caseFile": "A 5‑cm forearm cut was cleaned, trimmed, and then closed with simple stitches. The cleaning and trimming were part of getting the wound ready. The coder billed the repair code and also billed a debridement code as if it were a separate extra service. For simple repairs, cleaning is included. The bill now looks like two services when there was one normal repair.",
    "violationOptions": [
      "Billed an extra code for a step included in the main repair",
      "Only the repair code billed",
      "Time codes used correctly",
      "Contrast CT used"
    ],
    "correctViolation": "Billed an extra code for a step included in the main repair",
    "rootCauseOptions": [
      "Didn't know bundling rules; copied prior charges",
      "Doctor hid details",
      "Lights too bright",
      "Faded keyboard"
    ],
    "correctRootCause": "Didn't know bundling rules; copied prior charges",
    "solutionOptions": [
      "Turn on bundling edits; pop-up 'included service'; short refresher",
      "Turn off all edits",
      "Bill every step separately",
      "Ask payer to ignore edits"
    ],
    "correctSolution": "Turn on bundling edits; pop-up 'included service'; short refresher"
  },
  {
    "id": 7,
    "caseFile": "A patient came with ear pain and had wax removed. The note shows only the short problem history and the procedure. The coder also billed a separate office visit using modifier‑25, but there was no extra, separate evaluation documented. This makes it look like two payable services instead of one. Payers may deny or ask for money back.",
    "violationOptions": [
      "Used modifier-25 without a significant, separate E/M",
      "Only the procedure billed",
      "Drug units correct",
      "External cause added"
    ],
    "correctViolation": "Used modifier-25 without a significant, separate E/M",
    "rootCauseOptions": [
      "Template auto-suggested -25; coder didn't verify the note",
      "Printer jam",
      "Scales off",
      "Patient late"
    ],
    "correctRootCause": "Template auto-suggested -25; coder didn't verify the note",
    "solutionOptions": [
      "Use a 3-item checklist to prove separate E/M; block -25 unless checked; quick training",
      "Remove all modifiers",
      "Always add -25",
      "Bill E/M twice"
    ],
    "correctSolution": "Use a 3-item checklist to prove separate E/M; block -25 unless checked; quick training"
  },
  {
    "id": 8,
    "caseFile": "A small fatty lump (lipoma) was removed from the back. The operative note template copied a paragraph twice by mistake. The coder read fast and billed two removals. Follow‑up notes and the wound check mention only one incision. The claim tells a bigger story than what really happened.",
    "violationOptions": [
      "Duplicate procedure billed for a single excision",
      "Single excision billed once",
      "OB weeks added",
      "Contrast code used"
    ],
    "correctViolation": "Duplicate procedure billed for a single excision",
    "rootCauseOptions": [
      "Template duplicated a paragraph; no count check vs op note",
      "Patient changed mid-case",
      "OR clock stopped",
      "Slow internet"
    ],
    "correctRootCause": "Template duplicated a paragraph; no count check vs op note",
    "solutionOptions": [
      "Add 'unique procedure count' check; compare op note counts vs charges; fix template",
      "Allow unlimited duplicates",
      "Hide the op note from coders",
      "Bill three times to be safe"
    ],
    "correctSolution": "Add 'unique procedure count' check; compare op note counts vs charges; fix template"
  },
  {
    "id": 9,
    "caseFile": "A child received a vaccine in clinic. The claim shows the vaccine and the administration code, which is correct. It also shows a separate supply code for the syringe. The payer's rule counts the syringe as part of giving the shot. The extra supply line can cause a denial or overbilling risk.",
    "violationOptions": [
      "Separate supply billed when it is included in administration",
      "Supply included correctly",
      "Right external cause used",
      "Time-based visit code added"
    ],
    "correctViolation": "Separate supply billed when it is included in administration",
    "rootCauseOptions": [
      "Charge master had an outdated rule; coder followed it",
      "Fridge was noisy",
      "Reception printed in color",
      "Nurse wore blue gown"
    ],
    "correctRootCause": "Charge master had an outdated rule; coder followed it",
    "solutionOptions": [
      "Update charge master; add payer policy tip; block syringe when admin present",
      "Bill all supplies separately",
      "Remove vaccine admin codes",
      "Let patients bring their own syringes"
    ],
    "correctSolution": "Update charge master; add payer policy tip; block syringe when admin present"
  },
  {
    "id": 10,
    "caseFile": "A chemo drug of 80 mg was given. The HCPCS code counts 10 mg per unit. The claim shows only 1 unit instead of 8. The bill now under‑reports the drug used and the payment will be wrong. Audits may flag this as a unit error.",
    "violationOptions": [
      "Units on claim don't match dose given",
      "Units matched dose",
      "Left/right modifier correct",
      "External cause added"
    ],
    "correctViolation": "Units on claim don't match dose given",
    "rootCauseOptions": [
      "Coder didn't read 'mg per unit'; no dose-to-unit calculator",
      "Nurse hid the MAR",
      "Lights were off",
      "Pharmacy changed label colors"
    ],
    "correctRootCause": "Coder didn't read 'mg per unit'; no dose-to-unit calculator",
    "solutionOptions": [
      "Add dose-to-unit calculator + hard-stop edit; show 'unit = 10 mg' next to code; refresher",
      "Always bill 1 unit for simplicity",
      "Round doses to nearest 100 mg",
      "Ask payers to convert units later"
    ],
    "correctSolution": "Add dose-to-unit calculator + hard-stop edit; show 'unit = 10 mg' next to code; refresher"
  },
  {
    "id": 11,
    "caseFile": "The clinic note looks long because the computer filled many 'normal' boxes. The real thinking by the provider was simple: one stable problem, no tests, low risk. The coder picked a high visit level because the note is long. This makes the visit look more complex than it was. Payers may see this as upcoding.",
    "violationOptions": [
      "Upcoded visit level not supported by MDM/time",
      "Correct E/M level chosen by MDM",
      "Correct place code added",
      "Correct pregnancy week used"
    ],
    "correctViolation": "Upcoded visit level not supported by MDM/time",
    "rootCauseOptions": [
      "Coder picked level by note length; didn't review MDM",
      "Clinic had no chairs",
      "Double-sided printing",
      "Thermometer missing"
    ],
    "correctRootCause": "Coder picked level by note length; didn't review MDM",
    "solutionOptions": [
      "Teach 'code by MDM/time'; add level suggestion tied to MDM; audit auto-fill inflation",
      "Always pick highest level",
      "Delete MDM section",
      "Ban templates"
    ],
    "correctSolution": "Teach 'code by MDM/time'; add level suggestion tied to MDM; audit auto-fill inflation"
  },
  {
    "id": 12,
    "caseFile": "The provider billed a time-based visit and a prolonged service add‑on. The note says 'long counseling,' but does not list total minutes for that day. Time‑based codes need total time and what it covered. Without minutes, reviewers cannot confirm the level. The record is not complete for time coding.",
    "violationOptions": [
      "Time-based code used without total time",
      "Correct time documented",
      "Correct laterality used",
      "Supply billed correctly"
    ],
    "correctViolation": "Time-based code used without total time",
    "rootCauseOptions": [
      "Provider forgot to record minutes; template lacks a time field",
      "Clock set to 24-hour format",
      "Nurse wore a watch",
      "No window in room"
    ],
    "correctRootCause": "Provider forgot to record minutes; template lacks a time field",
    "solutionOptions": [
      "Add mandatory time box; teach what counts; block time codes if time empty",
      "Estimate time later from memory",
      "Replace time codes with flat fees",
      "Let coders guess minutes"
    ],
    "correctSolution": "Add mandatory time box; teach what counts; block time codes if time empty"
  },
  {
    "id": 13,
    "caseFile": "A CT abdomen was ordered with contrast dye, but the dye was not used due to a shortage. The final radiology report clearly says 'non‑contrast study.' The claim still shows the with‑contrast code because charges pulled from the order screen. The codes should reflect what actually happened, not only what was planned. The current bill does not match the procedure performed.",
    "violationOptions": [
      "Coded what was ordered, not what was done",
      "Correctly coded non-contrast CT",
      "External cause added",
      "OB weeks added"
    ],
    "correctViolation": "Coded what was ordered, not what was done",
    "rootCauseOptions": [
      "Charge pulled from the order, not from the final radiology report",
      "Radiologist whispered results",
      "Scanner fan noisy",
      "Printer out of paper"
    ],
    "correctRootCause": "Charge pulled from the order, not from the final radiology report",
    "solutionOptions": [
      "Bill from finalized report; add 'contrast used?' checkbox; block mismatch",
      "Always code with contrast",
      "Ask payer to choose",
      "Delete the report"
    ],
    "correctSolution": "Bill from finalized report; add 'contrast used?' checkbox; block mismatch"
  },
  {
    "id": 14,
    "caseFile": "In the cath lab, stents were placed in two different heart arteries (for example LAD and RCA). The op note lists both vessels and device details. The charge system pulled only the first line. The claim now shows just one vessel treated. This under‑reports care and reduces correct payment.",
    "violationOptions": [
      "Missed coding a second distinct vessel",
      "Coded both vessels correctly",
      "Correct activity code used",
      "Supply code for stent syringe added"
    ],
    "correctViolation": "Missed coding a second distinct vessel",
    "rootCauseOptions": [
      "Charge capture pulled only first code; coder didn't read full vessel list",
      "Cath lab lights dim",
      "Contrast looked blue",
      "Patient changed arteries"
    ],
    "correctRootCause": "Charge capture pulled only first code; coder didn't read full vessel list",
    "solutionOptions": [
      "Use a vessel checklist (LAD/RCA/Cx…); match device log; import multi-line charges",
      "Always bill one vessel",
      "Let payer add vessels",
      "Hide cath report"
    ],
    "correctSolution": "Use a vessel checklist (LAD/RCA/Cx…); match device log; import multi-line charges"
  },
  {
    "id": 15,
    "caseFile": "Three weeks after a wrist fracture, the patient returns for a routine healing check. The plan says 'continue cast, routine healing.' The coder billed the visit as an initial/active treatment encounter instead of follow‑up. That makes it look like new treatment was started when it was just routine care. The story in the bill does not match the note.",
    "violationOptions": [
      "Used initial/active encounter instead of routine follow-up",
      "Used subsequent encounter for routine healing",
      "Added correct external cause",
      "Used correct contrast code"
    ],
    "correctViolation": "Used initial/active encounter instead of routine follow-up",
    "rootCauseOptions": [
      "Coder missed 'routine healing'; default stayed 'initial'",
      "Clinic day was Tuesday",
      "X-ray room painted blue",
      "Consent stapled twice"
    ],
    "correctRootCause": "Coder missed 'routine healing'; default stayed 'initial'",
    "solutionOptions": [
      "Add encounter-type prompt (initial/subsequent/sequela); default to 'subsequent' when note says routine healing",
      "Always code initial",
      "Remove encounter types",
      "Ask patient which type"
    ],
    "correctSolution": "Add encounter-type prompt (initial/subsequent/sequela); default to 'subsequent' when note says routine healing"
  },
  {
    "id": 16,
    "caseFile": "A patient was treated for a urinary infection. Early notes said 'rule out sepsis,' but by discharge the doctor wrote 'sepsis ruled out.' The coder left the sepsis code on the claim anyway. This makes the bill show a serious condition that was not present. Payment and reports can be affected.",
    "violationOptions": [
      "Left a ruled-out diagnosis on the final claim",
      "Removed ruled-out diagnosis",
      "Added pregnancy weeks",
      "Used correct laterality"
    ],
    "correctViolation": "Left a ruled-out diagnosis on the final claim",
    "rootCauseOptions": [
      "Coder copied early 'r/o sepsis' and missed the final 'ruled out' note",
      "Blood culture machine loud",
      "Bedsheets white",
      "Patient ate late"
    ],
    "correctRootCause": "Coder copied early 'r/o sepsis' and missed the final 'ruled out' note",
    "solutionOptions": [
      "Do a final-diagnosis reconciliation; flag 'ruled out' terms; peer review high-impact cases",
      "Keep all possible diagnoses",
      "Ask payer to decide",
      "Delete early notes"
    ],
    "correctSolution": "Do a final-diagnosis reconciliation; flag 'ruled out' terms; peer review high-impact cases"
  },
  {
    "id": 17,
    "caseFile": "A coder needed to ask a doctor a question. Instead of using the hospital's secure message tool, the coder sent a personal Gmail with the patient's name and ID. No one reported this to the privacy officer. Patient information must be protected. Sending it through personal email is a risk and against policy.",
    "violationOptions": [
      "Sent PHI outside approved secure channels",
      "Used secure message system",
      "Removed all patient info",
      "Encrypted per policy"
    ],
    "correctViolation": "Sent PHI outside approved secure channels",
    "rootCauseOptions": [
      "Didn't know policy / no quick secure tool; deadline pressure",
      "Patient asked for Gmail",
      "Hospital banned computers",
      "Doctor prefers postcards"
    ],
    "correctRootCause": "Didn't know policy / no quick secure tool; deadline pressure",
    "solutionOptions": [
      "Train on PHI rules; auto-block emails with PHI keywords; give a one-click secure query tool",
      "Allow any email if urgent",
      "Print PHI and mail it",
      "Store PHI on personal phones"
    ],
    "correctSolution": "Train on PHI rules; auto-block emails with PHI keywords; give a one-click secure query tool"
  },
  {
    "id": 18,
    "caseFile": "The note mentions possible fluid overload but does not clearly diagnose heart failure. The coder sent a query that said, 'Please confirm acute heart failure,' with a yes/no choice. This pushes the doctor toward one answer. Queries should be neutral and open. The current wording can change the record unfairly.",
    "violationOptions": [
      "Used a leading (non-neutral) query",
      "Used a neutral, open-ended query",
      "Did not send any query",
      "Asked HIM to edit the note"
    ],
    "correctViolation": "Used a leading (non-neutral) query",
    "rootCauseOptions": [
      "No standard query templates; pressure to finish; didn't know neutral wording",
      "Provider hates questions",
      "Office ran out of paper",
      "Clinic door locked"
    ],
    "correctRootCause": "No standard query templates; pressure to finish; didn't know neutral wording",
    "solutionOptions": [
      "Use neutral query templates; train staff; quick peer check for sensitive diagnoses",
      "Ban all queries",
      "Use only yes/no queries",
      "Let coders assign diagnoses"
    ],
    "correctSolution": "Use neutral query templates; train staff; quick peer check for sensitive diagnoses"
  },
  {
    "id": 19,
    "caseFile": "New diagnosis codes started on October 1. The encoder software on some computers was not updated. For two weeks, staff kept using last year's codes. Payers denied the claims as 'invalid code for date of service.' Revenue dropped and rework increased. A clear update process was missing.",
    "violationOptions": [
      "Used retired/invalid codes for date of service",
      "Used current codes",
      "Added correct external cause",
      "Used correct units"
    ],
    "correctViolation": "Used retired/invalid codes for date of service",
    "rootCauseOptions": [
      "No owner/checklist for updates; coders not alerted",
      "Sun set early",
      "Reception smiled too much",
      "Building has four floors"
    ],
    "correctRootCause": "No owner/checklist for updates; coders not alerted",
    "solutionOptions": [
      "Assign update owner; pre/post checklist; alert banner on go-live; spot-audit first week",
      "Wait for denials to fix",
      "Turn off updates",
      "Ask payers to auto-map old codes"
    ],
    "correctSolution": "Assign update owner; pre/post checklist; alert banner on go-live; spot-audit first week"
  },
  {
    "id": 20,
    "caseFile": "An internal audit found many mistakes: wrong use of modifier‑25, missing time for time‑based visits, and wrong drug units. The report was emailed, but no corrective plan was opened. Next month the same errors appeared again. Without owners and due dates, nothing changed. The problems keep repeating.",
    "violationOptions": [
      "No CAPA after audit findings; issues repeated",
      "CAPA created and closed",
      "Errors dropped after training",
      "Root causes well documented"
    ],
    "correctViolation": "No CAPA after audit findings; issues repeated",
    "rootCauseOptions": [
      "No owner/due dates; audit report not tied to actions; weak follow-up",
      "Printer squeaked",
      "Parking lot full",
      "Cafeteria closed"
    ],
    "correctRootCause": "No owner/due dates; audit report not tied to actions; weak follow-up",
    "solutionOptions": [
      "Open a CAPA with owners/dates; track fixes (policy, training, edits); re‑audit to confirm drop",
      "Ignore audits if under 20% error",
      "Run another audit without action",
      "Delete the audit report"
    ],
    "correctSolution": "Open a CAPA with owners/dates; track fixes (policy, training, edits); re‑audit to confirm drop"
  }
];