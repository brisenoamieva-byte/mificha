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

export async function exportDiagnosisPdf(root: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(root, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: Math.max(root.scrollWidth, 800),
    onclone(_doc, clone) {
      clone.querySelector(".diagnosis-report-toolbar")?.remove();
    },
  });

  const img = canvas.toDataURL("image/jpeg", 0.86);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgH = (canvas.height * pageW) / canvas.width;

  let offset = 0;
  let left = imgH;
  while (left > 0) {
    if (offset < 0) pdf.addPage();
    pdf.addImage(img, "JPEG", 0, offset, pageW, imgH);
    left -= pageH;
    offset -= pageH;
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
}
