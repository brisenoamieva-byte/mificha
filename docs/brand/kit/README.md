# Kit de marca MiFicha

Exportado desde el escudo oficial del producto (`public/brand/mificha-icon.png`).

## Contenido

### `01-escudo/`
Monograma MF (azul + punto mint). Fondo transparente.

| Archivo | Uso |
|---|---|
| `mificha-escudo.svg` | **Vector color** (impresiones, Canva, Figma) |
| `mificha-escudo-blanco.svg` | **Vector** blanco + mint (fondos oscuros) |
| `mificha-escudo-256.png` … `2048.png` | Raster alta resolución |
| `mificha-escudo-blanco-2048.png` | Raster blanco + mint |
| `mificha-escudo-master.png` | Master PNG del producto |

### `02-app-icon/`
Escudo sobre canvas claro redondeado (perfil IG, PWA, App Store).

| Archivo | Uso |
|---|---|
| `mificha-app-icon-1024.png` | Perfil Instagram / App Store |
| `mificha-app-icon-2048.png` | Máxima resolución |

### `03-lockup/`
Escudo + wordmark **Mi** (regular) + **Ficha** (bold).

| Archivo | Uso |
|---|---|
| `mificha-lockup-horizontal.svg` | Vector sin fondo |
| `…-on-light.svg` / `.png` | Fondos claros |
| `…-on-dark.svg` / `.png` | Fondos oscuros |

### Colores

| Token | Hex |
|---|---|
| Brand | `#1B4F8C` |
| Brand dark | `#0F2D52` |
| Accent mint | `#34D399` |
| Canvas app icon | `#F4F7FB` |

## Reglas rápidas

1. No redibujar el monograma: usar estos archivos.
2. No quitar el punto mint.
3. Wordmark: Mi + **Ficha**.
4. Manual completo: [`../manual-identidad-mificha.md`](../manual-identidad-mificha.md)

## Regenerar

```bash
node scripts/export-brand-kit.mjs
```
