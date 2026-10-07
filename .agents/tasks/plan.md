# Implementation Plan — BallIt Front

> Greenfield project: solo existen archivos de steering en `.kiro/steering/`. Todo se crea desde cero.
> Entorno: Node 24.19.0, npm 12, Linux.
> Ver también los artefactos FEAT en `.agents/tasks/features/` — este plan es el fallback lineal.

---

## Dependencias de versiones (resueltas)

| Paquete | Versión | Razón |
|---|---|---|
| `@angular/*` | `18.2.13` | Angular 18 estable con standalone components y application builder |
| `typescript` | `5.4.5` | Requerido por Angular 18 (no 5.5+ aún) |
| `electron` | `32.3.3` | LTS estable; electron-store v10 requiere Electron 30+ |
| `electron-store` | `10.0.0` | ESM puro — solo en proceso main, acceso vía IPC desde renderer |
| `electron-builder` | `25.1.8` | Compatible con Electron 32 |
| `ng2-charts` | `6.0.1` | Soporte Angular 17+; peerDep chart.js 4.x |
| `chart.js` | `4.4.4` | Requerido por ng2-charts 6 |
| `rxjs` | `7.8.1` | Requerido por Angular 18 |
| `zone.js` | `0.14.10` | Requerido por Angular 18 |
| `concurrently` | `9.0.1` | Para script electron:dev |
| `wait-on` | `8.0.1` | Para esperar al servidor Angular antes de abrir Electron |

**Nota de instalación:** `npm install --legacy-peer-deps` por posible conflicto menor de peer deps de ng2-charts.

**electron-store en main.ts:** Es ESM puro. En el proceso main (CJS compilado), usar import dinámico:
```ts
const Store = (await import('electron-store')).default;
const store = new Store();
```

---

## Plan de implementación

- [ ] 1. Crear `package.json` en la raíz con todas las dependencias y scripts.
      Scripts clave: `build` (ng build + tsc -p tsconfig.electron.json), `electron:dev` (concurrently ng serve + wait-on + electron), `electron:build` (npm run build + electron-builder).
      Files: `package.json`
      Verify: `npm install --legacy-peer-deps` sin errores fatales.

- [ ] 2. Crear `angular.json` configurando el proyecto `ballitfront` con `@angular-devkit/build-angular:application` (esbuild), outputPath `dist/ballitfront`, index `src/index.html`, browser `src/main.ts`, inlineStyleLanguage `scss`. Budgets relajados para el demo (initial 5mb).
      Files: `angular.json`
      Verify: `ng build` reconoce el proyecto.

