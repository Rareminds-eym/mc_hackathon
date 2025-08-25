export interface StageData {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  accent: string;
  description: string;
  caseNumber: number;
  isOptional?: boolean;
}

export interface StageFormData {
  ideaStatement: string;
  problem: string;
  technology: string;
  collaboration: string;
  creativity: string;
  speedScale: string;
  impact: string;
  reflection: string;
  file: File | null;
  finalProblem: string;
  finalTechnology: string;
  finalCollaboration: string;
  finalCreativity: string;
  finalSpeedScale: string;
  finalImpact: string;
}

export interface HeaderProps {
  currentStageData: StageData;
  isMobileHorizontal: boolean;
  selectedCase?: { email: string; case_id: number; updated_at: string } | null;
  onShowBrief?: () => void;
  progress?: number;
  timerStopped?: boolean;
  savedTimer?: number | null;
  onTimerTick?: (remainingTime: number) => void;
  onTimerTimeUp?: () => void;
}

export interface ProgressTrackProps {
  stages: StageData[];
  currentStage: number;
  isStageComplete: (stageNum: number) => boolean;
  onStageClick: (stageNumber: number) => void;
  progress: number;
  isMobileHorizontal: boolean;
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
}

export interface StageContentProps {
  stage: number;
  formData: StageFormData;
  onFormDataChange: (field: keyof StageFormData, value: string | File | null) => void;
  isMobileHorizontal: boolean;
  isAnimating: boolean;
  prototypeStageRef?: React.RefObject<any>;
}

export interface NavigationBarProps {
  stage: number;
  canProceed: boolean;
  currentStageData: StageData;
  isMobileHorizontal: boolean;
  onProceed: () => void;
}

export interface ConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export interface StageProps {
  formData: StageFormData;
  onFormDataChange: (field: keyof StageFormData, value: string | File | null) => void;
  isMobileHorizontal: boolean;
}
