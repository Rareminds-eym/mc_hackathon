import { GameMode } from '../../../types/Level2/types';

export const gameModes: GameMode[] = [
  {
    id: 'prefix-vs-suffix',
    title: '� Prefix vs Suffix Sort',
    description: 'Sort medical terms into Prefix vs Suffix categories',
    moduleId: 1,
    type: 1,
    categories: [
      {
        id: 'prefix',
        name: 'Prefix',
        description: 'Word parts that come before the root word',
        color: 'bg-blue-100 border-blue-300'
      },
      {
        id: 'suffix',
        name: 'Suffix',
        description: 'Word parts that come after the root word',
        color: 'bg-green-100 border-green-300'
      }
    ],
    terms: [
      { id: 'nephro', text: 'Nephro', correctCategory: 'prefix' },
      { id: 'megaly', text: 'Megaly', correctCategory: 'suffix' },
      { id: 'cardio', text: 'Cardio', correctCategory: 'prefix' },
      { id: 'logy', text: 'Logy', correctCategory: 'suffix' },
      { id: 'ectomy', text: 'Ectomy', correctCategory: 'suffix' }
    ]
  },
  {
    id: 'digestive-vs-nondigestive',
    title: '🫁 Digestive vs Non-Digestive Sort',
    description: 'Sort medical terms into Digestive vs Non-Digestive categories',
    moduleId: 1,
    type: 2,
    categories: [
      {
        id: 'digestive',
        name: 'Digestive',
        description: 'Terms related to digestive system',
        color: 'bg-orange-100 border-orange-300'
      },
      {
        id: 'nondigestive',
        name: 'NonDigestive',
        description: 'Terms not related to digestive system',
        color: 'bg-purple-100 border-purple-300'
      }
    ],
    terms: [
      { id: 'gastro', text: 'Gastro', correctCategory: 'digestive' },
      { id: 'hepato', text: 'Hepato', correctCategory: 'digestive' },
      { id: 'neuro', text: 'Neuro', correctCategory: 'nondigestive' },
      { id: 'rhino', text: 'Rhino', correctCategory: 'nondigestive' },
      { id: 'arthro', text: 'Arthro', correctCategory: 'nondigestive' }
    ]
  },
  {
    id: 'blood-related-vs-nonblood',
    title: '🩸 Blood Related vs Non-Blood Related Sort',
    description: 'Sort medical terms into Blood Related vs Non-Blood Related categories',
    moduleId: 1,
    type: 3,
    categories: [
      {
        id: 'bloodrelated',
        name: 'BloodRelated',
        description: 'Terms related to blood conditions',
        color: 'bg-red-100 border-red-300'
      },
      {
        id: 'nonbloodrelated',
        name: 'NonBloodRelated',
        description: 'Terms not related to blood conditions',
        color: 'bg-gray-100 border-gray-300'
      }
    ],
    terms: [
      { id: 'emia', text: 'Emia', correctCategory: 'bloodrelated' },
      { id: 'Hemo', text: 'Hemo', correctCategory: 'bloodrelated' },
      { id: 'oma', text: 'Oma', correctCategory: 'nonbloodrelated' },
      { id: 'algia', text: 'Algia', correctCategory: 'nonbloodrelated' },
      { id: 'rrhea', text: 'Rrhea', correctCategory: 'nonbloodrelated' }
    ]
  },
  {
    id: 'upper-body-vs-outer-body',
    title: '🫀 Upper Body vs Outer Body Sort',
    description: 'Sort medical terms into Upper Body vs Outer Body categories',
    moduleId: 1,
    type: 4,
    categories: [
      {
        id: 'upperbody',
        name: 'UpperBody',
        description: 'Terms related to upper body parts',
        color: 'bg-teal-100 border-teal-300'
      },
      {
        id: 'outerbody',
        name: 'OuterBody',
        description: 'Terms related to outer body parts',
        color: 'bg-yellow-100 border-yellow-300'
      }
    ],
   "terms": [
    { "id": "cervico", "text": "Cervico", "correctCategory": "upperbody" },
    { "id": "oculo", "text": "Oculo", "correctCategory": "upperbody" },
    { "id": "oto", "text": "Oto", "correctCategory": "upperbody" },
    { "id": "arthro-outer", "text": "Arthro", "correctCategory": "outerbody" },
    { "id": "dermato-outer", "text": "Dermato", "correctCategory": "outerbody" }
  ]
  },
  {
    id: 'cpt-vs-hcpcs',
    title: '🏥 CPT vs HCPCS Sort',
    description: 'Sort medical codes into CPT vs HCPCS categories',
    moduleId: 2,
    type: 1,
    categories: [
      {
        id: 'cpt',
        name: 'CPT',
        description: 'Current Procedural Terminology codes',
        color: 'bg-blue-100 border-blue-300'
      },
      {
        id: 'hcpcs',
        name: 'HCPCS',
        description: 'Healthcare Common Procedure Coding System codes',
        color: 'bg-green-100 border-green-300'
      }
    ],
    terms: [
      { id: '99213', text: '99213', correctCategory: 'cpt' },
      { id: 'A0429', text: 'A0429', correctCategory: 'hcpcs' },
      { id: 'G0008', text: 'G0008', correctCategory: 'hcpcs' },
      { id: '93000', text: '93000', correctCategory: 'cpt' }
    ]
  },
  {
    id: 'cpt-vs-modifier',
    title: '📋 CPT vs Modifier Sort',
    description: 'Sort items into CPT vs Modifier categories',
    moduleId: 2,
    type: 2,
    categories: [
      {
        id: 'cpt',
        name: 'CPT',
        description: 'Current Procedural Terminology codes',
        color: 'bg-purple-100 border-purple-300'
      },
      {
        id: 'modifier',
        name: 'Modifier',
        description: 'Code modifiers that provide additional information',
        color: 'bg-orange-100 border-orange-300'
      }
    ],
    terms: [
      { id: '99215', text: '99215', correctCategory: 'cpt' },
      { id: 'modifier-59', text: 'Modifier 59', correctCategory: 'modifier' },
      { id: 'Q2038', text: 'Q2038', correctCategory: 'modifier' },
      { id: '99406', text: '99406', correctCategory: 'cpt' }
    ]
  },
  {
    id: 'code-vs-modifier',
    title: '🔢 Code vs Modifier Sort',
    description: 'Sort items into Code vs Modifier categories',
    moduleId: 2,
    type: 3,
    categories: [
      {
        id: 'code',
        name: 'Code',
        description: 'Medical procedure or service codes',
        color: 'bg-teal-100 border-teal-300'
      },
      {
        id: 'modifier',
        name: 'Modifier',
        description: 'Code modifiers that provide additional information',
        color: 'bg-red-100 border-red-300'
      }
    ],
    terms: [
      { id: '96372', text: '96372', correctCategory: 'code' },
      { id: 'A4556', text: 'A4556', correctCategory: 'code' },
      { id: 'modifier-25', text: '-25', correctCategory: 'modifier' },
      { id: 'modifier-tc', text: '-TC', correctCategory: 'modifier' }
    ]
  },
  {
    id: 'category-i-vs-other',
    title: '📊 Category I vs Other Categories Sort',
    description: 'Sort codes into Category I vs Other Categories',
    moduleId: 2,
    type: 4,
    categories: [
      {
        id: 'category-i',
        name: 'Category I',
        description: 'Standard CPT Category I codes',
        color: 'bg-yellow-100 border-yellow-300'
      },
      {
        id: 'other-categories',
        name: 'Other Categories',
        description: 'Category II, III, and other code types',
        color: 'bg-gray-100 border-gray-300'
      }
    ],
    terms: [
      { id: '99406-cat', text: '99406', correctCategory: 'category-i' },
      { id: '0001F', text: '0001F', correctCategory: 'other-categories' },
      { id: '0075T', text: '0075T', correctCategory: 'other-categories' }
    ]
  },
  {
    id: 'sequencing-vs-exclusion',
    title: '📋 Sequencing Instruction vs Exclusion Guideline',
    description: 'Group items by their purpose in medical coding',
    moduleId: 3,
    type: 1,
    categories: [
      {
        id: 'sequencing-instruction',
        name: 'Sequencing Instruction',
        description: 'Instructions for code sequencing and ordering',
        color: 'bg-blue-100 border-blue-300'
      },
      {
        id: 'exclusion-guideline',
        name: 'Exclusion Guideline',
        description: 'Guidelines for code exclusions',
        color: 'bg-red-100 border-red-300'
      }
    ],
    terms: [
      { id: 'code-first', text: 'Code First', correctCategory: 'sequencing-instruction' },
      { id: 'use-additional-code', text: 'Use Additional Code', correctCategory: 'sequencing-instruction' },
      { id: 'excludes1', text: 'Excludes1', correctCategory: 'exclusion-guideline' },
      { id: 'excludes2', text: 'Excludes2', correctCategory: 'exclusion-guideline' }
    ]
  },
  {
    id: 'synonyms-vs-structure',
    title: '� Synonyms/Alternate Terms vs Structure Indicator',
    description: 'Classify symbols by their category in medical coding',
    moduleId: 3,
    type: 2,
    categories: [
      {
        id: 'synonyms-alternate-terms',
        name: 'Synonyms / Alternate Terms',
        description: 'Symbols indicating synonyms or alternate terms',
        color: 'bg-green-100 border-green-300'
      },
      {
        id: 'structure-indicator',
        name: 'Structure Indicator',
        description: 'Symbols indicating structure or formatting',
        color: 'bg-purple-100 border-purple-300'
      }
    ],
    terms: [
      { id: 'square-brackets', text: '[ ]', correctCategory: 'synonyms-alternate-terms' },
      { id: 'parentheses', text: '( )', correctCategory: 'synonyms-alternate-terms' },
      { id: 'colon', text: ':', correctCategory: 'structure-indicator' },
      { id: 'period', text: '.', correctCategory: 'structure-indicator' }
    ]
  },
  {
    id: 'format-vs-section',
    title: '� Format Rule vs Section',
    description: 'Sort items into Format or Usage categories',
    moduleId: 3,
    type: 3,
    categories: [
      {
        id: 'format-rule',
        name: 'Format Rule',
        description: 'Rules for formatting and structure',
        color: 'bg-orange-100 border-orange-300'
      },
      {
        id: 'section',
        name: 'Section',
        description: 'Sections or parts of coding system',
        color: 'bg-teal-100 border-teal-300'
      }
    ],
    terms: [
      { id: 'placeholder-x', text: 'Placeholder X', correctCategory: 'format-rule' },
      { id: 'laterality', text: 'Laterality', correctCategory: 'format-rule' },
      { id: 'tabular-list', text: 'Tabular List', correctCategory: 'section' },
      { id: 'alphabetic-index', text: 'Alphabetic Index', correctCategory: 'section' }
    ]
  },
  {
    id: 'surgical-vs-nonsurgical',
    title: '🏥 Surgical vs Non-surgical Sort',
    description: 'Sort medical specialties into Surgical vs Non-surgical categories',
    moduleId: 4,
    type: 1,
    categories: [
      {
        id: 'surgical',
        name: 'Surgical',
        description: 'Surgical procedures and specialties',
        color: 'bg-red-100 border-red-300'
      },
      {
        id: 'non-surgical',
        name: 'Non-surgical',
        description: 'Non-surgical specialties and services',
        color: 'bg-blue-100 border-blue-300'
      }
    ],
    terms: [
      { id: 'surgery', text: 'Surgery', correctCategory: 'surgical' },
      { id: 'radiology', text: 'Radiology', correctCategory: 'non-surgical' },
      { id: 'pathology-laboratory', text: 'Pathology & Laboratory', correctCategory: 'non-surgical' },
      { id: 'evaluation-management', text: 'Evaluation & Management', correctCategory: 'non-surgical' },
      { id: 'medicine', text: 'Medicine', correctCategory: 'non-surgical' }
    ]
  },
  {
    id: 'em-related-vs-procedural',
    title: '📋 E/M Related vs Procedural Modifiers',
    description: 'Sort modifiers into E/M Related vs Procedural categories',
    moduleId: 4,
    type: 2,
    categories: [
      {
        id: 'em-related',
        name: 'E/M Related',
        description: 'Modifiers related to Evaluation & Management',
        color: 'bg-green-100 border-green-300'
      },
      {
        id: 'procedural',
        name: 'Procedural',
        description: 'Modifiers related to procedures',
        color: 'bg-purple-100 border-purple-300'
      }
    ],
    terms: [
      { id: 'modifier-25', text: '25', correctCategory: 'em-related' },
      { id: 'modifier-26', text: '26', correctCategory: 'em-related' },
      { id: 'modifier-tc', text: 'TC', correctCategory: 'em-related' },
      { id: 'modifier-59', text: '59', correctCategory: 'procedural' },
      { id: 'modifier-51', text: '51', correctCategory: 'procedural' }
    ]
  },
  {
    id: 'drugs-vs-services-devices',
    title: '� Drugs vs Services/Devices',
    description: 'Sort HCPCS code prefixes into Drugs vs Services/Devices categories',
    moduleId: 4,
    type: 3,
    categories: [
      {
        id: 'drugs',
        name: 'Drugs',
        description: 'Drug-related HCPCS codes',
        color: 'bg-orange-100 border-orange-300'
      },
      {
        id: 'services-devices',
        name: 'Services/Devices',
        description: 'Services and devices HCPCS codes',
        color: 'bg-teal-100 border-teal-300'
      }
    ],
    terms: [
      { id: 'prefix-j', text: 'J', correctCategory: 'drugs' },
      { id: 'prefix-g', text: 'G', correctCategory: 'services-devices' },
      { id: 'prefix-k', text: 'K', correctCategory: 'services-devices' },
      { id: 'prefix-l', text: 'L', correctCategory: 'services-devices' }
    ]
  }
];


