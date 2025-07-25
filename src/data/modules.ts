import type { Module } from '../types/module';

export const modules: Module[] = [
  { id: 1, status: 'available', title: 'Introduction to GMP', progress: 0 },
  { id: 2, status: 'available', title: 'Personal Hygiene' },
  { id: 3, status: 'locked', title: 'Cleaning Validation' },
  { id: 4, status: 'locked', title: 'Documentation' },
  { id: 5, status: 'locked', title: 'Equipment Maintenance' },
  { id: 6, status: 'locked', title: 'Quality Control' },
  { id: 7, status: 'locked', title: 'Environmental Monitoring' },
  { id: 8, status: 'locked', title: 'Change Control' },
  { id: 9, status: 'locked', title: 'Deviation Management' },
  { id: 10, status: 'locked', title: 'Risk Assessment' },
  { id: 11, status: 'locked', title: 'Regulatory Compliance' },
  { id: 12, status: 'locked', title: 'Final Assessment' },
];