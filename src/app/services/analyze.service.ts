import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, from, of } from 'rxjs';
import { switchMap, filter, take, timeout, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AnalysisResult } from '../models/analyze.model';
import { AppStateService } from '../state/app-state.service';
import { SessionConfig } from '../state/session-config.service';
import mockResult from '../mocks/fixtures/analyze-result.mock.json';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS  = 180_000; // 3 minutos

/**
 * Shape real de la respuesta de GET /analyze/{id} del backend BallItMVP.
 * El resultado está ANIDADO en response.result, no en la raíz.
 */
export interface PollResponse {
  status: 'processing' | 'done' | 'error';
  progress: number;   // 0.0 - 1.0
  step: string;       // texto descriptivo del paso actual
  result?: AnalysisResult;
  error?: { message: string };
}

@Injectable({ providedIn: 'root' })
export class AnalyzeService {
  private http  = inject(HttpClient);
  private state = inject(AppStateService);
  private base  = environment.apiBaseUrl;

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'X-User-Id': this.state.getUserId() });
  }

  /** POST /analyze — sube el video e inicia el análisis. Responde 202: { analysis_id } */
  postAnalyze(file: File, config: SessionConfig): Observable<{ analysis_id: string }> {
    const form = new FormData();
    form.append('video', file);
    form.append('arm', config.arm);
    form.append('camera', config.camera);
    form.append('focus', config.focus);
    if (config.goal) form.append('goal', config.goal);

    return this.http
      .post<{ analysis_id: string }>(`${this.base}/analyze`, form, { headers: this.headers })
      .pipe(
        catchError(err => {
          console.error('[AnalyzeService] postAnalyze failed, usando mock', err);
          return of({ analysis_id: 'mock-analysis-001' });
        })
      );
  }

  /**
   * Polling hasta status=done. Emite solo el AnalysisResult final.
   * El backend devuelve: { status, progress, step, result? }
   * El AnalysisResult real está en response.result (no en la raíz).
   */
  pollResult(id: string): Observable<AnalysisResult> {
    if (id.startsWith('mock')) {
      return of(mockResult as unknown as AnalysisResult);
    }

    return timer(0, POLL_INTERVAL_MS).pipe(
      switchMap(() =>
        this.http
          .get<PollResponse>(`${this.base}/analyze/${id}`, { headers: this.headers })
          .pipe(catchError(() => of(null)))
      ),
      filter((res): res is PollResponse =>
        res !== null && res.status === 'done' && res.result != null
      ),
      take(1),
      map(res => res.result!),
      timeout({
        each: POLL_TIMEOUT_MS,
        with: () => from(Promise.resolve(mockResult as unknown as AnalysisResult))
      }),
      catchError(err => {
        console.error('[AnalyzeService] pollResult timeout/error, usando mock', err);
        return of(mockResult as unknown as AnalysisResult);
      })
    );
  }

  /**
   * Polling que emite CADA respuesta intermedia (para mostrar progreso real).
   * Úsalo en la pantalla de Procesando.
   */
  pollProgress(id: string): Observable<PollResponse> {
    if (id.startsWith('mock')) {
      return of({
        status: 'done' as const,
        progress: 1,
        step: 'Listo',
        result: mockResult as unknown as AnalysisResult
      });
    }
    return timer(0, POLL_INTERVAL_MS).pipe(
      switchMap(() =>
        this.http
          .get<PollResponse>(`${this.base}/analyze/${id}`, { headers: this.headers })
          .pipe(
            catchError(() => of<PollResponse>({
              status: 'processing',
              progress: 0,
              step: 'Conectando con el servidor...'
            }))
          )
      )
    );
  }

  /**
   * Descarga un archivo de /files/... como blob y devuelve un object URL.
   * NECESARIO porque el backend exige el header X-User-Id en esas rutas,
   * y los tags <video>/<img> no pueden enviar headers.
   * Recuerda llamar URL.revokeObjectURL(url) cuando ya no se use.
   */
  mediaUrl(path: string): Observable<string> {
    if (!path) return of('');
    // Rutas mock o ya absolutas (data:/blob:) se devuelven tal cual
    if (path.startsWith('data:') || path.startsWith('blob:')) return of(path);
    if (path.startsWith('/assets')) return of(path);

    const fullUrl = path.startsWith('http') ? path : `${this.base}${path}`;
    return this.http
      .get(fullUrl, { headers: this.headers, responseType: 'blob' })
      .pipe(
        map(blob => URL.createObjectURL(blob)),
        catchError(err => {
          console.error('[AnalyzeService] mediaUrl failed', err);
          return of('');
        })
      );
  }

  /**
   * Carga el resultado completo de un análisis ya terminado.
   * Primero intenta /history/{id} (devuelve AnalysisResult directo),
   * luego /analyze/{id} (devuelve { status, result }).
   */
  getResult(id: string): Observable<AnalysisResult> {
    if (id.startsWith('mock')) {
      return of(mockResult as unknown as AnalysisResult);
    }

    return this.http
      .get<AnalysisResult>(`${this.base}/history/${id}`, { headers: this.headers })
      .pipe(
        catchError(() =>
          this.http
            .get<PollResponse>(`${this.base}/analyze/${id}`, { headers: this.headers })
            .pipe(
              map(res => res.result ?? (res as unknown as AnalysisResult)),
              catchError(err => {
                console.error('[AnalyzeService] getResult failed, usando mock', err);
                return of(mockResult as unknown as AnalysisResult);
              })
            )
        )
      );
  }
}