export const getGameModesByModule = (moduleId: number): GameMode[] => {
  return gameModes.filter(mode => mode.moduleId === moduleId);
};

// Get game modes by module and type
export const getGameModesByModuleAndType = (moduleId: number, type: number): GameMode[] => {
  return gameModes.filter(mode => mode.moduleId === moduleId && mode.type === type);
};

// Get all types available for a specific module
export const getTypesForModule = (moduleId: number): number[] => {
  const modes = getGameModesByModule(moduleId);
  return [...new Set(modes.map(mode => mode.type))].sort();
};

// Get game modes organized by type for a module
export const getGameModesGroupedByType = (moduleId: number) => {
  const modes = getGameModesByModule(moduleId);
  return modes.reduce((acc, mode) => {
    if (!acc[mode.type]) {
      acc[mode.type] = [];
    }
    acc[mode.type].push(mode);
    return acc;
  }, {} as Record<number, GameMode[]>);
};

// Flow configuration for different modules
export interface ModuleFlowConfig {
  moduleId: number;
  typeSequence: number[];
  requiresContinueButton: boolean;
  showResultsAfterEachType: boolean;
  description: string;
}

export const moduleFlowConfigs: ModuleFlowConfig[] = [
  {
    moduleId: 1,
    typeSequence: [1, 2, 3, 4],
    requiresContinueButton: true,
    showResultsAfterEachType: false,
    description: 'Module 1: Medical terminology sorting - Sequential types 1→2→3→4 with Continue buttons between each'
  },
  {
    moduleId: 2,
    typeSequence: [1, 2, 3, 4],
    requiresContinueButton: true,
    showResultsAfterEachType: false,
    description: 'Module 2: Medical coding sorting - Sequential types 1→2→3→4 with Continue buttons between each'
  },
  {
    moduleId: 3,
    typeSequence: [1, 2, 3],
    requiresContinueButton: true,
    showResultsAfterEachType: false,
    description: 'Module 3: Medical coding guidelines - Sequential types 1→2→3 with Continue buttons between each'
  },
  {
    moduleId: 4,
    typeSequence: [1, 2, 3],
    requiresContinueButton: true,
    showResultsAfterEachType: false,
    description: 'Module 4: Medical coding specialties and modifiers - Sequential types 1→2→3 with Continue buttons between each'
  }
];