- [ ] 3. Crear `tsconfig.json` (base), `tsconfig.app.json` (renderer Angular), `tsconfig.electron.json` (main/preload CJS).
      `tsconfig.electron.json` apunta `outDir: dist-electron`, `module: CommonJS`, `include: ['electron/**/*.ts']`.
      Files: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.electron.json`
      Verify: `tsc -p tsconfig.electron.json --noEmit` sin errores (aunque electron/ aún no exista).

- [ ] 4. Crear `environments/environment.ts` y `environments/environment.prod.ts`. `apiBaseUrl` lee de `process.env['VITE_API_BASE_URL']` con fallback `'http://localhost:8000'`. Nunca hardcodeada.
      Files: `environments/environment.ts`, `environments/environment.prod.ts`
      Verify: `tsc --noEmit` incluye los archivos sin error.

- [ ] 5. Crear `src/index.html` (base HTML con `<app-root>`), `src/styles.scss` (variables CSS, reset, `.phone-frame`), `electron-builder.yml`, `.gitignore`, `.env.example`.
      Files: `src/index.html`, `src/styles.scss`, `electron-builder.yml`, `.gitignore`, `.env.example`
      Verify: `ng build` produce `dist/ballitfront/index.html`.

- [ ] 6. Crear modelos TypeScript en `src/app/models/`.
      - `analyze.model.ts`: interfaces `AnalysisConfig`, `AnalysisVideo`, `AnalysisQuality`, `AnalysisRule`, `Shot`, `ShotFrames`, `ShotTimesS`, `AnalysisSummary`, `FrameData`, `AnalysisResult`. Tipos estrictos: `verdict: 'bueno'|'dudoso'|'malo'`, `arm: 'right'|'left'`.
      - `history.model.ts`: `HistoryItem`, `HistoryDetail` (alias de `AnalysisResult`).
      - `compare.model.ts`: `CompareRequest`, `CompareResult`.
      Files: `src/app/models/analyze.model.ts`, `src/app/models/history.model.ts`, `src/app/models/compare.model.ts`
      Verify: `tsc --noEmit` sin errores.

- [ ] 7. Crear mocks JSON en `src/app/mocks/fixtures/` (datos realistas del contrato).
      - `analyze-result.mock.json`: 4 tiros (bueno 93, bueno 80, dudoso 60, malo 25), 20+ frames con landmarks normalizados plausibles, `analysis_id: '00000000-0000-4000-8000-000000000001'`.
      - `history.mock.json`: array de 3 HistoryItems (IDs 001, 002, 003) con fechas últimos 7 días.
      - `compare.mock.json`: CompareResult comparando ID 002 vs 001, `delta_score: 33`, `verdict: 'mejora'`.
      Files: `src/app/mocks/fixtures/analyze-result.mock.json`, `src/app/mocks/fixtures/history.mock.json`, `src/app/mocks/fixtures/compare.mock.json`
      Verify: JSON válido parseado por `node -e "require('./src/app/mocks/fixtures/analyze-result.mock.json')"`.

- [ ] 8. Crear lógica pura en `src/app/lib/` (sin dependencias Angular).
      - `score.ts`: `getScoreColor(score)`, `getScoreLabel(score)`, `getVerdictColor(verdict)`.
      - `streak.ts`: `calculateStreak(history: HistoryItem[]): number` (días consecutivos con análisis hasta hoy).
      - `overlay.ts`: clase `OverlayRenderer(canvas)` con métodos `draw(frame, arm, showSkeleton, showAngles, showTrail)`, `clear()`, `resize(w, h)`. Conexiones de landmarks hardcodeadas como pares de índices: `[[0,1],[0,2],[1,3],[2,4],[3,5],[0,6],[1,7],[6,7],[6,8],[7,9],[8,10],[9,11]]`. Brazo de tiro (arm=right: índices 1,3,5; arm=left: 0,2,4) se dibuja en `#FF5A1F` con `lineWidth: 4`; el resto en `rgba(255,255,255,0.6)` con `lineWidth: 2`. Arco de ángulo en el hombro del brazo con arco de radio proporcional. Etiqueta `"Codo Xº"` coloreada según semáforo.
      Files: `src/app/lib/score.ts`, `src/app/lib/streak.ts`, `src/app/lib/overlay.ts`
      Verify: `tsc --noEmit` sin errores.

- [ ] 9. Crear servicios Angular en `src/app/services/`.
      - `analyze.service.ts`: `submitAnalysis(file, config, userId)` → POST `/analyze` con FormData + header `X-User-Id`. `pollResult(id, userId)` → GET `/analyze/{id}` cada 2s con `timer(0,2000).pipe(switchMap(...), filter(r => !r.status || r.status==='done'), take(1))`. `catchError` → retorna mock.
      - `history.service.ts`: `getHistory(userId)` → GET `/history`. `getDetail(id, userId)` → GET `/history/{id}`. catchError → mock.
      - `compare.service.ts`: `compare(idA, idB, userId)` → POST `/compare`. catchError → mock.
      - `advice.service.ts`: función pura `getAdvice(shot, rule): string` generando frase en español según `shot.verdict`.
      Files: `src/app/services/analyze.service.ts`, `src/app/services/history.service.ts`, `src/app/services/compare.service.ts`, `src/app/services/advice.service.ts`
      Verify: `ng build` sin errores.

- [ ] 10. Crear estado global en `src/app/state/`.
       - `session-config.service.ts`: `BehaviorSubject<SessionConfig>` (arm, camera, focus, goal). `updateConfig(partial)`.
       - `app-state.service.ts`: `userId$` (BehaviorSubject<string>) — leer de `window.electronAPI?.getStoreValue('user_id')` con fallback a `localStorage`; si no existe, generar con `crypto.randomUUID()` y persistir. `history$` (BehaviorSubject<HistoryItem[]>). `streak$` (computed de history$). `currentResult$` (BehaviorSubject<AnalysisResult|null>).
       Files: `src/app/state/app-state.service.ts`, `src/app/state/session-config.service.ts`
       Verify: `ng build` sin errores.

