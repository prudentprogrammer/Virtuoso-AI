export interface MediaFile {
  id: string;
  file: File | null;
  previewUrl: string | null;
  type: 'video' | 'audio';
  source: 'upload' | 'record';
}

export interface AnalysisResult {
  markdown: string;
  timestamp: number;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface AnalysisRequest {
  teacherMedia: MediaFile;
  studentMedia: MediaFile;
  context: string;
}
