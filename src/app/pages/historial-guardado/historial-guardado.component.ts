import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HistoryService } from '../../services/history.service';
import { AppStateService } from '../../state/app-state.service';
import { HistoryEntry } from '../../models/history.model';
import { ActionBarComponent } from '../../components/action-bar/action-bar.component';
import { VerdictChipComponent } from '../../components/verdict-chip/verdict-chip.component';
import { getScoreColor, getScoreLabel } from '../../lib/score';

@Component({
  selector: 'app-historial-guardado',
  standalone: true,
  imports: [CommonModule, ActionBarComponent, VerdictChipComponent],
  template: `
    <div class="page">
      <div class="header">
        <button class="back-btn" (click)="router.navigate(['/'])">‹</button>
        <h1>Mis entrenamientos</h1>
      </div>

      @if (loading) {
        <div class="loading-row"><div class="spinner"></div></div>
      } @else if (entries.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🏀</div>
          <h2>Aún no tienes entrenamientos</h2>
          <p>Analiza tu primer tiro y empieza a ver tu progreso.</p>
        </div>
      } @else {
        <div class="list">
          @for (entry of entries; track entry.analysis_id) {
            <div class="entry-card" (click)="openEntry(entry)">
              <div class="entry-left">
                <div class="entry-date">{{ entry.created_at | date:'dd MMM yyyy':'':'es' }}</div>
                <div class="entry-time">{{ entry.created_at | date:'HH:mm':'':'es' }}</div>
                <div class="chips-row">
                  @if (entry.summary.n_bueno > 0) {
                    <span class="mini-chip bueno">🟢 {{ entry.summary.n_bueno }}</span>
                  }
                  @if (entry.summary.n_dudoso > 0) {
                    <span class="mini-chip dudoso">🟡 {{ entry.summary.n_dudoso }}</span>
                  }
                  @if (entry.summary.n_malo > 0) {
                    <span class="mini-chip malo">🔴 {{ entry.summary.n_malo }}</span>
                  }
                </div>
              </div>
              <div class="entry-right">
                <span class="entry-score" [style.color]="getScoreColor(entry.summary.score)">
                  {{ entry.summary.score }}
                </span>
                <span class="entry-score-label">{{ getScoreLabel(entry.summary.score) }}</span>
              </div>
              <span class="entry-arrow">›</span>
            </div>
          }
        </div>
      }

      <div class="pb-bar"></div>
    </div>

    <app-action-bar
      primaryLabel="Nueva sesión"
      (primaryClick)="router.navigate(['/configuracion'])">
    </app-action-bar>
  `,
  styles: [`
    .page { padding: 0 20px 100px; background: #FAFAF7; min-height: 100vh; }
    .header { display: flex; align-items: center; gap: 12px; padding: 20px 0 20px; }
    .back-btn { background: none; border: none; font-size: 28px; color: #1B2B4B; cursor: pointer; padding: 0; }
    h1 { font-size: 22px; font-weight: 800; color: #1B2B4B; margin: 0; }
    .loading-row { display: flex; justify-content: center; padding: 40px; }
    .spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #FF5A1F; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg)} }
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 56px; margin-bottom: 16px; }
    .empty-state h2 { font-size: 20px; font-weight: 800; color: #1B2B4B; margin: 0 0 8px; }
    .empty-state p { font-size: 14px; color: #6b7280; margin: 0; }
    .list { display: flex; flex-direction: column; gap: 10px; }
    .entry-card {
      background: white; border-radius: 14px; padding: 16px 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      display: flex; align-items: center; gap: 12px; cursor: pointer;
      transition: box-shadow 0.15s;
    }
    .entry-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.10); }
    .entry-left { flex: 1; }
    .entry-date { font-size: 15px; font-weight: 700; color: #1B2B4B; }
    .entry-time { font-size: 12px; color: #9ca3af; margin-bottom: 6px; }
    .chips-row { display: flex; gap: 6px; }
    .mini-chip { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
    .mini-chip.bueno  { background: #dcfce7; color: #15803d; }
    .mini-chip.dudoso { background: #fef9c3; color: #a16207; }
    .mini-chip.malo   { background: #fee2e2; color: #b91c1c; }
    .entry-right { text-align: right; }
    .entry-score { display: block; font-size: 28px; font-weight: 900; line-height: 1; }
    .entry-score-label { font-size: 11px; color: #9ca3af; font-weight: 600; }
    .entry-arrow { font-size: 22px; color: #d1d5db; }
    .pb-bar { height: 20px; }
  `]
})
export class HistorialGuardadoComponent implements OnInit {
  entries: HistoryEntry[] = [];
  loading = true;

  getScoreColor = getScoreColor;
  getScoreLabel = getScoreLabel;

  constructor(
    public router: Router,
    private historyService: HistoryService,
    private appState: AppStateService
  ) {}

  ngOnInit() {
    this.historyService.getHistory().subscribe(data => {
      this.entries = data;
      this.loading = false;
    });
    this.appState.history.subscribe(local => {
      if (local.length > 0) this.entries = local;
    });
  }

  openEntry(entry: HistoryEntry) {
    this.router.navigate(['/resultados', entry.analysis_id]);
  }
}
