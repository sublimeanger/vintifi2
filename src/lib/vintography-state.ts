// ── Types ─────────────────────────────────────────────────────────────────

export type Operation =
  | 'clean_bg'
  | 'lifestyle_bg'
  | 'enhance'
  | 'decrease'
  | 'flatlay'
  | 'mannequin'
  | 'steam'
  | 'ai_model';

export interface OperationParams {
  // clean_bg / lifestyle_bg / enhance / decrease — no params
  // steam
  intensity?: 'light' | 'steam' | 'deep';
  // flatlay
  style?: string;
  // lifestyle_bg
  scene?: string;
  // mannequin
  mannequinType?: string;
  lighting?: string;
  background?: string;
  // ai_model
  gender?: string;
  look?: string;
  pose?: string;
  modelBackground?: string;
  fullGarment?: boolean;
  description?: string;
}

export interface PipelineStep {
  id: string;
  operation: Operation;
  params: OperationParams;
}

export type CanvasState = 'original' | 'processing' | 'result';

export interface VintographyState {
  originalPhotoUrl: string | null;
  resultPhotoUrl: string | null;
  canvasState: CanvasState;
  pipeline: PipelineStep[];
  activeStepId: string | null;
  drawerOpen: boolean;
  isProcessing: boolean;
  processingStepIndex: number;
  error: string | null;
  modelWizardStep: number; // 1, 2, or 3
  upgradeModalOpen: boolean;
}

// ── Action Types ──────────────────────────────────────────────────────────

export type VintographyAction =
  | { type: 'SET_PHOTO'; url: string }
  | { type: 'CLEAR_PHOTO' }
  | { type: 'SELECT_OPERATION'; operation: Operation }
  | { type: 'DESELECT_OPERATION' }
  | { type: 'ADD_PIPELINE_STEP'; operation: Operation }
  | { type: 'REMOVE_PIPELINE_STEP'; id: string }
  | { type: 'SET_ACTIVE_STEP'; id: string }
  | { type: 'UPDATE_STEP_PARAMS'; id: string; params: Partial<OperationParams> }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'START_PROCESSING' }
  | { type: 'PROCESSING_STEP_COMPLETE'; stepIndex: number; imageUrl: string }
  | { type: 'PROCESSING_COMPLETE'; imageUrl: string }
  | { type: 'PROCESSING_ERROR'; error: string }
  | { type: 'SET_MODEL_WIZARD_STEP'; step: number }
  | { type: 'RESET' }
  | { type: 'OPEN_UPGRADE_MODAL' }
  | { type: 'CLOSE_UPGRADE_MODAL' };

// ── Initial State ─────────────────────────────────────────────────────────

export const initialState: VintographyState = {
  originalPhotoUrl: null,
  resultPhotoUrl: null,
  canvasState: 'original',
  pipeline: [],
  activeStepId: null,
  drawerOpen: false,
  isProcessing: false,
  processingStepIndex: 0,
  error: null,
  modelWizardStep: 1,
  upgradeModalOpen: false,
};

// ── Reducer ───────────────────────────────────────────────────────────────

