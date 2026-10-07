import {
  Component, Input, OnChanges, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, SimpleChanges, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalysisResult, FrameData } from '../../models/analyze.model';
import { drawOverlay, findFrameAtTime, OverlayConfig } from '../../lib/overlay';
import { AnalyzeService } from '../../services/analyze.service';

@Component({
  selector: 'app-skeleton-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overlay-wrapper">
      <!-- Chip de estado superpuesto -->
      @if (currentShot) {
        <div class="status-chip" [ngClass]="currentShot.verdict">
          {{ verdictIcon }} {{ verdictLabel }} · {{ currentTimeStr }}
        </div>
      }

      @if (videoError) {
        <div class="video-error">
          <p>⚠️ El video no pudo cargarse.</p>
          <p class="video-error-sub">El overlay y el análisis siguen disponibles.</p>
        </div>
      } @else {
        <video
          #videoEl
          [src]="videoSrc"
          controls
          playsinline
          crossorigin="anonymous"
          (loadedmetadata)="onVideoLoaded()"
          (play)="startLoop()"
          (pause)="stopLoop()"
          (ended)="stopLoop()"
          (error)="onVideoError()"
          style="width:100%; display:block; background:#000; min-height:200px;">
        </video>
      }

      <canvas
        #canvasEl
        style="position:absolute; top:0; left:0; pointer-events:none;">
      </canvas>

      <!-- Toggles -->
      <div class="toggles">
        <label class="toggle-item">
          <input type="checkbox" [(ngModel)]="showSkeleton" (change)="redraw()" />
          <span>Esqueleto</span>
        </label>
        <label class="toggle-item">
          <input type="checkbox" [(ngModel)]="showAngles" (change)="redraw()" />
          <span>Ángulos</span>
        </label>
        <label class="toggle-item">
          <input type="checkbox" [(ngModel)]="showTrail" (change)="redraw()" />
          <span>Estela</span>
        </label>
      </div>
    </div>
  `,
  styles: [`
    .overlay-wrapper { position: relative; background: #000; }
    .status-chip {
      position: absolute; top: 10px; left: 10px; z-index: 10;
      padding: 4px 10px; border-radius: 20px;
      font-size: 12px; font-weight: 700; color: white;
      backdrop-filter: blur(4px);
    }
    .status-chip.bueno  { background: rgba(34,197,94,0.85); }
    .status-chip.dudoso { background: rgba(234,179,8,0.85); color: #1a1a1a; }
    .status-chip.malo   { background: rgba(239,68,68,0.85); }
    .toggles {
      display: flex; gap: 16px; padding: 8px 12px;
      background: #1a1a1a;
    }
    .toggle-item {
      display: flex; align-items: center; gap: 5px;
      font-size: 13px; color: #ccc; cursor: pointer;
    }
    .toggle-item input[type=checkbox] { accent-color: #FF5A1F; width: 16px; height: 16px; }
  `]
})
export class SkeletonOverlayComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() analysisResult!: AnalysisResult;
  @Input() selectedShotIndex = 0;

  @ViewChild('videoEl') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasRef!: ElementRef<HTMLCanvasElement>;

  showSkeleton = true;
  showAngles   = true;
  showTrail    = true;

  /** URL resuelta (object URL de blob) para el <video src> */
  videoSrc = '';
  videoError = false;

  private trail: number[][][] = [];
  private rafId: number | null = null;
  private rVFCId: number | null = null;
  private supportsRVFC = false;
  private currentObjectUrl: string | null = null;

  private analyze = inject(AnalyzeService);

  /** Descarga el video como blob (con header X-User-Id) y setea el object URL */
  private resolveVideoSrc() {
    const rawUrl = this.analysisResult?.video?.url;
    if (!rawUrl) { this.videoSrc = ''; return; }

    // Liberar el object URL anterior
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }

    this.videoError = false;
    this.analyze.mediaUrl(rawUrl).subscribe(url => {
      if (!url) { this.videoError = true; return; }
      if (url.startsWith('blob:')) this.currentObjectUrl = url;
      this.videoSrc = url;
    });
  }

  onVideoError() {
    this.videoError = true;
  }

  get currentShot() {
    return this.analysisResult?.shots?.[this.selectedShotIndex] ?? null;
  }

  get verdictIcon(): string {
    const v = this.currentShot?.verdict;
    return v === 'bueno' ? '🟢' : v === 'dudoso' ? '🟡' : '🔴';
  }

  get verdictLabel(): string {
    const v = this.currentShot?.verdict;
    return v === 'bueno' ? 'Bueno' : v === 'dudoso' ? 'Dudoso' : 'Mejorable';
  }

  get currentTimeStr(): string {
    const vid = this.videoRef?.nativeElement;
    if (!vid) return '';
    const t = vid.currentTime;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  ngAfterViewInit() {
    this.supportsRVFC = typeof (HTMLVideoElement.prototype as any).requestVideoFrameCallback === 'function';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedShotIndex']) {
      this.trail = [];
    }
    if (changes['analysisResult']) {
      this.resolveVideoSrc();
      if (this.canvasRef) this.redraw();
    }
  }

  ngOnDestroy() {
    this.stopLoop();
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
  }

  onVideoLoaded() {
    this.syncCanvasSize();
    this.redraw();
  }

  startLoop() {
    if (this.supportsRVFC) {
      this.scheduleRVFC();
    } else {
      this.scheduleRAF();
    }
  }

  stopLoop() {
    if (this.rVFCId !== null) {
      (this.videoRef?.nativeElement as any)?.cancelVideoFrameCallback?.(this.rVFCId);
      this.rVFCId = null;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  redraw() {
    this.syncCanvasSize();
    const vid = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!vid || !canvas || !this.analysisResult) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const frame = this.getFrameForTime(vid.currentTime);
    if (frame) {
      this.updateTrail(frame);
      drawOverlay(ctx, frame, this.overlayConfig, this.trail);
    }
  }

  private scheduleRVFC() {
    const vid = this.videoRef?.nativeElement as any;
    if (!vid) return;
    this.rVFCId = vid.requestVideoFrameCallback((now: number, meta: any) => {
      this.onFrame(meta.mediaTime ?? vid.currentTime);
      if (!vid.paused && !vid.ended) this.scheduleRVFC();
    });
  }

  private scheduleRAF() {
    this.rafId = requestAnimationFrame(() => {
      const vid = this.videoRef?.nativeElement;
      if (vid && !vid.paused && !vid.ended) {
        this.onFrame(vid.currentTime);
        this.scheduleRAF();
      }
    });
  }

  private onFrame(t: number) {
    this.syncCanvasSize();
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.analysisResult) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const frame = this.getFrameForTime(t);
    if (frame) {
      this.updateTrail(frame);
      drawOverlay(ctx, frame, this.overlayConfig, this.trail);
    }
  }

  private getFrameForTime(t: number): FrameData | null {
    const frames = this.analysisResult?.frames;
    if (!frames?.length) return null;
    const idx = findFrameAtTime(frames, t);
    return frames[idx] ?? null;
  }

  private updateTrail(frame: FrameData) {
    if (!this.showTrail) { this.trail = []; return; }
    this.trail.push(frame.p);
    if (this.trail.length > 8) this.trail.shift();
  }

  private syncCanvasSize() {
    const vid = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!vid || !canvas) return;
    if (canvas.width !== vid.clientWidth || canvas.height !== vid.clientHeight) {
      canvas.width  = vid.clientWidth;
      canvas.height = vid.clientHeight;
      canvas.style.width  = vid.clientWidth  + 'px';
      canvas.style.height = vid.clientHeight + 'px';
    }
  }

  private get overlayConfig(): OverlayConfig {
    return {
      arm: this.analysisResult?.config?.arm ?? 'right',
      showSkeleton: this.showSkeleton,
      showAngles:   this.showAngles,
      showTrail:    this.showTrail,
      rule: this.analysisResult?.rule
        ? { t: this.analysisResult.rule.t, band: this.analysisResult.rule.band }
        : undefined,
    };
  }
}