- [ ] 11. Crear `electron/preload.ts` y `electron/main.ts`.
       **preload.ts**: `contextBridge.exposeInMainWorld('electronAPI', { openFileDialog, getStoreValue, setStoreValue, deleteStoreValue })`. Tipos en `declare global { interface Window { electronAPI: ElectronAPI } }`.
       **main.ts**: Ventana 1280×800, `contextIsolation: true`, `nodeIntegration: false`. En dev: carga `http://localhost:4200`; en prod: `file://${__dirname}/../../dist/ballitfront/index.html`. IPC handlers para file dialog y electron-store (importado dinámicamente con `const Store = (await import('electron-store')).default`).
       Files: `electron/main.ts`, `electron/preload.ts`
       Verify: `tsc -p tsconfig.electron.json` produce `dist-electron/electron/main.js` y `dist-electron/electron/preload.js`.

- [ ] 12. Crear `src/main.ts` (Angular bootstrap) y `src/app/app.component.ts`.
       `main.ts`: `bootstrapApplication(AppComponent, appConfig)`.
       `app.component.ts`: standalone, selector `app-root`, template `<router-outlet />`, imports `[RouterOutlet]`.
       Files: `src/main.ts`, `src/app/app.component.ts`
       Verify: `ng build` sin errores.

- [ ] 13. Crear `src/app/app.routes.ts` y `src/app/app.config.ts`.
       Routes con lazy loading via `loadComponent`. app.config.ts: `provideRouter(routes)`, `provideHttpClient(withFetch())`, `provideAnimations()`, `provideCharts(withDefaultRegisterables())` (ng2-charts v6).
       Files: `src/app/app.routes.ts`, `src/app/app.config.ts`
       Verify: `ng build` sin errores.

- [ ] 14. Crear componentes compartidos en `src/app/components/` (todos standalone).
       En orden de dependencia:
       a. `phone-frame/` — wrapper max-width 430px.
       b. `action-bar/` — barra fija bottom, botón primario 52px brand-orange.
       c. `verdict-chip/` — icono+texto semáforo.
       d. `angle-badge/` — pill con grados y color semáforo.
       e. `streak-badge/` — 🔥 N días.
       f. `shot-selector/` — fila scrollable de tiros con badge de veredicto.
       g. `metric-card/` — tarjeta con título/valor/frase/chip.
       h. `advice-card/` — tarjeta expandible con consejo + tips.
       i. `skeleton-overlay/` — `<video>` + `<canvas>` superpuesto con `requestVideoFrameCallback`→fallback rAF, tres toggles de capas.
       Files: `src/app/components/{phone-frame,action-bar,verdict-chip,angle-badge,streak-badge,shot-selector,metric-card,advice-card,skeleton-overlay}/`
       Verify: `ng build` sin errores.

- [ ] 15. Crear pantalla P6 Resultados (`src/app/pages/resultados/`) — CRÍTICA.
       Hero: `<app-skeleton-overlay>` con video y canvas. Sobre el video: `<app-verdict-chip>`. Debajo: `<app-shot-selector>` (cambia `selectedShot$`). Círculo de puntaje con score coloreado. `<app-metric-card>` para apertura del codo. Tarjeta de pausa (si aplica). `<app-advice-card>`. `<app-action-bar>` con 'Ver momento del tiro' y 'Guardar y ver historial'.
       Files: `src/app/pages/resultados/resultados.component.ts`, `src/app/pages/resultados/resultados.component.scss`
       Verify: `ng build` sin errores. Navegar a `/resultados/00000000-0000-4000-8000-000000000001` muestra datos mock.

- [ ] 16. Crear pantalla P1 Inicio (`src/app/pages/inicio/`).
       Logo, `<app-streak-badge>`, botón grande 'Analizar mi tiro', botón secundario 'Mis entrenamientos'.
       Files: `src/app/pages/inicio/inicio.component.ts`, `inicio.component.scss`
       Verify: `ng build` sin errores. Ruta `/` muestra la pantalla.

- [ ] 17. Crear pantalla P5 Procesando (`src/app/pages/procesando/`).
       Polling real con `analyzeService.pollResult()`, barra de progreso estimada ~60s, navegación automática a resultados al terminar.
       Files: `src/app/pages/procesando/procesando.component.ts`, `procesando.component.scss`
       Verify: `ng build` sin errores.