export function vintographyReducer(
  state: VintographyState,
  action: VintographyAction
): VintographyState {
  switch (action.type) {
    case 'SET_PHOTO':
      return {
        ...initialState,
        originalPhotoUrl: action.url,
        canvasState: 'original',
      };

    case 'CLEAR_PHOTO':
      return { ...initialState };

    case 'SELECT_OPERATION': {
      const newStep: PipelineStep = {
        id: `${action.operation}-${Date.now()}`,
        operation: action.operation,
        params: getDefaultParams(action.operation),
      };
      // If no steps, add it; if step already exists do nothing (let ADD handle it)
      const alreadyInPipeline = state.pipeline.some(s => s.operation === action.operation);
      if (alreadyInPipeline) {
        // Just open drawer for existing step
        const existing = state.pipeline.find(s => s.operation === action.operation)!;
        return {
          ...state,
          activeStepId: existing.id,
          drawerOpen: true,
          modelWizardStep: 1,
        };
      }
      return {
        ...state,
        pipeline: [...state.pipeline, newStep],
        activeStepId: newStep.id,
        drawerOpen: true,
        modelWizardStep: 1,
      };
    }

    case 'DESELECT_OPERATION':
      return { ...state, activeStepId: null, drawerOpen: false };

    case 'ADD_PIPELINE_STEP': {
      const newStep: PipelineStep = {
        id: `${action.operation}-${Date.now()}`,
        operation: action.operation,
        params: getDefaultParams(action.operation),
      };
      return {
        ...state,
        pipeline: [...state.pipeline, newStep],
        activeStepId: newStep.id,
        drawerOpen: true,
      };
    }

    case 'REMOVE_PIPELINE_STEP': {
      const newPipeline = state.pipeline.filter(s => s.id !== action.id);
      const newActiveId =
        state.activeStepId === action.id
          ? (newPipeline[newPipeline.length - 1]?.id ?? null)
          : state.activeStepId;
      return {
        ...state,
        pipeline: newPipeline,
        activeStepId: newActiveId,
        drawerOpen: newActiveId !== null && state.drawerOpen,
      };
    }

    case 'SET_ACTIVE_STEP':
      return { ...state, activeStepId: action.id, drawerOpen: true };

    case 'UPDATE_STEP_PARAMS':
      return {
        ...state,
        pipeline: state.pipeline.map(s =>
          s.id === action.id ? { ...s, params: { ...s.params, ...action.params } } : s
        ),
      };

    case 'OPEN_DRAWER':
      return { ...state, drawerOpen: true };

    case 'CLOSE_DRAWER':
      return { ...state, drawerOpen: false };

    case 'START_PROCESSING':
      return {
        ...state,
        isProcessing: true,
        processingStepIndex: 0,
        canvasState: 'processing',
        error: null,
      };

    case 'PROCESSING_STEP_COMPLETE':
      return {
        ...state,
        processingStepIndex: action.stepIndex + 1,
      };

    case 'PROCESSING_COMPLETE':
      return {
        ...state,
        isProcessing: false,
        canvasState: 'result',
        resultPhotoUrl: action.imageUrl,
        drawerOpen: false,
      };

    case 'PROCESSING_ERROR':
      return {
        ...state,
        isProcessing: false,
        canvasState: 'original',
        error: action.error,
      };

    case 'SET_MODEL_WIZARD_STEP':
      return { ...state, modelWizardStep: action.step };

    case 'RESET':
      return {
        ...initialState,
        originalPhotoUrl: state.originalPhotoUrl,
        canvasState: 'original',
      };

    case 'OPEN_UPGRADE_MODAL':
      return { ...state, upgradeModalOpen: true };

    case 'CLOSE_UPGRADE_MODAL':
      return { ...state, upgradeModalOpen: false };

    default:
      return state;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

export function getDefaultParams(operation: Operation): OperationParams {
  switch (operation) {
    case 'steam':
      return { intensity: 'steam' };
    case 'flatlay':
      return { style: 'clean_white' };
    case 'lifestyle_bg':
      return { scene: 'living_room' };
    case 'mannequin':
      return { mannequinType: 'invisible', lighting: 'natural', background: 'white' };
    case 'ai_model':
      return {
        gender: 'woman',
        look: '1',
        pose: 'standing',
        modelBackground: 'studio_white',
        fullGarment: true,
        description: '',
      };
    default:
      return {};
  }
}

export function getOperationCredits(operation: Operation): number {
  return operation === 'ai_model' ? 4 : 1;
}

export function getPipelineCredits(pipeline: PipelineStep[]): number {
  return pipeline.reduce((sum, step) => sum + getOperationCredits(step.operation), 0);
}

// Operations that can follow ai_model in a chain
export const AI_MODEL_CHAIN_ALLOWED: Operation[] = ['enhance', 'decrease'];

// Tier gating
export const PRO_OPERATIONS: Operation[] = ['flatlay', 'mannequin', 'steam'];
export const BUSINESS_OPERATIONS: Operation[] = ['ai_model'];

export type UserTier = 'free' | 'pro' | 'business';

export function isOperationLocked(operation: Operation, tier: UserTier): boolean {
  if (BUSINESS_OPERATIONS.includes(operation)) return tier !== 'business';
  if (PRO_OPERATIONS.includes(operation)) return tier === 'free';
  return false;
}
