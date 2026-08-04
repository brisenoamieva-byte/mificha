# Acta en cancha — Fase 1 (spec de implementación)

**Estado:** listo para construir  
**Alcance:** captura **post-pito** (no reloj live), alineaciones, timeline de eventos, firmas QR, publicación a fichas  
**Fuera de Fase 1:** reloj en vivo, offline-first, rol `referee` en Auth, VAR, causales FMF, PDF arbitral completo  

Referencias de industria: FIFA FCMS (eventos sobre hoja de partido) · Liga MX SIID / informe arbitral (alineación + cronología + cierre oficial).

---

## 1. Objetivo de producto

El árbitro (o mesa) construye el **acta oficial** del partido en 10–15 min después del silbatazo:

1. Confirma alineaciones (titulares + banca)  
2. Registra hechos: gol, asistencia, amarilla, roja, cambio  
3. Revisa totales derivados  
4. Cierra y pide **firma digital** de un representante de cada equipo  
5. Al quedar firmada → MiFicha publica marcador + `match_stats` + avisos a tutores  

**Gobernanza sin cambio:** academias no editan marcador ni acta. El canal de captura del organizador pasa de “formulario interno” a “sesión de árbitro”.

---

## 2. Principios anti-error

| Regla | Por qué |
|---|---|
| Solo jugadores de la alineación | No se inventan nombres |
| Eventos append-only | Corregir = anular + motivo, no borrar |
| Marcador derivado de goles | No se tipea el 3-1 a mano |
| Firmas sobre hash del acta | Evidencia de qué se firmó |
| Tokens de un solo uso / TTL corto | Links QR no reutilizables |
| Publicación atómica | O se publica todo, o nada |

---

## 3. Modelo conceptual

```
platform fixture (matches is_official)
        │
        ▼
 match_acta_sessions          ← 1 sesión de acta por partido
   ├── match_lineups          ← titulares/banca por lado
   ├── match_events           ← timeline (append-only)
   └── match_signatures       ← árbitro + 2 delegados
        │
        ▼ publish
 matches.result / goals_* / result_locked_at / acta_published_at
 match_stats (por jugador MiFicha)
 tutor notify + achievements
```

**Compatibilidad con el modelo actual:**  
Hoy cada `matches` es por academia (`academy_id` + `opponent` texto).  
Fase 1 ancla la sesión a **un** `home_match_id` (fixture oficial de la academia “local” en MiFicha).  
El visitante puede ser:

- otra academia en MiFicha (`away_academy_id` + opcional `away_match_id`), o  
- solo nombre (`opponent_name`) con alineación manual (dorsal + nombre) — firmas sí; stats a ficha solo del lado con `player_id`.

---

## 4. Máquina de estados

```
lineup → capturing → review → pending_signatures → published
                                              ↘ disputed → (organizador resuelve) → published | cancelled
```

| Estado | Quién actúa | Qué se puede hacer |
|---|---|---|
| `lineup` | Árbitro / academias vía link | Editar alineaciones |
| `capturing` | Árbitro | Agregar / anular eventos |
| `review` | Árbitro | Ver totales; volver a capturar o cerrar |
| `pending_signatures` | Delegados | Aceptar u objetar (árbitro ya firmó cierre) |
| `published` | Sistema | Inmutable (salvo admin interno) |
| `disputed` | Organizador | Resolver objeción |
| `cancelled` | Organizador | Descartar sesión |

Transiciones permitidas: ver `src/lib/match-acta.ts` (`ACTA_STATUS_TRANSITIONS`).

---

## 5. Pantallas (wireframes)

Rutas sugeridas (App Router):

| Ruta | Auth | Propósito |
|---|---|---|
| `/arbitro/[token]` | token URL | Shell del árbitro |
| `/arbitro/[token]/alineacion` | token | Confirmar planteles |
| `/arbitro/[token]/captura` | token | Timeline de eventos |
| `/arbitro/[token]/revision` | token | Totales + cerrar |
| `/firmar/[token]` | token | Firma delegado (móvil) |
| `/interno/jornadas` (extensión) | pitch-access | Crear sesión / ver estado / resolver disputa |

### 5.1 Shell árbitro — `/arbitro/[token]`

```
┌─────────────────────────────────────┐
│ MiFicha · Acta oficial              │
│ Sub-15 · Local vs Visitante         │
│ 14 mar 2026 · Jurica                │
│ Estado: CAPTURANDO                  │
├─────────────────────────────────────┤
│ [Alineación] [Captura] [Revisión]   │
├─────────────────────────────────────┤
│ (contenido de la fase activa)       │
└─────────────────────────────────────┘
```

