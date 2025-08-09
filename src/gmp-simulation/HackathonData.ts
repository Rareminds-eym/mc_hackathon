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
    id: 1,
    caseFile: "Entries written in pencil and later rewritten in blue ink",
    violationOptions: ["Equipment Qualification", "Personnel Hygiene", "Documentation Practices", "Storage Conditions"],
    correctViolation: "Documentation Practices",
    rootCauseOptions: ["Operator unaware of permanent ink policy", "Expired ink pen", "Training material not laminated", "Delayed deviation closure"],
    correctRootCause: "Operator unaware of permanent ink policy",
    solutionOptions: ["Introduce black pen SOP", "Retrain all operators on GDP", "Use invisible ink", "Replace documentation team"],
    correctSolution: "Retrain all operators on GDP"
  },
  {
    id: 2,
    caseFile: "Storage temperature reached 30°C for 8 hours, no alert raised",
    violationOptions: ["Temperature Control", "Water Testing", "Vendor Qualification", "Product Labeling"],
    correctViolation: "Temperature Control",
    rootCauseOptions: ["Sensor battery failure", "Fire alarm malfunction", "Power outage in canteen", "Staff didn't wear gloves"],
    correctRootCause: "Sensor battery failure",
    solutionOptions: ["Freeze all batches", "Add manual logbook", "Install dual-alert sensor with auto-SMS", "Change thermometer color"],
    correctSolution: "Install dual-alert sensor with auto-SMS"
  },
  {
    id: 3,
    caseFile: "Similar API names kept adjacent, wrong API used",
    violationOptions: ["Cross-contamination", "Dispensing & Material Handling", "Packaging Control", "Vendor Audit"],
    correctViolation: "Dispensing & Material Handling",
    rootCauseOptions: ["Look-alike packaging with poor labeling", "Warehouse humidity", "Wrong barcoding", "No insect traps"],
    correctRootCause: "Look-alike packaging with poor labeling",
    solutionOptions: ["Purchase new raw material", "Change vendor", "Physically separate and relabel materials", "Rotate raw materials monthly"],
    correctSolution: "Physically separate and relabel materials"
  },
  {
    id: 4,
    caseFile: "Operator wore lab coat in Grade B area",
    violationOptions: ["Gowning SOP Violation", "Pest Control", "Label Control", "Drainage Maintenance"],
    correctViolation: "Gowning SOP Violation",
    rootCauseOptions: ["Lack of visual signage at entry point", "Late lunch breaks", "Footwear misplacement", "Temperature fluctuations"],
    correctRootCause: "Lack of visual signage at entry point",
    solutionOptions: ["Suspend operator", "Paste gowning visuals + retrain", "Change gown vendor", "Build new changing room"],
    correctSolution: "Paste gowning visuals + retrain"
  },
  {
    id: 5,
    caseFile: "15 SOPs not reviewed in 2 years",
    violationOptions: ["Change Control", "SOP Review & Documentation", "Lab Equipment Validation", "Line Clearance"],
    correctViolation: "SOP Review & Documentation",
    rootCauseOptions: ["No SOP tracking calendar", "Printer was slow", "SOPs hard to understand", "SOP font too small"],
    correctRootCause: "No SOP tracking calendar",
    solutionOptions: ["Archive old SOPs", "Digital SOP tracker with auto-alerts", "Create SOPs in Hindi", "Hire SOP manager"],
    correctSolution: "Digital SOP tracker with auto-alerts"
  },
  {
    id: 6,
    caseFile: "Microbial count exceeded limits; irregular sanitization",
    violationOptions: ["Water System Monitoring", "Vendor Qualification", "Stability Testing", "Microbial Testing Kit"],
    correctViolation: "Water System Monitoring",
    rootCauseOptions: ["Sanitization not scheduled weekly", "RO system overloaded", "Filter had algae", "No gloves worn during testing"],
    correctRootCause: "Sanitization not scheduled weekly",
    solutionOptions: ["Conduct final rinse", "Lock tank access", "Schedule auto-sanitization every 7 days", "Use UV stickers"],
    correctSolution: "Schedule auto-sanitization every 7 days"
  },
  {
    id: 7,
    caseFile: "Batch shipped with outdated artwork label",
    violationOptions: ["Artwork Management", "Visual Inspection", "Expiry Date Validation", "Calibration"],
    correctViolation: "Artwork Management",
    rootCauseOptions: ["Artwork change not updated in master copy", "HR didn't inform warehouse", "Stock too high", "Label font unreadable"],
    correctRootCause: "Artwork change not updated in master copy",
    solutionOptions: ["Lock print room", "Link artwork tracker to change control system", "Color-code label reels", "Use QR stickers"],
    correctSolution: "Link artwork tracker to change control system"
  },
  {
    id: 8,
    caseFile: "Same deviation recurred 4 times; CAPA marked closed each time",
    violationOptions: ["Ineffective CAPA Management", "SOP Duplication", "Internal Audit", "Product Sampling"],
    correctViolation: "Ineffective CAPA Management",
    rootCauseOptions: ["CAPA just copied from previous incident", "Operator changed", "Vendor delay", "SOP misplaced"],
    correctRootCause: "CAPA just copied from previous incident",
    solutionOptions: ["Force RCA change every time", "Review CAPA effectiveness after 15 days", "Track via WhatsApp", "Add graphics to CAPA"],
    correctSolution: "Review CAPA effectiveness after 15 days"
  },
  {
    id: 9,
    caseFile: "Operator cleaned equipment without training",
    violationOptions: ["Personnel Training", "Area Qualification", "Equipment Hold Time", "Raw Material Sampling"],
    correctViolation: "Personnel Training",
    rootCauseOptions: ["Training matrix not updated", "Forgot password", "Overlapping shift", "Toolbox missing"],
    correctRootCause: "Training matrix not updated",
    solutionOptions: ["Suspend operator", "Link training to equipment ID", "Move training to HR", "Machine stickers"],
    correctSolution: "Link training to equipment ID"
  },
  {
    id: 10,
    caseFile: "Same mix tank used between batches without cleaning time",
    violationOptions: ["Cleaning Validation", "Glassware SOP", "Shift Handover", "Gowning Room Entry"],
    correctViolation: "Cleaning Validation",
    rootCauseOptions: ["Cleaning cycle time reduced to meet dispatch", "Foam detergent used", "Wrong pH", "Label fell off"],
    correctRootCause: "Cleaning cycle time reduced to meet dispatch",
    solutionOptions: ["Digital cleaning logs with checklists", "Color tank lid", "Emoji labels", "Reduce cleaning steps"],
    correctSolution: "Digital cleaning logs with checklists"
  },
  {
    id: 11,
    caseFile: "Previous batch remnants found during line clearance",
    violationOptions: ["Line Clearance", "Change Control", "Batch Review", "Pest Control"],
    correctViolation: "Line Clearance",
    rootCauseOptions: ["Poor visual inspection", "Batch release delayed", "Untrained QA", "Late cleaning crew"],
    correctRootCause: "Poor visual inspection",
    solutionOptions: ["Reinforce line clearance training", "Assign janitor to QA", "Color-code dustbins", "Freeze line movement"],
    correctSolution: "Reinforce line clearance training"
  },
  {
    id: 12,
    caseFile: "Weighing balance inconsistent across shifts",
    violationOptions: ["Calibration", "Cleaning", "Temperature Control", "Sampling"],
    correctViolation: "Calibration",
    rootCauseOptions: ["Balance not calibrated per schedule", "Operator leaned on table", "Wrong voltage", "Humidity too high"],
    correctRootCause: "Balance not calibrated per schedule",
    solutionOptions: ["Monthly calibration tracker", "Replace balance", "Label with stickers", "Shift balance"],
    correctSolution: "Monthly calibration tracker"
  },
  {
    id: 13,
    caseFile: "Broken thermometer found during QA inspection",
    violationOptions: ["Equipment Maintenance", "Storage Practices", "Glassware Handling", "Change Control"],
    correctViolation: "Equipment Maintenance",
    rootCauseOptions: ["No preventive maintenance log", "No SOP for glass handling", "Broken by cleaner", "Overloaded racks"],
    correctRootCause: "No preventive maintenance log",
    solutionOptions: ["Set reminder for preventive maintenance", "Use digital thermometer", "SOP for glass check", "Increase shelf spacing"],
    correctSolution: "Set reminder for preventive maintenance"
  },
  {
    id: 14,
    caseFile: "Labels detached from containers due to humidity",
    violationOptions: ["Labeling and Packaging", "Storage Practices", "Hygiene", "Vendor Compliance"],
    correctViolation: "Labeling and Packaging",
    rootCauseOptions: ["Wrong adhesive for environment", "Staff error", "Label text long", "Warehouse too bright"],
    correctRootCause: "Wrong adhesive for environment",
    solutionOptions: ["Use environment-tested adhesive", "Change storage room", "Laminate labels", "Smaller labels"],
    correctSolution: "Use environment-tested adhesive"
  },
  {
    id: 15,
    caseFile: "Raw materials used before QC approval",
    violationOptions: ["Material Management", "Sampling", "CAPA", "Water Quality"],
    correctViolation: "Material Management",
    rootCauseOptions: ["No physical quarantine system", "QC forgot entry", "Material expired", "System auto-released"],
    correctRootCause: "No physical quarantine system",
    solutionOptions: ["Red-tag quarantine area", "Reminder to QC", "Color bins", "Weekly expiry check"],
    correctSolution: "Red-tag quarantine area"
  },
  {
    id: 16,
    caseFile: "Power failure during mixing step not documented",
    violationOptions: ["Deviation Management", "Utility Monitoring", "Production Logging", "Preventive Maintenance"],
    correctViolation: "Deviation Management",
    rootCauseOptions: ["No awareness about deviation reporting", "Power alert failed", "SOP unclear", "Generator missing"],
    correctRootCause: "No awareness about deviation reporting",
    solutionOptions: ["Deviation Awareness Campaign", "Deviation hotline", "Auto-log power", "Install UPS"],
    correctSolution: "Deviation Awareness Campaign"
  },
  {
    id: 17,
    caseFile: "Operators bypassed metal detector",
    violationOptions: ["Process Compliance", "Equipment Usage", "In-Process Checks", "Safety Protocols"],
    correctViolation: "Process Compliance",
    rootCauseOptions: ["Metal detector alarm disabled", "SOP unclear", "Operator fatigue", "Loose schedule"],
    correctRootCause: "Metal detector alarm disabled",
    solutionOptions: ["Auto-lock on alarm", "Retrain operators", "Buzzer sensor", "Colored floor arrows"],
    correctSolution: "Auto-lock on alarm"
  },
  {
    id: 18,
    caseFile: "Drain near production line clogged for 2 hours",
    violationOptions: ["Facility Maintenance", "Hygiene Control", "Cleaning SOP", "Pest Control"],
    correctViolation: "Facility Maintenance",
    rootCauseOptions: ["Drain cleaning frequency reduced", "No drain trap", "Floor slope issue", "Cleaning missed"],
    correctRootCause: "Drain cleaning frequency reduced",
    solutionOptions: ["Fixed weekly cleaning schedule", "Label drain exits", "Train team on maps", "High-pressure flush"],
    correctSolution: "Fixed weekly cleaning schedule"
  },
  {
    id: 19,
    caseFile: "Same gloves used for two batches",
    violationOptions: ["Personal Hygiene", "Cross Contamination", "Batch Handling", "Sterility Assurance"],
    correctViolation: "Cross Contamination",
    rootCauseOptions: ["Lack of glove-changing SOP", "Staff forgot", "No disposal bin", "Washing station far"],
    correctRootCause: "Lack of glove-changing SOP",
    solutionOptions: ["Visual glove change reminders", "Retrain on change points", "Glove log sheet", "Color-coded gloves"],
    correctSolution: "Visual glove change reminders"
  },
  {
    id: 20,
    caseFile: "Rejected and approved materials stored together",
    violationOptions: ["Material Segregation", "Vendor Management", "Pest Control", "Audit Failure"],
    correctViolation: "Material Segregation",
    rootCauseOptions: ["No physical partition in warehouse", "No bin labels", "QA didn't verify", "Late forklift movement"],
    correctRootCause: "No physical partition in warehouse",
    solutionOptions: ["Color-code zones with visuals", "Rejection cage", "Warning lights", "Bin-in-charge"],
    correctSolution: "Color-code zones with visuals"
  }
];