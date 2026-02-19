import type { VintographyState, VintographyAction, Operation } from "@/lib/vintography-state";
import { SimpleConfig } from "./configs/SimpleConfig";
import { SteamConfig } from "./configs/SteamConfig";
import { FlatLayConfig } from "./configs/FlatLayConfig";
import { LifestyleConfig } from "./configs/LifestyleConfig";
import { MannequinConfig } from "./configs/MannequinConfig";
import { ModelShotWizard } from "./configs/ModelShotWizard";

interface OperationConfigProps {
  state: VintographyState;
  dispatch: React.Dispatch<VintographyAction>;
}

export function OperationConfig({ state, dispatch }: OperationConfigProps) {
  const activeStep = state.pipeline.find(s => s.id === state.activeStepId);
  if (!activeStep) return null;

  const { operation, params } = activeStep;

  function onChange(partial: Partial<typeof params>) {
    dispatch({ type: 'UPDATE_STEP_PARAMS', id: activeStep!.id, params: partial });
  }

  switch (operation) {
    case 'clean_bg':
    case 'enhance':
      return <SimpleConfig operation={operation} />;
    case 'decrease':
      return <SteamConfig params={params} onChange={onChange} />;
    case 'steam':
      return <SteamConfig params={params} onChange={onChange} />;
    case 'flatlay':
      return <FlatLayConfig params={params} onChange={onChange} />;
    case 'lifestyle_bg':
      return <LifestyleConfig params={params} onChange={onChange} />;
    case 'mannequin':
      return <MannequinConfig params={params} onChange={onChange} />;
    case 'ai_model':
      return (
        <ModelShotWizard
          params={params}
          onChange={onChange}
          wizardStep={state.modelWizardStep}
          onWizardStep={step => dispatch({ type: 'SET_MODEL_WIZARD_STEP', step })}
        />
      );
    default:
      return null;
  }
}
