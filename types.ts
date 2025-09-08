
export interface CameraPlacement {
  location: string;
  reason: string;
  cameraType: string;
  coordinates: {
    x: number;
    y: number;
  };
}

export interface SecurityAnalysis {
  overview: string;
  placements: CameraPlacement[];
}

export enum AnalysisStep {
  INPUT,
  FETCHING_IMAGE,
  AWAITING_ANALYSIS,
  ANALYZING,
  COMPLETE,
  ERROR
}