- [ ] 18. Crear pantalla P3 Subir/Grabar (`src/app/pages/subir-grabar/`).
       Botón 'Elegir video' → `window.electronAPI.openFileDialog()` (no `<input type=file>`). Validación de extensión y tamaño. Preview. Sección de grabación con `getUserMedia`. Botón 'Analizar' → `analyzeService.submitAnalysis()` → navega a `/procesando/:id`. Aviso de privacidad.
       Files: `src/app/pages/subir-grabar/subir-grabar.component.ts`, `subir-grabar.component.scss`
       Verify: `ng build` sin errores.

- [ ] 19. Crear pantalla P2 Configuración (`src/app/pages/configuracion/`).
       Formulario reactivo: mano (Derecha/Izquierda), cámara (solo Frente habilitada), objetivo opcional. Guarda en `SessionConfigService`. Navega a `/subir`.
       Files: `src/app/pages/configuracion/configuracion.component.ts`, `configuracion.component.scss`
       Verify: `ng build` sin errores.

- [ ] 20. Crear pantalla P7 Frame del tiro (`src/app/pages/frame-del-tiro/`).
       Carga shot por índice, `seekToFrame(shot.frames.peak)`, imagen del peak con overlay, frase en lenguaje natural, `<app-verdict-chip>`. Navegación de vuelta a resultados.
       Files: `src/app/pages/frame-del-tiro/frame-del-tiro.component.ts`, `frame-del-tiro.component.scss`
       Verify: `ng build` sin errores.

- [ ] 21. Crear pantalla P8 Historial (`src/app/pages/historial-guardado/`).
       Lista de tarjetas de historial. Selección múltiple (2) para comparar. Estado vacío explicativo. Navega a `/comparar?id_a=...&id_b=...`.
       Files: `src/app/pages/historial-guardado/historial-guardado.component.ts`, `historial-guardado.component.scss`
       Verify: `ng build` sin errores.

- [ ] 22. Crear pantalla P9 Comparar (`src/app/pages/comparar/`).
       Dos columnas Antes/Después, tabla comparativa con deltas coloreados, gráfica de barras ng2-charts (`BaseChartDirective`), veredicto de mejora, botón 'Analizar nuevo tiro'.
       Files: `src/app/pages/comparar/comparar.component.ts`, `comparar.component.scss`
       Verify: `ng build` sin errores.

- [ ] 23. Crear pantalla P4 Recortar fragmento (`src/app/pages/recortar-fragmento/`).
       Simplificada: inputs numéricos para inicio/fin, actualiza `SessionConfig`, navega a `/procesando`.
       Files: `src/app/pages/recortar-fragmento/recortar-fragmento.component.ts`, `recortar-fragmento.component.scss`
       Verify: `ng build` sin errores.

- [ ] 24. Polish de estilos y smoke-test final.
       Completar estilos en `styles.scss` y archivos `.scss` de componentes. Verificar design system: brand-orange, navy, cream, botones 52px, cards 16px radius. Verificar flujo demo con mock. Verificar que Electron arranca: `electron dist-electron/electron/main.js`.
       Files: `src/styles.scss`, `README.md`, todos los `.scss` de componentes y páginas.
       Verify: `npm run build` sin errores + `electron dist-electron/electron/main.js` abre ventana.

---

## Notas de implementación críticas

1. **electron-store + ESM**: Usar `const Store = (await import('electron-store')).default` dentro de una función async en main.ts. No importar al nivel de módulo.

2. **ng2-charts v6 standalone**: Agregar `provideCharts(withDefaultRegisterables())` en `app.config.ts`. Importar `BaseChartDirective` directamente en el componente.

3. **File path → File object en renderer**: El diálogo nativo retorna un string path. Para convertirlo a `File`/`Blob` para `FormData`: usar `fetch('file://' + path).then(r => r.blob())` en Electron renderer (funciona porque Electron permite file:// protocol en el renderer por defecto).

4. **requestVideoFrameCallback**: Disponible en Chrome 83+ (Electron lo soporta). Fallback: `if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) ... else requestAnimationFrame(...)`.

5. **Polling del backend**: El contrato dice que la respuesta de GET /analyze/{id} cuando está lista no tiene campo `status`; tiene directamente los datos. El polling debe detectar que llegó un objeto con `shots` array presente (no `status: 'pending'`). Confirmar revisando el mock.

6. **Headers X-User-Id**: Todos los servicios HTTP deben agregar el header. Crear un HttpInterceptor (`user-id.interceptor.ts`) que agrega el header automáticamente, registrarlo en `provideHttpClient(withFetch(), withInterceptors([userIdInterceptor]))`.
