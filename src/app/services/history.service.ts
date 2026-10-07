import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HistoryEntry } from '../models/history.model';
import { AnalysisResult } from '../models/analyze.model';
import { AppStateService } from '../state/app-state.service';
import mockHistory from '../mocks/fixtures/history.mock.json';
import mockResult  from '../mocks/fixtures/analyze-result.mock.json';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private http  = inject(HttpClient);
  private state = inject(AppStateService);
  private base  = environment.apiBaseUrl;

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'X-User-Id': this.state.getUserId() });
  }

  /** GET /history */
  getHistory(): Observable<HistoryEntry[]> {
    return this.http
      .get<HistoryEntry[]>(`${this.base}/history`, { headers: this.headers })
      .pipe(
        catchError(err => {
          console.error('[HistoryService] getHistory failed, using mock', err);
          return of(mockHistory as unknown as HistoryEntry[]);
        })
      );
  }

  /** GET /history/{id} */
  getById(id: string): Observable<AnalysisResult> {
    if (id.startsWith('mock')) {
      return of(mockResult as unknown as AnalysisResult);
    }
    return this.http
      .get<AnalysisResult>(`${this.base}/history/${id}`, { headers: this.headers })
      .pipe(
        catchError(err => {
          console.error('[HistoryService] getById failed, using mock', err);
          return of(mockResult as unknown as AnalysisResult);
        })
      );
  }
}
