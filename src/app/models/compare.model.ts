import { Shot, Summary } from './analyze.model';

export interface CompareResult {
  id_a: string;
  id_b: string;
  delta_score: number;
  delta_mean: number;
  verdict: string;
  shots_a: Shot[];
  shots_b: Shot[];
  summary_a: Summary;
  summary_b: Summary;
}
