// ─── Types ───────────────────────────────────────────────────────────────────

export type PriceStrategy = 'competitive' | 'balanced' | 'premium';

export interface PriceRange {
  low: number;
  median: number;
  high: number;
}

export interface WizardItem {
  title: string;
  description: string;
  brand: string;
  category: string;
  size: string;
  condition: string;
  color: string;
  source_url: string;
  originalPhotos: string[];
  enhancedPhotos: (string | null)[];
  optimisedTitle: string;
  optimisedDescription: string;
  hashtags: string[];
  suggestedPrice: number | null;
  priceRange: PriceRange | null;
  priceStrategy: PriceStrategy;
  chosenPrice: number | null;
}

export interface SellWizardState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  completedSteps: number[];
  direction: 1 | -1;
  item: WizardItem;
  isImporting: boolean;
  isProcessingPhotos: boolean;
  isOptimising: boolean;
  isPricing: boolean;
  isSaving: boolean;
  firstItemFree: boolean;
  error: string | null;
  savedListingId: string | null;
}

// ─── Action Types ─────────────────────────────────────────────────────────────

export type SellWizardAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_ITEM_DATA'; payload: Partial<WizardItem> }
  | { type: 'ADD_ORIGINAL_PHOTO'; url: string }
  | { type: 'REMOVE_ORIGINAL_PHOTO'; index: number }
  | { type: 'SET_ENHANCED_PHOTO'; index: number; url: string }
  | { type: 'SET_IMPORT_LOADING'; loading: boolean }
  | { type: 'SET_PROCESSING_PHOTOS'; loading: boolean }
  | { type: 'SET_OPTIMISING'; loading: boolean }
  | { type: 'SET_OPTIMISED_DATA'; title: string; description: string; hashtags: string[] }
  | { type: 'TOGGLE_HASHTAG'; tag: string }
  | { type: 'SET_PRICING'; loading: boolean }
  | { type: 'SET_PRICE_DATA'; priceRange: PriceRange; suggestedPrice: number }
  | { type: 'SET_PRICE_STRATEGY'; strategy: PriceStrategy }
  | { type: 'SET_CHOSEN_PRICE'; price: number }
  | { type: 'SET_SAVING'; loading: boolean }
  | { type: 'SET_SAVED'; listingId: string }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET' };

// ─── Initial State ────────────────────────────────────────────────────────────

const defaultItem: WizardItem = {
  title: '',
  description: '',
  brand: '',
  category: '',
  size: '',
  condition: '',
  color: '',
  source_url: '',
  originalPhotos: [],
  enhancedPhotos: [],
  optimisedTitle: '',
  optimisedDescription: '',
  hashtags: [],
  suggestedPrice: null,
  priceRange: null,
  priceStrategy: 'balanced',
  chosenPrice: null,
};

export const initialWizardState: SellWizardState = {
  currentStep: 1,
  completedSteps: [],
  direction: 1,
  item: defaultItem,
  isImporting: false,
  isProcessingPhotos: false,
  isOptimising: false,
  isPricing: false,
  isSaving: false,
  firstItemFree: true, // hardcoded for Phase 4
  error: null,
  savedListingId: null,
};

// ─── Session Recovery ─────────────────────────────────────────────────────────

const SESSION_KEY = 'vintifi_sell_wizard_v2';

export function sessionRecoveryInit(initial: SellWizardState): SellWizardState {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as SellWizardState;
    // Reset transient loading states on recovery
    return {
      ...parsed,
      isImporting: false,
      isProcessingPhotos: false,
      isOptimising: false,
      isPricing: false,
      isSaving: false,
    };
  } catch {
    return initial;
  }
}

export function saveWizardSession(state: SellWizardState): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded — ignore
  }
}

