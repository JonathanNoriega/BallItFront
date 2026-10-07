import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnalyzeService } from '../../services/analyze.service';
import { SessionConfigService } from '../../state/session-config.service';
import { ActionBarComponent } from '../../components/action-bar/action-bar.component';

const VALID_EXTENSIONS = ['mp4', 'mov', 'm4v', 'avi', 'mkv'];
const MAX_BYTES = 200 * 1024 * 1024; // 200 MiB

@Component({
  selector: 'app-subir-grabar',
  standalone: true,
  imports: [CommonModule, ActionBarComponent],
  template: `
    <div class="page">
      <div class="header">
        <button class="back-btn" (click)="router.navigate(['/configuracion'])">‹</button>
        <h1>Tu video</h1>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'subir'" (click)="activeTab = 'subir'">
          📁 Subir video
        </button>
        <button class="tab" [class.active]="activeTab === 'grabar'" (click)="switchToRecord()">
          📷 Grabar
        </button>
      </div>

      <!-- Tab: Subir -->
      @if (activeTab === 'subir') {
        <div class="upload-area" (click)="triggerFilePick()" [class.has-file]="selectedFile">
          @if (!selectedFile) {
            <div class="upload-placeholder">
              <span class="upload-icon">📂</span>
              <p class="upload-hint">Toca para seleccionar un video</p>
              <p class="upload-formats">MP4, MOV, M4V, AVI, MKV · Máx 200 MB</p>
            </div>
          } @else {
            <div class="file-info">
              <span class="file-icon">🎬</span>
              <div>
                <p class="file-name">{{ selectedFile.name }}</p>
                <p class="file-size">{{ fileSizeMB }} MB</p>
              </div>
              <button class="remove-btn" (click)="removeFile($event)">✕</button>
            </div>
          }
        </div>
        <!-- input file oculto como fallback web -->
        <input #fileInput type="file" accept=".mp4,.mov,.m4v,.avi,.mkv" style="display:none"
               (change)="onFileInputChange($event)" />

        @if (fileError) {
          <div class="error-banner">⚠️ {{ fileError }}</div>
        }
      }

      <!-- Tab: Grabar -->
      @if (activeTab === 'grabar') {
        <div class="record-area">
          <video #previewVideo autoplay muted playsinline class="preview-video"></video>
          @if (!isRecording) {
            <button class="record-btn" (click)="startRecording()">⏺ Grabar</button>
          } @else {
            <div class="recording-indicator">
              <span class="rec-dot"></span> Grabando...
            </div>
            <button class="record-btn stop" (click)="stopRecording()">⏹ Detener</button>
          }
          @if (recordedFile) {
            <div class="file-info recorded">
              <span class="file-icon">🎬</span>
              <div>
                <p class="file-name">video-grabado.webm</p>
                <p class="file-size">{{ fileSizeMB }} MB</p>
              </div>
            </div>
          }
        </div>
      }

      <!-- Aviso privacidad -->
      <div class="privacy-notice">
        🔒 Tu video se analiza en el servidor y no se comparte con terceros.
      </div>

      <div class="pb-bar"></div>
    </div>

    <app-action-bar
      primaryLabel="Analizar 🚀"
      [primaryDisabled]="!selectedFile && !recordedFile"
      (primaryClick)="analizar()">
    </app-action-bar>
  `,
  styles: [`
    .page { padding: 0 20px 100px; background: #FAFAF7; min-height: 100vh; }
    .header { display: flex; align-items: center; gap: 12px; padding: 20px 0 20px; }
    .back-btn { background: none; border: none; font-size: 28px; color: #1B2B4B; cursor: pointer; padding: 0; }
    h1 { font-size: 22px; font-weight: 800; color: #1B2B4B; margin: 0; }
    .tabs { display: flex; gap: 0; margin-bottom: 20px; border-radius: 12px; overflow: hidden; border: 2px solid #e5e7eb; }
    .tab { flex: 1; padding: 12px; border: none; background: white; font-size: 14px; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.15s; }
    .tab.active { background: #FF5A1F; color: white; }
    .upload-area {
      min-height: 180px; border: 2px dashed #d1d5db; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; background: white; transition: border-color 0.15s; margin-bottom: 12px;
    }
    .upload-area:hover, .upload-area.has-file { border-color: #FF5A1F; }
    .upload-placeholder { text-align: center; padding: 24px; }
    .upload-icon { font-size: 40px; display: block; margin-bottom: 8px; }
    .upload-hint { font-size: 15px; font-weight: 600; color: #374151; margin: 0 0 4px; }
    .upload-formats { font-size: 12px; color: #9ca3af; margin: 0; }
    .file-info { display: flex; align-items: center; gap: 12px; padding: 20px; width: 100%; }
    .file-icon { font-size: 32px; }
    .file-info div { flex: 1; }
    .file-name { font-size: 14px; font-weight: 700; color: #1B2B4B; margin: 0; word-break: break-all; }
    .file-size { font-size: 12px; color: #6b7280; margin: 2px 0 0; }
    .remove-btn { background: none; border: none; font-size: 18px; color: #9ca3af; cursor: pointer; }
    .error-banner { background: #fee2e2; color: #b91c1c; border-radius: 10px; padding: 10px 14px; font-size: 13px; margin-bottom: 12px; }
    .record-area { display: flex; flex-direction: column; align-items: center; gap: 14px; margin-bottom: 16px; }
    .preview-video { width: 100%; border-radius: 12px; background: #000; max-height: 240px; object-fit: cover; }
    .record-btn { min-height: 52px; padding: 0 32px; background: #FF5A1F; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; }
    .record-btn.stop { background: #EF4444; }
    .recording-indicator { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #EF4444; }
    .rec-dot { width: 10px; height: 10px; background: #EF4444; border-radius: 50%; animation: blink 1s infinite; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
    .recorded { background: #f0fdf4; border-radius: 12px; border: 1.5px solid #22C55E; }
    .privacy-notice { font-size: 12px; color: #9ca3af; text-align: center; padding: 12px 0; }
    .pb-bar { height: 20px; }
  `]
})
export class SubirGrabarComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('previewVideo') previewVideo!: ElementRef<HTMLVideoElement>;

  activeTab: 'subir' | 'grabar' = 'subir';
  selectedFile: File | null = null;
  recordedFile: File | null = null;
  fileError = '';
  isRecording = false;
  private mediaRecorder?: MediaRecorder;
  private recordedChunks: Blob[] = [];
  private stream?: MediaStream;

  constructor(
    public router: Router,
    private analyzeService: AnalyzeService,
    private configService: SessionConfigService
  ) {}

  get fileSizeMB(): string {
    const f = this.selectedFile ?? this.recordedFile;
    return f ? (f.size / 1024 / 1024).toFixed(1) : '0';
  }

  triggerFilePick() {
    const api = (window as any).electronAPI;
    if (api?.openFileDialog) {
      api.openFileDialog().then((result: any) => {
        if (!result) return;
        // En Electron recibimos la ruta; creamos un File-like desde ella
        fetch('file://' + result.filePath)
          .then(r => r.blob())
          .then(blob => {
            const file = new File([blob], result.fileName, { type: 'video/mp4' });
            this.validateAndSet(file);
          })
          .catch(() => {
            // Si fetch falla (permisos), usamos un objeto File vacío con el nombre
            // para que el formulario continúe — el servicio enviará la ruta
            this.selectedFile = new File([], result.fileName);
            (this.selectedFile as any)._electronPath = result.filePath;
          });
      });
    } else {
      this.fileInput.nativeElement.click();
    }
  }

  onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.validateAndSet(input.files[0]);
  }

  validateAndSet(file: File) {
    this.fileError = '';
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!VALID_EXTENSIONS.includes(ext)) {
      this.fileError = `Formato no válido (${ext}). Usa MP4, MOV, M4V, AVI o MKV.`;
      return;
    }
    if (file.size > MAX_BYTES) {
      this.fileError = `El video pesa más de 200 MB. Usa un clip más corto.`;
      return;
    }
    this.selectedFile = file;
  }

  removeFile(e: Event) {
    e.stopPropagation();
    this.selectedFile = null;
    this.fileError = '';
  }

  async switchToRecord() {
    this.activeTab = 'grabar';
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.previewVideo.nativeElement.srcObject = this.stream;
    } catch {
      this.fileError = 'No se pudo acceder a la cámara.';
      this.activeTab = 'subir';
    }
  }

  startRecording() {
    if (!this.stream) return;
    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder.ondataavailable = e => { if (e.data.size > 0) this.recordedChunks.push(e.data); };
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      this.recordedFile = new File([blob], 'video-grabado.webm', { type: 'video/webm' });
    };
    this.mediaRecorder.start();
    this.isRecording = true;
  }

  stopRecording() {
    this.mediaRecorder?.stop();
    this.stream?.getTracks().forEach(t => t.stop());
    this.isRecording = false;
  }

  analizar() {
    const file = this.selectedFile ?? this.recordedFile;
    if (!file) return;
    const config = this.configService.snapshot;
    this.analyzeService.postAnalyze(file, config).subscribe(res => {
      this.router.navigate(['/procesando', res.analysis_id]);
    });
  }
}
