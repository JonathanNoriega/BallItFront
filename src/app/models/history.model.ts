export interface HistoryEntry {
  analysis_id: string;
  created_at: string;
  config: {
    arm: 'right' | 'left';
    camera: string;
    focus: string;
  };
  summary: {
    n: number;
    mean: number;
    score: number;
    n_bueno: number;
    n_dudoso: number;
    n_malo: number;
  };
  frame_url?: string | null;
}