- Token en URL; sin login de usuario (PIN opcional Fase 1.1).  
- Tipografía grande, botones ≥48px, contraste alto (sol / cancha).  
- Si `published` → solo lectura + link a fichas.

### 5.2 Alineación — `/arbitro/[token]/alineacion`

```
┌────────────── Local ──────────────┐  ┌──────────── Visitante ──────────┐
│ Academia Gallos                   │  │ Instituto Cervantes             │
│ Titulares (11)                    │  │ Titulares (11)                  │
│ [9] S. Hernández     [titular ▾]  │  │ [10] …                          │
│ [1] Portero          [titular ▾]  │  │ …                               │
│ Banca                             │  │ Banca                           │
│ [12] …               [banca ▾]    │  │ …                               │
│ [+ Agregar del plantel]           │  │ [+ Agregar] / nombre manual     │
└───────────────────────────────────┘  └─────────────────────────────────┘
         [ Continuar a captura → ]
```

Reglas UI:
- Local: solo jugadores de `home_academy_id` con plantel activo.  
- Visitante en MiFicha: igual desde `away_academy_id`.  
- Visitante externo: dorsal + apellido (texto); sin sync a ficha.  
- Mínimo 7 titulares por lado para continuar (configurable).  
- Confirmar alineación → `lineup` → `capturing`.

### 5.3 Captura — `/arbitro/[token]/captura`

Flujo en **3 taps** (no formulario largo):

```
Paso 1 · Equipo          Paso 2 · Jugador           Paso 3 · Acción
┌─────────────┐         ┌──────────────────┐       ┌──────────────────┐
│  LOCAL      │         │  9  Hernández    │       │  ⚽ GOL           │
│  VISITANTE  │         │  10 …            │       │  🅰️ ASISTENCIA   │
└─────────────┘         │  7  …            │       │  🟨 AMARILLA     │
                        │  (solo alineados) │       │  🟥 ROJA         │
                        └──────────────────┘       │  🔄 CAMBIO       │
                                                   └──────────────────┘
                         Minuto: [67]  (+1 stoppage opcional)
                         [ Confirmar ]     Undo 10s si fue el último
```

Timeline a la izquierda / abajo (cronológico inverso):

```
67' ⚽ 9 Hernández (Local) · asiste 10 …
64' 🟨 5 … (Visitante)
…
[ Anular ] en cada fila → pide motivo → voided_at
```

Reglas:
- Segunda amarilla al mismo jugador → auto-sugerir roja (doble amarilla) o bloquear otra amarilla.  
- Cambio: elegir quién sale (titular en cancha) y quién entra (banca).  
- Gol en propia: `own_goal` cuenta para marcador del rival, no suma gol al goleador en ficha (sí registro en timeline).

### 5.4 Revisión — `/arbitro/[token]/revision`

```
Marcador derivado:  Local 3 — 1 Visitante

Totales Local                    Totales Visitante
9 Hernández  2G 1A 78' 1🟨       …
…

Timeline completa (read-only aquí, o “Volver a captura”)

[ Volver a captura ]   [ Cerrar acta y pedir firmas ]
```

Al cerrar:
1. Árbitro ingresa nombre + confirma  
2. Se guarda firma `referee` + `payload_hash`  
3. Estado → `pending_signatures`  
4. Muestra 2 QR grandes: Local / Visitante  

### 5.5 Firma delegado — `/firmar/[token]`

```
┌─────────────────────────────────────┐
│ Confirmación de acta · Local        │
│ Gallos 3 — 1 Cervantes              │
│ (resumen: goles, tarjetas, cambios) │
├─────────────────────────────────────┤
│ Nombre del representante            │
│ [________________________]          │
│ Cargo (opcional)                    │
│ [________________________]          │
│                                     │
│ [ ✓ Confirmo el acta ]              │
│ [ ✎ Objetar ]                       │
│    motivo obligatorio si objeta     │
└─────────────────────────────────────┘
```

- Token distinto por lado (`home_sign_token` / `away_sign_token`), TTL 2 h.  
- Un solo uso al aceptar/objetar.  
- Si ambos aceptan → `published` (job/API publica).  
- Si alguno objeta → `disputed`.

### 5.6 Interno — extensión jornadas

En cada fixture oficial:

```
Acta en cancha:  [ Crear sesión ]  estado · link árbitro · copiar
Si disputed:     [ Ver objeción ] [ Forzar publicar ] [ Cancelar sesión ]
```

El formulario actual `OfficialActaEntry` sigue como **fallback** si no hay sesión / mesa sin celular.

---

## 6. APIs (contratos)

Base: service role + validación de token hasheado (no guardar token en claro).

