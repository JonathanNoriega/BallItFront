---
inclusion: always
---

# Estructura del proyecto — BallIt

```
BallItFront/
├── electron/
│   ├── main.ts               # Proceso principal: crea ventana, diálogo nativo de archivos
│   └── preload.ts            # Bridge al renderer (contextBridge + IPC)
│
├── src/
│   └── app/
│       ├── pages/            # Una carpeta/componente por pantalla del flujo
│       │   ├── inicio/                   # P1
│       │   ├── configuracion/            # P2
│       │   ├── subir-grabar/             # P3
│       │   ├── recortar-fragmento/       # P4
│       │   ├── procesando/               # P5
│       │   ├── resultados/               # P6 ⭐
│       │   ├── frame-del-tiro/           # P7
│       │   ├── historial-guardado/       # P8
│       │   └── comparar/                 # P9
│       │
│       ├── components/       # Compartidos entre pantallas
│       │   ├── skeleton-overlay/   # Canvas que dibuja esqueleto + ángulos sobre <video>
│       │   ├── angle-badge/        # Etiqueta "Codo 41°" con color semáforo
│       │   ├── verdict-chip/       # 🟢/🟡/🔴 + texto
│       │   ├── streak-badge/       # 🔥 racha
│       │   ├── shot-selector/      # Selector horizontal de tiros (1, 2, 3...)
│       │   ├── advice-card/        # Tarjeta "puedes mejorar" + desplegable "Intenta esto"
│       │   ├── metric-card/        # Tarjeta métrica: título, valor, frase, chip semáforo
│       │   ├── action-bar/         # Barra fija abajo con botón(es) de acción principal
│       │   └── phone-frame/        # Contenedor tipo celular (max ~430px) que envuelve la app
│       │
│       ├── services/
│       │   ├── analyze.service.ts  # POST /analyze, GET /analyze/{id}
│       │   ├── history.service.ts  # GET/POST /history, GET /history/{id}
│       │   ├── compare.service.ts  # POST /compare
│       │   └── advice.service.ts   # Consejos de IA que devuelve el back
│       │
│       ├── mocks/
│       │   └── fixtures/           # JSON de ejemplo fiel al contrato (fallback de demo)
│       │       ├── analyze-result.mock.json
│       │       ├── history.mock.json
│       │       └── compare.mock.json
│       │
│       ├── state/              # Servicios RxJS (BehaviorSubject): historial, racha, config, user_id
│       │   ├── app-state.service.ts
│       │   └── session-config.service.ts
│       │
│       ├── lib/                # Lógica pura, sin dependencias de Angular
│       │   ├── overlay.ts      # Dibujo de esqueleto/ángulos en canvas
│       │   ├── streak.ts       # Cálculo de racha a partir del historial
│       │   └── score.ts        # Interpolación/display del puntaje 0-100
│       │
│       └── models/             # Interfaces TypeScript del contrato de datos
│           ├── analyze.model.ts
│           ├── history.model.ts
│           └── compare.model.ts
│
├── environments/
│   ├── environment.ts          # { apiBaseUrl: process.env['VITE_API_BASE_URL'] ?? 'http://localhost:8000' }
│   └── environment.prod.ts
│
└── package.json
```

## Convenciones

- Componentes: kebab-case con sufijo de tipo (`resultados.component.ts`)
- Servicios: sufijo `.service.ts`
- Un componente por carpeta
- Pantallas nombradas igual que en el documento de reqs (P1 Inicio, P2 Configuración…) en comentarios/rutas
- `user_id` anónimo: UUID generado y persistido en `electron-store` (o `localStorage` como fallback)
- Diálogo nativo de archivos: vive en `electron/main.ts`, expuesto vía `preload.ts` + IPC — **no usar `<input type="file">` web**
- Coordenadas de landmarks: siempre normalizadas 0–1; escalar en `overlay.ts`

## Routing (Angular Router)

```
/                   → P1 Inicio
/configuracion      → P2 Configuración
/subir              → P3 Subir / Grabar
/recortar           → P4 Recortar
/procesando/:id     → P5 Procesando
/resultados/:id     → P6 Resultados
/tiro/:id/:shotIdx  → P7 Frame del tiro
/historial          → P8 Historial
/comparar           → P9 Comparar
```
