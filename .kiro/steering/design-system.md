---
inclusion: always
---

# Sistema de diseño — BallIt

## Paleta

| Token | Valor | Uso |
|---|---|---|
| `brand-orange` | `#FF5A1F` | Botones principales, elementos interactivos clave |
| `navy` | `#1B2B4B` | Títulos |
| `cream` | `#FAFAF7` | Fondo general |
| `white` | `#FFFFFF` | Tarjetas, superficies elevadas |

Fondo general: crema/blanco, limpio. Nunca fondos oscuros a menos que sea el overlay de video.

## Contenedor

- Tipo "teléfono": `max-width: 430px`, centrado en pantallas grandes con `margin: 0 auto`.
- Responsive real en móvil (sin scroll horizontal).
- Barra de acción fija en la parte inferior (`position: fixed; bottom: 0`) en todos los flujos principales.

## Tipografía y tono

- Español, lenguaje simple y motivador, nunca técnico-frío.
- Siempre acompañar un número con su interpretación en lenguaje natural.
  - ✅ "Tu codo se abre 41° del torso; lo ideal es menos de 22°"
  - ❌ "Abducción: 41°"
- Títulos en azul marino (`navy`).

## Tarjetas

- Bordes redondeados (`border-radius: 16px` como mínimo).
- Sombra suave (`box-shadow: 0 2px 12px rgba(0,0,0,0.08)`).

## Botones

- Grandes, pensados para el pulgar (`min-height: 52px`, `padding: 0 24px`).
- Botón principal: fondo `brand-orange`, texto blanco, bordes redondeados.
- No usar botones pequeños en acciones críticas del flujo.

## Semáforo de veredicto

**Siempre icono + color, nunca solo color.**

| Estado | Icono | Color |
|---|---|---|
| Bueno | 🟢 | `#22C55E` (green-500) |
| Dudoso | 🟡 | `#EAB308` (yellow-500) |
| Malo | 🔴 | `#EF4444` (red-500) |

Este patrón se repite en:
- Chip de estado sobre el video
- Insignia del selector de tiro
- Puntaje general
- Gráfica de progreso

## Overlay sobre video (pieza más importante del producto)

El overlay se renderiza en un `<canvas>` sincronizado con el `<video>` en tiempo real.

### Esqueleto
- Articulaciones: hombros, codos, muñecas, caderas, rodillas, tobillos.
- El **brazo de tiro** se resalta visualmente (línea más gruesa, color `brand-orange`) respecto al resto del cuerpo (línea gris translúcida).

### Ángulos
- Arco de ángulo dibujado en la articulación relevante.
- Etiqueta de grados pegada a la articulación (ej. `"Codo 41°"`), coloreada según semáforo.
- Nunca mostrar solo el grado sin la frase explicativa.

### Chip de estado
- Superpuesto en la esquina superior del video.
- Muestra: icono semáforo + veredicto + timestamp/frame actual.

### Frase en lenguaje natural
- Junto al número, siempre. Ejemplo: `"Tu codo se separa 41° del torso; lo ideal es menos de 22°"`.

### Interruptores (toggles)
- Tres toggles para activar/desactivar capas:
  1. Esqueleto
  2. Ángulos
  3. Estela del brazo

## Componentes reutilizables clave

- `<VerdictChip>` — semáforo inline (icono + color + etiqueta).
- `<ShotSelector>` — selector horizontal de tiros con insignia de veredicto.
- `<MetricCard>` — tarjeta con título, valor numérico, frase explicativa, y chip de semáforo.
- `<OverlayCanvas>` — canvas que se monta sobre el `<video>` y dibuja esqueleto + ángulos.
- `<ActionBar>` — barra fija en la parte inferior con el/los botones de acción principal.