export function clearWizardSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function sellWizardReducer(
  state: SellWizardState,
  action: SellWizardAction
): SellWizardState {
  switch (action.type) {
    case 'NEXT_STEP': {
      if (state.currentStep >= 5) return state;
      const next = (state.currentStep + 1) as SellWizardState['currentStep'];
      return {
        ...state,
        currentStep: next,
        direction: 1,
        completedSteps: Array.from(new Set([...state.completedSteps, state.currentStep])),
      };
    }
    case 'PREV_STEP': {
      if (state.currentStep <= 1) return state;
      const prev = (state.currentStep - 1) as SellWizardState['currentStep'];
      return { ...state, currentStep: prev, direction: -1 };
    }
    case 'SET_ITEM_DATA': {
      const newPhotos = action.payload.originalPhotos ?? state.item.originalPhotos;
      const enhancedPhotos = action.payload.originalPhotos
        ? new Array(action.payload.originalPhotos.length).fill(null)
        : state.item.enhancedPhotos;
      return {
        ...state,
        item: { ...state.item, ...action.payload, enhancedPhotos },
      };
    }
    case 'ADD_ORIGINAL_PHOTO': {
      if (state.item.originalPhotos.length >= 10) return state;
      return {
        ...state,
        item: {
          ...state.item,
          originalPhotos: [...state.item.originalPhotos, action.url],
          enhancedPhotos: [...state.item.enhancedPhotos, null],
        },
      };
    }
    case 'REMOVE_ORIGINAL_PHOTO': {
      const originals = [...state.item.originalPhotos];
      const enhanced = [...state.item.enhancedPhotos];
      originals.splice(action.index, 1);
      enhanced.splice(action.index, 1);
      return {
        ...state,
        item: { ...state.item, originalPhotos: originals, enhancedPhotos: enhanced },
      };
    }
    case 'SET_ENHANCED_PHOTO': {
      const enhanced = [...state.item.enhancedPhotos];
      while (enhanced.length <= action.index) enhanced.push(null);
      enhanced[action.index] = action.url;
      return { ...state, item: { ...state.item, enhancedPhotos: enhanced } };
    }
    case 'SET_IMPORT_LOADING':
      return { ...state, isImporting: action.loading };
    case 'SET_PROCESSING_PHOTOS':
      return { ...state, isProcessingPhotos: action.loading };
    case 'SET_OPTIMISING':
      return { ...state, isOptimising: action.loading };
    case 'SET_OPTIMISED_DATA':
      return {
        ...state,
        item: {
          ...state.item,
          optimisedTitle: action.title,
          optimisedDescription: action.description,
          hashtags: action.hashtags,
        },
      };
    case 'TOGGLE_HASHTAG': {
      const tags = state.item.hashtags.includes(action.tag)
        ? state.item.hashtags.filter(t => t !== action.tag)
        : [...state.item.hashtags, action.tag];
      return { ...state, item: { ...state.item, hashtags: tags } };
    }
    case 'SET_PRICING':
      return { ...state, isPricing: action.loading };
    case 'SET_PRICE_DATA': {
      const strategyPrice =
        state.item.priceStrategy === 'competitive' ? action.priceRange.low
        : state.item.priceStrategy === 'premium' ? action.priceRange.high
        : action.priceRange.median;
      return {
        ...state,
        item: {
          ...state.item,
          priceRange: action.priceRange,
          suggestedPrice: action.suggestedPrice,
          chosenPrice: strategyPrice,
        },
      };
    }
    case 'SET_PRICE_STRATEGY': {
      const range = state.item.priceRange;
      const price = range
        ? action.strategy === 'competitive' ? range.low
          : action.strategy === 'premium' ? range.high
          : range.median
        : state.item.chosenPrice;
      return {
        ...state,
        item: { ...state.item, priceStrategy: action.strategy, chosenPrice: price },
      };
    }
    case 'SET_CHOSEN_PRICE':
      return { ...state, item: { ...state.item, chosenPrice: action.price } };
    case 'SET_SAVING':
      return { ...state, isSaving: action.loading };
    case 'SET_SAVED':
      return { ...state, isSaving: false, savedListingId: action.listingId };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'RESET':
      return { ...initialWizardState };
    default:
      return state;
  }
}
