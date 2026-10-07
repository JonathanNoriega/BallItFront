import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HistoryEntry } from '../models/history.model';
import { AnalysisResult } from '../models/analyze.model';
import { computeStreak } from '../lib/streak';

const STORAGE_KEY_USER  = 'ballIt_userId';
const STORAGE_KEY_HIST  = 'ballIt_history';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private readonly userId: string = this.initUserId();

  private history$         = new BehaviorSubject<HistoryEntry[]>([]);
  private streak$          = new BehaviorSubject<number>(0);
  private currentAnalysis$ = new BehaviorSubject<AnalysisResult | null>(null);

  readonly history         = this.history$.asObservable();
  readonly streak          = this.streak$.asObservable();
  readonly currentAnalysis = this.currentAnalysis$.asObservable();

  constructor() {
    this.loadHistory();
  }

  getUserId(): string {
    return this.userId;
  }

  loadHistory(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HIST);
      if (raw) {
        const entries: HistoryEntry[] = JSON.parse(raw);
        this.history$.next(entries);
        this.streak$.next(computeStreak(entries));
      }
    } catch {
      // localStorage no disponible o dato corrupto — ignorar
    }
  }

  addToHistory(entry: HistoryEntry): void {
    const current = this.history$.value;
    // evitar duplicados
    const updated = [entry, ...current.filter(h => h.analysis_id !== entry.analysis_id)];
    try {
      localStorage.setItem(STORAGE_KEY_HIST, JSON.stringify(updated));
    } catch { /* quota exceeded — ignorar */ }
    this.history$.next(updated);
    this.streak$.next(computeStreak(updated));
  }

  setCurrentAnalysis(result: AnalysisResult | null): void {
    this.currentAnalysis$.next(result);
  }

  getStreakSnapshot(): number {
    return this.streak$.value;
  }

  getHistorySnapshot(): HistoryEntry[] {
    return this.history$.value;
  }

  private initUserId(): string {
    try {
      let id = localStorage.getItem(STORAGE_KEY_USER);
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY_USER, id);
      }
      return id;
    } catch {
      return crypto.randomUUID();
    }
  }
}
