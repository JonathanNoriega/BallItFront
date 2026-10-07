---
inclusion: always
---

# Tech — BallIt

## Stack

- **Electron** — proceso principal (main.ts), preload bridge (preload.ts)
- **Angular** (última estable, standalone components) — UI en el renderer
- **TypeScript** en toda la app
- **RxJS** — estado reactivo (BehaviorSubject para historial, racha, config, progreso)
- **HttpClient de Angular** — todas las llamadas HTTP al backend
- **Canvas API + requestVideoFrameCallback** — overlay de esqueleto/ángulos
- **Chart.js vía ng2-charts** o **ngx-charts** — gráficas de progreso y comparación
- **electron-builder** — empaquetado (solo modo dev para el pitch)
- **electron-store** — persistencia local (user_id anónimo, config, caché mínima)

## Backend

El back real (JuandiSolo/BallItMVP) es Python + MediaPipe, con endpoints HTTP funcionales.

- Base URL: variable de entorno `VITE_API_BASE_URL` — **nunca hardcodeada**
- CORS ya habilitado en el back; las llamadas van directo desde el renderer con HttpClient
- Si hay problemas de CORS, alternativa: enrutar por proceso main vía IPC (último recurso)

### Endpoints

| Método | Ruta | Uso |
|---|---|---|
| POST | `/analyze` | Sube video, inicia análisis |
| GET | `/analyze/{id}` | Polling de estado/resultado |
| GET | `/history` | Historial de sesiones |
| POST | `/compare` | Comparación antes/después |

> Ver `data-contract.md` (inclusion: manual — traer con #data-contract) antes de tocar lógica de análisis, resultados o consejos de IA.

## Reglas de capa de datos

- **Ningún componente** de pantalla inyecta `HttpClient` directamente
- Toda llamada HTTP vive en `src/app/services/`
- Los servicios exponen Observables; los componentes solo suscriben
- Validar la respuesta real del endpoint contra el contrato; ajustar el parseo **en el servicio**, no en el componente

## Capacidades nativas de Electron

- **Diálogo nativo de archivos** (`dialog.showOpenDialog` vía IPC) para "Subir video" — no usar `<input type="file">` web
- Expuesto al renderer vía `preload.ts` con `contextBridge`
- Grabar desde cámara: `getUserMedia` normal (funciona igual en el renderer de Electron)
- `electron-store` para persistir user_id anónimo (UUID) y config

## Overlay (técnica)

- `<canvas>` posicionado encima del `<video>` con `position: absolute`
- Sincronización frame a frame con `requestVideoFrameCallback`
- Lógica de dibujo en `src/app/lib/overlay.ts` — independiente de Angular
- Coordenadas de landmarks: siempre normalizadas 0–1 (no píxeles); escalar al tamaño del canvas en tiempo de dibujo
- El ángulo de referencia es `{brazo}_shoulder_angle` (cadera–hombro–codo, "abducción"), se muestra al usuario como "Apertura del codo" y se dibuja en el hombro
- No confundir `measured_angle` por frame con el promedio de la fase de preparación usado para el puntaje del tiro

## Build y desarrollo

```bash
# Instalar dependencias
npm install

# Modo dev (Angular + Electron en paralelo)
npm run electron:dev

# Build para demo
npm run electron:build
```

## No funcionales

- Ventana Electron de escritorio, pero UI en contenedor tipo teléfono (`max-width: 430px`) centrado
- Barra de acción fija abajo, botones ≥ 52px
- Feedback de carga siempre visible; la pantalla "Procesando" debe sentirse en el orden de 1 minuto
- Estados vacíos y de error explican qué cambiar, nunca muestran análisis como si fuera válido
- Accesibilidad: color nunca es la única señal (siempre icono/texto + color), contraste AA, texto ≥ 14px
- Idioma: español (español colombiano en textos generados por IA)
- Aviso simple de privacidad al subir video (no flujo legal completo)

## Formatos de video aceptados

`mp4`, `mov`, `m4v`, `avi`, `mkv` — validación en front; mostrar tamaño máximo y errores claros.
