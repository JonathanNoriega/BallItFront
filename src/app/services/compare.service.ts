import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CompareResult } from '../models/compare.model';
import { AppStateService } from '../state/app-state.service';
import mockCompare from '../mocks/fixtures/compare.mock.json';

@Injectable({ providedIn: 'root' })
export class CompareService {
  private http  = inject(HttpClient);
  private state = inject(AppStateService);
  private base  = environment.apiBaseUrl;

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'X-User-Id': this.state.getUserId() });
  }

  /** POST /compare */
  compare(idA: string, idB: string): Observable<CompareResult> {
    if (idA.startsWith('mock') || idB.startsWith('mock')) {
      return of(mockCompare as unknown as CompareResult);
    }
    return this.http
      .post<CompareResult>(`${this.base}/compare`, { id_a: idA, id_b: idB }, { headers: this.headers })
      .pipe(
        catchError(err => {
          console.error('[CompareService] compare failed, using mock', err);
          return of(mockCompare as unknown as CompareResult);
        })
      );
  }
}
