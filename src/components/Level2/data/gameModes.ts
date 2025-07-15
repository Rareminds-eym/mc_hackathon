import { GameMode } from '../../../types/Level2/types';

export const gameModes: GameMode[] = [
  {
    id: 'gmp-vs-non-gmp',
    title: '📂 GMP vs Non-GMP Sort',
    description: 'Sort items into GMP Requirements vs Non-GMP Related',
    moduleId: 1,
    categories: [
      {
        id: 'gmp-requirement',
        name: 'GMP Requirement',
        description: 'Essential for Good Manufacturing Practice',
        color: 'bg-green-100 border-green-300'
      },
      {
        id: 'not-gmp-related',
        name: 'Not GMP Related',
        description: 'Not directly related to manufacturing quality',
        color: 'bg-gray-100 border-gray-300'
      }
    ],
    terms: [
      { id: 'sanitation-log', text: 'Sanitation Log', correctCategory: 'gmp-requirement' },
      { id: 'marketing-brochure', text: 'Product Marketing Brochure', correctCategory: 'not-gmp-related' },
      { id: 'equipment-maintenance', text: 'Equipment Maintenance Checklist', correctCategory: 'gmp-requirement' },
      { id: 'social-media', text: 'Social Media Post', correctCategory: 'not-gmp-related' },
      { id: 'batch-processing', text: 'Batch Processing Record', correctCategory: 'gmp-requirement' },
      { id: 'training-attendance', text: 'Training Attendance Sheet', correctCategory: 'gmp-requirement' },
      { id: 'sales-pitch', text: 'Sales Pitch Document', correctCategory: 'not-gmp-related' },
      { id: 'deviation-report', text: 'Deviation Report Form', correctCategory: 'gmp-requirement' }
    ]
  },
  {
    id: 'documentation-vs-production',
    title: '📋 Documentation vs Production Sort',
    description: 'Sort items into Documentation vs Production categories',
    moduleId: 2,
    categories: [
      {
        id: 'documentation',
        name: 'Documentation',
        description: 'Records, logs, and documentation materials',
        color: 'bg-green-100 border-green-300'
      },
      {
        id: 'production',
        name: 'Production',
        description: 'Manufacturing processes and activities',
        color: 'bg-gray-100 border-gray-300'
      }
    ],
    terms: [
      { id: 'batch-manufacturing-record', text: 'Batch Manufacturing Record', correctCategory: 'documentation' },
      { id: 'cleaning-sanitation', text: 'Cleaning and Sanitation', correctCategory: 'production' },
      { id: 'equipment-usage-log', text: 'Equipment Usage Log', correctCategory: 'documentation' },
      { id: 'granulation-process', text: 'Granulation Process', correctCategory: 'production' }
    ]
  }
];


export const getGameModesByModule = (moduleId: number): GameMode[] => {
  return gameModes.filter(mode => mode.moduleId === moduleId);
};