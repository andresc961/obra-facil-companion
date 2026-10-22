export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function deliverFile(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (e) { if (e instanceof DOMException && e.name === "AbortError") return; }
  }
  downloadBlob(blob, filename);
}

/** Share PDF + message together (phone share sheet → WhatsApp). Desktop: download PDF and open WhatsApp with the message. */
export async function sendPdfWithMessage(blob: Blob, filename: string, text: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file], text })) {
    try { await navigator.share({ files: [file], text }); return; }
    catch (e) { if (e instanceof DOMException && e.name === "AbortError") return; }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  downloadBlob(blob, filename);
}
