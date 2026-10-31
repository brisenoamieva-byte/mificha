function slugPart(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function diagnosisPdfFilename(
  firstName: string,
  lastName: string,
  evaluatedAt: string,
) {
  const who =
    [firstName, lastName].map(slugPart).filter(Boolean).join("-") || "jugador";
  const day = evaluatedAt.slice(0, 10);
  return `Diagnostico-GPH-${who}${day ? `-${day}` : ""}.pdf`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function isMobileShare() {
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

const PAGE_W_MM = 215.9;
const PAGE_H_MM = 279.4;
const MARGIN_MM = 10;
const CAPTURE_WIDTH_PX = 800;

function preparePdfClone(clone: HTMLElement) {
  clone.classList.add("diagnosis-pdf-clone");
  clone.style.width = `${CAPTURE_WIDTH_PX}px`;
  clone.style.maxWidth = `${CAPTURE_WIDTH_PX}px`;
  clone.style.height = "auto";
  clone.style.maxHeight = "none";
  clone.style.overflow = "visible";
  clone.style.border = "none";
  clone.style.borderRadius = "0";
  clone.style.boxShadow = "none";
  clone.style.background = "#ffffff";

  clone.querySelector(".diagnosis-report-toolbar")?.remove();

  clone.querySelectorAll("details").forEach((node) => {
    const details = node as HTMLDetailsElement;
    details.open = true;
    details.setAttribute("open", "");
    details.style.display = "block";
    const summary = details.querySelector("summary");
    if (summary) {
      const heading = clone.ownerDocument.createElement("p");
      heading.textContent = summary.textContent?.trim() ?? "";
      heading.style.cssText =
        "margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#1a1a1a";
      summary.replaceWith(heading);
    }
    Array.from(details.children).forEach((child) => {
      (child as HTMLElement).style.display = "block";
    });
  });

  clone.querySelectorAll(".diagnosis-report-signoff").forEach((node) => {
    const el = node as HTMLElement;
    el.classList.remove("hidden");
    el.style.display = "grid";
  });

  clone.querySelectorAll("video").forEach((node) => node.remove());
  clone.querySelectorAll(".overflow-x-auto").forEach((node) => {
    const el = node as HTMLElement;
    el.style.overflow = "visible";
    el.style.maxWidth = "100%";
  });

  clone.querySelectorAll("section").forEach((node) => {
    const el = node as HTMLElement;
    el.style.breakInside = "avoid";
    el.style.marginBottom = "8px";
  });
}

type PdfBlock = { top: number; bottom: number };

function collectKeepBlocks(
  clone: HTMLElement,
  scale: number,
  canvasHeight: number,
): PdfBlock[] {
  const origin = clone.getBoundingClientRect().top;
  const blocks: PdfBlock[] = [];
  const seen = new Set<string>();
  clone
    .querySelectorAll(
      "header, footer, section, tbody tr, ol, section .rounded-xl",
    )
    .forEach((el) => {
      const rect = el.getBoundingClientRect();
      const top = Math.round((rect.top - origin) * scale);
      const bottom = Math.round((rect.bottom - origin) * scale);
      if (bottom - top < 12) return;
      const key = `${top}:${bottom}`;
      if (seen.has(key)) return;
      seen.add(key);
      blocks.push({
        top: Math.max(0, top),
        bottom: Math.min(canvasHeight, bottom),
      });
    });
  return blocks.sort((a, b) => a.top - b.top || b.bottom - a.bottom);
}

function rowIsBlank(
  ctx: CanvasRenderingContext2D,
  width: number,
  y: number,
): boolean {
  const row = ctx.getImageData(0, y, width, 1).data;
  let ink = 0;
  for (let x = 0; x < width; x += 8) {
    const i = x * 4;
    if (row[i] < 248 || row[i + 1] < 248 || row[i + 2] < 248) ink += 1;
  }
  return ink < (width / 8) * 0.015;
}

function findWhiteGap(
  ctx: CanvasRenderingContext2D,
  width: number,
  fromY: number,
  ideal: number,
  earliest: number,
) {
  let run = 0;
  let best = -1;
  let bestRun = 0;
  for (let y = ideal; y >= earliest; y -= 1) {
    if (rowIsBlank(ctx, width, y)) {
      run += 1;
      if (run >= 24 && run >= bestRun) {
        bestRun = run;
        best = y + Math.floor(run / 2);
      }
    } else {
      run = 0;
    }
  }
  return best > fromY ? best : null;
}

function avoidOrphanTail(
  ctx: CanvasRenderingContext2D,
  width: number,
  fromY: number,
  end: number,
) {
  const tail = 140;
  if (end - fromY < tail + 80) return end;
  let top = -1;
  let bottom = -1;
  for (let y = end - 1; y >= end - tail; y -= 1) {
    if (!rowIsBlank(ctx, width, y)) {
      if (bottom < 0) bottom = y;
      top = y;
    }
  }
  if (top < 0 || bottom < 0) return end;
  if (bottom - top < 72 && top > fromY + 220 && rowIsBlank(ctx, width, top - 8)) {
    return top - 4;
  }
  return end;
}

function findPageEnd(
  ctx: CanvasRenderingContext2D,
  width: number,
  fromY: number,
  pagePx: number,
  canvasHeight: number,
  blocks: PdfBlock[],
) {
  const ideal = Math.min(fromY + pagePx, canvasHeight);
  if (ideal >= canvasHeight - 4) return canvasHeight;

  const earliest = fromY + Math.floor(pagePx * 0.28);

  const overflowing = blocks
    .filter(
      (block) =>
        block.top >= fromY - 2 &&
        block.top < ideal &&
        block.bottom > ideal + 6,
    )
    .sort((a, b) => a.top - b.top || a.bottom - b.bottom);

  for (const block of overflowing) {
    const leftover = ideal - block.top;
    if (leftover < Math.floor(pagePx * 0.22) && block.top >= earliest) {
      return Math.max(fromY + 8, block.top);
    }
    const height = block.bottom - block.top;
    if (height <= pagePx - 4 && block.top >= earliest) {
      return Math.max(fromY + 8, block.top);
    }
    const inner = blocks
      .filter(
        (child) =>
          child.top >= block.top + 8 &&
          child.bottom <= block.bottom &&
          child.top < ideal &&
          child.bottom > ideal + 6 &&
          child.bottom - child.top <= pagePx - 4 &&
          child.top >= earliest,
      )
      .sort((a, b) => a.top - b.top);
    if (inner[0]) return inner[0].top;
  }

  const gap = findWhiteGap(ctx, width, fromY, ideal, earliest);
  return avoidOrphanTail(ctx, width, fromY, gap ?? ideal);
}

function sliceCanvas(
  source: HTMLCanvasElement,
  y: number,
  height: number,
): HTMLCanvasElement {
  const page = source.ownerDocument.createElement("canvas");
  page.width = source.width;
  page.height = Math.max(1, height);
  const ctx = page.getContext("2d");
  if (!ctx) return page;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, page.width, page.height);
  ctx.drawImage(
    source,
    0,
    y,
    source.width,
    height,
    0,
    0,
    source.width,
    height,
  );
  return page;
}

async function waitForCloneAssets(clone: HTMLElement) {
  await document.fonts.ready.catch(() => undefined);
  const images = Array.from(clone.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return img.decode().catch(() => undefined);
    }),
  );
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export async function exportDiagnosisPdf(root: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${CAPTURE_WIDTH_PX}px`,
    pointerEvents: "none",
    zIndex: "-1",
    background: "#ffffff",
  });

  const clone = root.cloneNode(true) as HTMLElement;
  preparePdfClone(clone);
  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    await waitForCloneAssets(clone);

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: CAPTURE_WIDTH_PX,
      windowWidth: CAPTURE_WIDTH_PX,
      height: Math.ceil(clone.scrollHeight),
      windowHeight: Math.ceil(clone.scrollHeight),
      ignoreElements: (el) => el.tagName === "VIDEO",
    });

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("No se pudo leer el lienzo del PDF.");

    const scale = canvas.height / Math.max(1, clone.scrollHeight);
    const blocks = collectKeepBlocks(clone, scale, canvas.height);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    });
    const contentW = PAGE_W_MM - MARGIN_MM * 2;
    const contentH = PAGE_H_MM - MARGIN_MM * 2;
    const pagePx = Math.floor((contentH / contentW) * canvas.width);

    let y = 0;
    let pageIndex = 0;
    while (y < canvas.height - 2) {
      const end = findPageEnd(
        ctx,
        canvas.width,
        y,
        pagePx,
        canvas.height,
        blocks,
      );
      const sliceH = Math.max(1, end - y);
      const slice = sliceCanvas(canvas, y, sliceH);
      const sliceMm = (sliceH * contentW) / canvas.width;
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(
        slice.toDataURL("image/jpeg", 0.9),
        "JPEG",
        MARGIN_MM,
        MARGIN_MM,
        contentW,
        sliceMm,
      );
      pdf.setFontSize(8);
      pdf.setTextColor(140);
      pdf.text(
        `${filename.replace(/\.pdf$/i, "")}  ·  ${pageIndex + 1}`,
        PAGE_W_MM / 2,
        PAGE_H_MM - 5,
        { align: "center" },
      );
      y = end;
      pageIndex += 1;
      if (pageIndex > 40) break;
    }

    const blob = pdf.output("blob");
    const file = new File([blob], filename, { type: "application/pdf" });
    if (isMobileShare() && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Diagnóstico GPH",
          text: filename.replace(/\.pdf$/i, ""),
        });
        return "shared" as const;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return "shared" as const;
        }
      }
    }

    triggerDownload(blob, filename);
    return "downloaded" as const;
  } finally {
    host.remove();
  }
}
