import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./index";
import {
  useLevel3Progress,
  useLevel3Game,
  useLevel3UI,
  useLevel3GameActions,
  useLevel3ManualSave,
  useLevel3SaveStatus,
  useLevel3Persistence
} from "./hooks/index";

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Re-export for convenience
export {
  useDispatch,
  useSelector,
  useLevel3Progress,
  useLevel3Game,
  useLevel3UI,
  useLevel3GameActions,
  useLevel3ManualSave,
  useLevel3SaveStatus,
  useLevel3Persistence,
};
