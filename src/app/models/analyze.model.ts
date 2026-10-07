export interface FrameData {
  i: number;
  t: number;
  ok: boolean;
  /** 12 pares [x, y] normalizados 0-1, en el orden de landmark_names */
  p: number[][];
  angle: number;
}

export interface ShotFrames {
  start: number;
  set: number;
  release: number;
  prep: number;
  peak: number;
}

export interface ShotTimesS {
  set: number;
  release: number;
}

export interface Shot {
  n: number;
  value: number;
  score: number;
  verdict: 'bueno' | 'dudoso' | 'malo';
  has_pause: boolean;
  pause_s: number;
  frames: ShotFrames;
  times_s: ShotTimesS;
  frame_url: string | null;
  clip_url: string | null;
}

export interface Summary {
  n: number;
  mean: number;
  score: number;
  sd: number | null;
  n_bueno: number;
  n_dudoso: number;
  n_malo: number;
  pct_bueno: number;
  pct_pausa: number;
}

export interface Rule {
  feature: string;
  direction: string;
  t: number;
  band: number;
  good_mean: number;
  good_sd: number;
  bad_mean: number;
  bad_sd: number;
  angle_name: string;
  unit: string;
}

export interface VideoMeta {
  url: string;
  width: number;
  height: number;
  fps: number;
  n_frames: number;
  duration_s: number;
  available: boolean;
}

export interface Quality {
  detection_rate: number;
  note: string | null;
  warnings: string[];
}

export interface AnalysisConfig {
  arm: 'right' | 'left';
  camera: string;
  focus: string;
  goal: string | null;
}

export interface AnalysisResult {
  analysis_id: string;
  created_at: string;
  status?: string;
  config: AnalysisConfig;
  video: VideoMeta;
  quality: Quality;
  rule: Rule;
  shots: Shot[];
  summary: Summary;
  landmark_names: string[];
  frames: FrameData[];
}
