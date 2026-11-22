# Manual de identidad — MiFicha

**Versión:** 1.0 · noviembre 2026  
**Dominio:** [mificha.mx](https://www.mificha.mx)  
**Contacto:** hola@mificha.mx · Querétaro, México  

Este documento es la fuente de verdad para diseñadores, agencias y otras IAs. Prioriza lo que ya usa el producto en código y assets oficiales.

---

## 1. Qué es la marca

**MiFicha** es la ficha digital del jugador de futbol base / amateur en México.

- La arma el **tutor** (papá/mamá o representante).
- El tutor decide si sale en **Explorar**.
- Se comparte por **WhatsApp** y link `MF-`.
- Hoy el objetivo no es “prometer scouts”: es **llenar la base de México**.

**Una línea:**  
*La ficha de tu hijo, en un solo lugar.*

**No somos:** red social del club, marketplace de promesas, app “AI-powered talent discovery”.

---

## 2. Nombre y escritura

| Correcto | Incorrecto |
|---|---|
| MiFicha | Mi Ficha (salvo tipografía con espacio visual en UI antigua) |
| MiFicha | mi ficha, MIFICHA, Mi-Ficha, MyFicha |
| mificha.mx | mificha.com (no usar) |

**Wordmark tipográfico (UI / texto):**  
`Mi` en peso normal + `Ficha` en **negrita**. Color de marca `#1B4F8C` sobre fondos claros; blanco sobre fondos oscuros.

Ejemplo mental: **Mi**Ficha (la F mayúscula inicia la parte en bold).

---

## 3. Logo (símbolo)

### 3.1 Descripción

Monograma **MF** geométrico, silueta de escudo / ficha:

- Azul navy de marca.
- Un **punto mint** a la derecha de la barra media de la **F** (detalle obligatorio; no omitirlo).
- Líneas angulares, grosor constante, estilo stencil / crest moderno.
- Sin texto dentro del escudo.

### 3.2 Archivos oficiales (usar estos, no redibujar)

| Uso | Ruta |
|---|---|
| **Kit completo** (PNG HD + SVG + lockups) | `docs/brand/kit/` |
| Escudo solo (UI, headers) | `public/brand/mificha-icon.png` |
| App / favicon / PWA (escudo en canvas claro) | `public/brand/mificha-app-icon.png` |
| Favicon SVG | `public/brand/mificha-favicon.svg` |
| OG / redes genérico | `public/marketing/og-default.png` |

**Regla de oro para otras IAs:**  
Adjuntar `mificha-app-icon.png` o `mificha-icon.png` como referencia y pedir: *“usa este monograma exacto; no inventes otro logo”*. Si la IA redibuja el escudo, el resultado **no es válido**.

### 3.3 Lockup

Orden preferido:

1. Escudo a la izquierda  
2. Espacio ~0.25× ancho del escudo  
3. Wordmark `Mi` + `Ficha`

Sobre fondo oscuro: escudo en versión clara (invert / blanco) + wordmark blanco.  
Sobre fondo claro: escudo color + wordmark `#1B4F8C`.

### 3.4 Área de respeto

Dejar vacío mínimo = **altura del punto mint** alrededor del escudo (o ~⅛ de la altura del símbolo). No pegar a bordes de stories, ni a otros logos de patrocinadores.

### 3.5 Prohibido

- Redibujar el MF “parecido”.
- Quitar el punto mint.
- Deformar, rotar, añadir sombra 3D, glow neón, outline grueso.
- Meter el escudo dentro de otro escudo / medalla / sticker.
- Usar logos de patrocinadores (GPH, CRACKS, etc.) como si fueran MiFicha.
- Wordmark con underline ondulado inventado.
- “MiFicha” en tipografía display genérica como reemplazo del logo.

---

## 4. Color

### 4.1 Primarios

| Nombre | Hex | Uso |
|---|---|---|
| Brand | `#1B4F8C` | Logo tipográfico, links, CTAs principales de marca |
| Brand dark | `#0F2D52` | Fondos hero oscuros, footers, overlays |
| Brand soft | `#E8EEF5` | Chips, fondos suaves |

### 4.2 Acento

| Nombre | Hex | Uso |
|---|---|---|
| Accent (mint) | `#34D399` | Punto del logo, reglas, progreso, acentos |
| Accent bright | `#6EE7B7` | Highlights |
| Accent dark | `#059669` | CTA verde / éxito |

### 4.3 Neutros

| Nombre | Hex / valor | Uso |
|---|---|---|
| Canvas | `#F3F2EF` | Fondo de página |
| Surface | `#FFFFFF` | Cards / paneles |
| Text | `#191919` | Cuerpo |
| Text secondary | `rgba(0,0,0,0.6)` | Apoyo |
| Border | `#D8D8D8` | Bordes |

### 4.4 Socio GPH (solo alianzas / CTAs GPH)

| Nombre | Hex |
|---|---|
| GPH naranja | `#F54200` |
| GPH hot | `#FF6A22` |
| GPH ink | `#111111` |

**No** mezclar naranja GPH como color “de MiFicha” en piezas de marca pura.

### 4.5 Evitar (sesgos típicos de IA)

- Morado / indigo gradients.
- Glow neón.
- Cream + terracotta “editorial AI”.
- Dark mode púrpura.
- Pills redondeados con sombras multilayers como identidad.

---

## 5. Tipografía

### 5.1 Producto (web)

- Familia: **Inter** (sans geométrica).
- Jerarquía: semibold/bold en títulos; regular en cuerpo.
- Tracking ligeramente negativo en headlines grandes.

### 5.2 Piezas sociales / ads (recomendado)

Si Inter no está disponible en la otra herramienta:

- **Headline:** sans bold geométrica (Montserrat Bold, Geist Bold, o similar).
- **Cuerpo:** sans regular legible.
- Evitar: script, serif display “luxury”, Comic Sans, tipografías “tech neon”.

### 5.3 Wordmark en imagen

Si no puedes incrustar el PNG del escudo + texto tipográfico real:

1. Preferir **escudo PNG oficial + “MiFicha”** en sans.
2. `Mi` regular / `Ficha` bold.
3. Nunca subrayar con wave verde inventada.

---

## 6. Voz y tono

### 6.1 Cómo hablamos

- Español de **México**.
- Corto. Concreto. De papá a papá en el estacionamiento.
- Tú / tu hijo / los papás del equipo / WhatsApp / Explorar / mapa.
- Honestos: *todavía hay pocas fichas*; *hoy no prometemos clubes*.

### 6.2 Cómo no hablamos

Evitar o reescribir si aparece:

- plataforma, ecosistema, volumen, etapa fundacional, directorio serio  
- consentimientos (mejor: **firma** / **autorización**)  
- organizers, señal, pitch, “sumar a la red”  
- triadas vacías: “más X, más Y, más Z”  
- em dash dramático y claims de scout/club prematuros  

### 6.3 Frases de marca (aprobadas)

- *La ficha digital de tu hijo*
- *Estamos llenando la base de México*
- *Tu hijo juega. ¿Dónde está su ficha?*
- *Ficha digital gratis*
- *Tú armas la ficha. Tú decides si sale en Explorar.*
- *Fundador 2026* (badge de quienes publican temprano en Explorar)

### 6.4 CTAs

Preferidos: **Crear ficha** · **Ir a firmar** · **Invitar al equipo** · **Leer más**  
Evitar: “Únete a la revolución”, “Descubre el talento”, “Be part of something bigger”.

---

## 7. Imagen y composición

### 7.1 Qué mostrar

- Cancha real, pasto, atardecer / luz natural, estadio con gente (atmósfera).
- **Una** portería si aparece (nunca dos juntas por error de IA).
- Balón solo si no compite con el texto (mejor esquina opuesta al headline).
- Foto / ficha real de jugador solo con permiso.

### 7.2 Qué no mostrar

- Collages, mockups UI flotantes, stickers, badges inventados.
- Logos de sponsors como hero de marca MiFicha.
- Balón tapando el headline.
- Porterías duplicadas / geometría absurda de cancha.

### 7.3 Layout tipo anuncio (1:1 Instagram / Meta)

1. Foto full-bleed.  
2. Overlay navy suave solo donde va el texto (`#0F2D52` a ~60–70% opacidad).  
3. Headline grande, izquierda o centro-alto, mucho aire.  
4. Regla mint fina (`#34D399`).  
5. Sublínea corta.  
6. Franja navy inferior (~15%) con **escudo oficial + wordmark**.  

Proporción creativo ads: **1:1** (feed) y **4:5** o **9:16** (stories/reels) con las mismas reglas.

---

## 8. Redes y pauta

### 8.1 Perfil Instagram (sugerido)

- Usuario: `@mificha.mx` (o el disponible más cercano)  
- Nombre: MiFicha  
- Bio:  
  `Ficha digital del jugador de futbol base en México.`  
  `Arma la tuya → link en bio`  
  `Todavía llenamos la base.`  
- Foto de perfil: `mificha-app-icon.png`  
- Link:  
  `https://www.mificha.mx/fut/entrar?next=/fut/tutor&utm_source=instagram&utm_medium=social&utm_campaign=bio`

### 8.2 Pauta Meta — link de destino preferido

```
https://www.mificha.mx/fut/entrar?next=/fut/tutor&utm_source=instagram&utm_medium=paid&utm_campaign=launch_base_mx
```

Objetivo de negocio a optimizar: **fichas creadas / firmas Explorar**, no vanidad (likes).

---

## 9. Aliados (uso correcto)

Patrocinadores y partners (GPH, CRACKS, etc.) viven en **rail de aliados / footer**, no como marca co-igual en el hero de MiFicha, salvo pieza co-branded explícita.

En co-brand:

- Escudo MiFicha + wordmark a la izquierda o arriba.  
- Logo del partner con su manual.  
- Separador claro; no fusionar logos.

---

## 10. Checklist rápido antes de publicar

- [ ] ¿El escudo es el PNG oficial (con punto mint)?  
- [ ] ¿Wordmark Mi + **Ficha**?  
- [ ] ¿Colores solo de la paleta?  
- [ ] ¿Texto suena a papá mexicano, no a pitch?  
- [ ] ¿El balón / foto no tapa el mensaje?  
- [ ] ¿Hay una sola portería (si aplica)?  
- [ ] ¿CTA único y link con UTM?  
- [ ] ¿No hay promesas de clubes/scouts que hoy no cumplimos?

---

## 11. Prompt listo para otra IA (copiar/pegar)

```
Eres diseñador de la marca MiFicha (futbol base, México).

LOGO: usa SOLO el archivo de referencia adjunto (monograma MF azul con punto mint). No redibujes el logo. Lockup = escudo + wordmark “Mi” regular + “Ficha” bold.

COLORES: navy #1B4F8C / #0F2D52, mint #34D399, texto #191919, canvas #F3F2EF. Sin morados, sin glow.

TONO: español de México, corto, de papá a papá. Evita jerga startup.

MENSAJE: “Tu hijo juega. ¿Dónde está su ficha?”
Sub: “Ficha digital gratis · Llenamos la base de México”

FORMATO: Instagram 1:1. Foto de cancha realista. Máximo UNA portería. Si hay balón, abajo-derecha, lejos del texto. Franja navy inferior con logo oficial. Sin stickers, sin UI fake, sin sponsors.
```

---

## 12. Metas de producto (contexto, no copy de ad)

Para no contradecir la misión en piezas largas:

| Meta | Target |
|---|---|
| Fichas | 2 000 |
| En Explorar (con firma) | 35% |
| Estados con gente | 3 (≥100 fichas c/u) |

Etapa actual: **llenar la base**. Luego: evaluaciones/video, torneos en la ficha, clubes/academias (sin prometer hoy).

---

*Fin del manual 1.0 — actualizar este archivo si cambian hex, logo o wordmark en el repo.*