| Método | Ruta | Auth | Acción |
|---|---|---|---|
| `POST` | `/fut/api/interno/acta-sessions` | pitch-access | Crear sesión para `home_match_id` |
| `GET` | `/fut/api/interno/acta-sessions?home_match_id=` | pitch-access | Estado de sesión |
| `GET` | `/fut/api/acta/[token]` | token árbitro | Cargar sesión + lineups + events + planteles |
| `PUT` | `/fut/api/acta/[token]/lineup` | token árbitro | Upsert alineación (`start_capturing?`) |
| `POST` | `/fut/api/acta/[token]/status` | token árbitro | `capturing` \| `review` |
| `POST` | `/fut/api/acta/[token]/events` | token árbitro | Agregar evento |
| `POST` | `/fut/api/acta/[token]/events/[id]/void` | token árbitro | Anular evento |
| `POST` | `/fut/api/acta/[token]/close` | token árbitro | Cerrar → pending_signatures + QR links |
| `GET` | `/fut/api/firmar/[token]` | token firma | Resumen para delegado |
| `POST` | `/fut/api/firmar/[token]` | token firma | accept \| object |
| `POST` | `/fut/api/interno/acta-sessions/[id]/publish` | pitch-access | Publicar (también auto al 2º accept) |
| `POST` | `/fut/api/interno/acta-sessions/[id]/resolve` | pitch-access | Resolver disputa |

### Publicación (efecto en tablas actuales)

Al pasar a `published`:

1. Calcular `goals_for` / `goals_against` / `result` desde eventos no anulados.  
2. Set `result_locked_at = now()` si vacío.  
3. Upsert `match_stats` por `player_id` (solo filas con player_id):
   - goals, assists, yellow_cards, red_cards  
   - minutes_played: derivar de titulares + cambios (90' default; configurable)  
   - `captured_by = 'admin'` (o futuro `'referee'`)  
4. Set `acta_published_at = now()`, `status = 'completed'`.  
5. Si existe `away_match_id`, espejo invertido del marcador + stats del lado visitante.  
6. `evaluateAchievementsAfterActa` + notificación tutores (cerrar hueco del flujo actual).  
7. Marcar sesión `published_at` + guardar `payload_hash` final.

---

## 7. Derivación de minutos (Fase 1 simple)

- Titular sin cambio de salida: `90`  
- Titular sustituido en minuto `M`: `M`  
- Suplente entra en `M`: `90 - M`  
- Expulsado en `M`: minutos hasta `M`  
- Si no hubo cambios registrados: todos los titulares `90`, banca `0`  

Documentar en UI: “Minutos estimados por alineación/cambios”.

---

## 8. Seguridad

- Tokens: `crypto.randomBytes(32)` → URL; en DB solo `sha256`.  
- Rate limit por IP en `/api/firmar` y `/api/acta`.  
- No exponer plantel completo sin token válido.  
- RLS: tablas de acta **sin acceso anon**; solo service role / funciones security definer.  
- Auditoría: `match_signatures` inmutables (no UPDATE/DELETE para no-admin).

---

## 9. Criterios de aceptación (Fase 1)

- [ ] Crear sesión desde interno para un fixture oficial  
- [ ] Árbitro confirma alineación local (≥7) y visitante  
- [ ] Registrar gol + asistencia + amarilla + cambio + anulación con motivo  
- [ ] Marcador en revisión = suma de goles / autogoles  
- [ ] Cierre genera 2 QR; ambos delegados firman en móvil  
- [ ] Tras 2 aceptaciones, `match_stats` y ficha pública reflejan el acta  
- [ ] Una objeción deja `disputed` y **no** publica a fichas  
- [ ] Academia sigue sin poder editar goles/tarjetas en UI dashboard  

---

## 10. Orden de implementación sugerido

1. Aplicar `supabase/match-acta-session.sql` en Supabase  
2. `src/lib/match-acta.ts` (ya incluido) + tipos en `database.ts`  
3. APIs token + create session (interno)  
4. UI `/arbitro/...` captura + revisión  
5. UI `/firmar/...`  
6. Publish pipeline (reusar lógica de `/api/interno/fixtures/acta`)  
7. Extender panel jornadas  
8. Piloto 1 partido real en Querétaro  

---

## 11. Estimación

| Bloque | Esfuerzo |
|---|---|
| SQL + lib + APIs | 2–3 días |
| UI árbitro (alineación + captura + revisión) | 3–4 días |
| UI firmas + publish | 2 días |
| Interno + QA cancha | 1–2 días |
| **Total** | **~8–11 días** |

---

## 12. Archivos de este deliverable

| Archivo | Contenido |
|---|---|
| `docs/acta-en-cancha-fase-1.md` | Este spec |
| `supabase/match-acta-session.sql` | Migración ejecutable |
| `src/lib/match-acta.ts` | Estados, eventos, helpers de dominio |
