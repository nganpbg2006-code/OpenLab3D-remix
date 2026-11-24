import React from 'react';
import {
  AssetDefinition,
  ExperimentDefinition,
  SceneInstance,
} from '../../domain/types';

export type StudentGuidedStepNumber = 1 | 2 | 3 | 4 | 5;

export interface StudentGuidedStepPanelProps {
  experiments: ExperimentDefinition[];
  activeExperiment: ExperimentDefinition;
  guidedStep: StudentGuidedStepNumber;
  selectedAsset: AssetDefinition | null;
  selectedInstance: SceneInstance | null;
  sceneInstances: SceneInstance[];
  assetsMap: Map<string, AssetDefinition>;
  isExploreOnlyMode?: boolean;
  isDarkMode?: boolean;
  onHideGuide?: () => void;
  onSelectExperiment: (experimentId: string) => void;
  onChangeGuidedStep: (step: StudentGuidedStepNumber) => void;
  onSelectAssetById: (assetId: string) => void;
  onAddAssetToTable: (assetId: string) => void;
  onPlaceAllRequiredForExperiment: () => void;
  onUpdateInstanceState: (
    instanceId: string,
    patch: Partial<SceneInstance['instanceState']>,
  ) => void;
  onDeleteInstance: (instanceId: string) => void;
  onResetLabTable: () => void;
  onOpenAssetDetailModal: (asset: AssetDefinition) => void;
  onSwitchFromExploreToLab: () => void;
  onOpenVideoGuide?: () => void;
}

/**
 * Khung Hướng dẫn (Guide Panel) bên phải đã được gỡ bỏ hoàn toàn
 * để giải phóng 100% không gian chiều rộng cho bàn thí nghiệm 3D.
 */
export const StudentGuidedStepPanel: React.FC<
  StudentGuidedStepPanelProps
> = () => {
  return null;
};