// Get flow configuration for a specific module
export const getModuleFlowConfig = (moduleId: number): ModuleFlowConfig | undefined => {
  return moduleFlowConfigs.find(config => config.moduleId === moduleId);
};

// Check if a module requires continue buttons between types
export const moduleRequiresContinueButton = (moduleId: number): boolean => {
  const config = getModuleFlowConfig(moduleId);
  return config?.requiresContinueButton ?? false;
};

// Get the next type in the sequence for a module
export const getNextTypeInSequence = (moduleId: number, currentType: number): number | null => {
  const config = getModuleFlowConfig(moduleId);
  if (!config) return null;

  const currentIndex = config.typeSequence.indexOf(currentType);
  if (currentIndex === -1 || currentIndex === config.typeSequence.length - 1) {
    return null; // No next type
  }

  return config.typeSequence[currentIndex + 1];
};

// Check if a type is the last in the sequence for a module
export const isLastTypeInSequence = (moduleId: number, currentType: number): boolean => {
  const config = getModuleFlowConfig(moduleId);
  if (!config) return true;

  const lastType = config.typeSequence[config.typeSequence.length - 1];
  return currentType === lastType;
};

// Get the first type in the sequence for a module
export const getFirstTypeInSequence = (moduleId: number): number | null => {
  const config = getModuleFlowConfig(moduleId);
  return config?.typeSequence[0] ?? null;
};