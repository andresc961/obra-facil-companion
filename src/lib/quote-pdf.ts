import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type RGB } from "pdf-lib";
import type { Quote } from "@/lib/quote.functions";
import type { CompanyBrand } from "@/lib/quote-branding";

const currency = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const printable = (s: string) => s.replace(/[\u2010-\u2015]/g, "-").replace(/[^\x20-\x7E\xA0-\xFF\n]/g, "");

const W = 595.28, H = 841.89, M = 48, R = W - M;
const INK = rgb(0.07, 0.09, 0.15);
const MUTED = rgb(0.42, 0.45, 0.5);
const LINE = rgb(0.86, 0.88, 0.9);
const ZEBRA = rgb(0.965, 0.97, 0.975);
const NEUTRAL: [number, number, number] = [0.17, 0.2, 0.26];

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  for (const paragraph of printable(text).split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      for (const letter of (line ? " " : "") + word) {
        if (font.widthOfTextAtSize(line + letter, size) > width) { lines.push(line); line = letter.trim(); continue; }
        line += letter;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Dominant saturated color of the logo, darkened enough for white text. Falls back to neutral slate. */
async function brandColor(dataUrl: string): Promise<[number, number, number]> {
  try {
    if (typeof document === "undefined") return NEUTRAL;
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = c.height = 48;
    const ctx = c.getContext("2d");
    if (!ctx) return NEUTRAL;
    ctx.drawImage(img, 0, 0, 48, 48);
    const d = ctx.getImageData(0, 0, 48, 48).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) {
      const [pr, pg, pb, a] = [d[i], d[i + 1], d[i + 2], d[i + 3]];
      const max = Math.max(pr, pg, pb), min = Math.min(pr, pg, pb);
      if (a < 200 || max - min < 40 || max < 40) continue;
      r += pr; g += pg; b += pb; n++;
    }
    if (n < 20) return NEUTRAL;
    let col: [number, number, number] = [r / n / 255, g / n / 255, b / n / 255];
    const lum = () => 0.2126 * col[0] + 0.7152 * col[1] + 0.0722 * col[2];
    while (lum() > 0.42) col = col.map((v) => v * 0.88) as [number, number, number];
    return col;
  } catch { return NEUTRAL; }
}

async function embedLogo(pdf: PDFDocument, dataUrl: string): Promise<PDFImage> {
  try { return /^data:image\/jpe?g/i.test(dataUrl) ? await pdf.embedJpg(dataUrl) : await pdf.embedPng(dataUrl); }
  catch { throw new Error("No pudimos incluir el logo. Sube de nuevo la imagen (PNG o JPG) o desactiva los datos de empresa."); }
}

export async function createQuotePdf(quote: Quote, language: "en" | "es", brand: CompanyBrand | null) {
  const en = language === "en";
  const t = en
    ? { doc: "ESTIMATE", for: "PREPARED FOR", date: "DATE", no: "ESTIMATE NO.", desc: "DESCRIPTION", qty: "QTY", unit: "UNIT PRICE", amt: "AMOUNT", sub: "Subtotal", total: "TOTAL", notes: "Notes & terms", valid: "This estimate is valid for 30 days.", thanks: "Thank you for your business!" }
    : { doc: "PRESUPUESTO", for: "PREPARADO PARA", date: "FECHA", no: "PRESUPUESTO N.º", desc: "DESCRIPCIÓN", qty: "CANT.", unit: "PRECIO UNIT.", amt: "IMPORTE", sub: "Subtotal", total: "TOTAL", notes: "Notas y condiciones", valid: "Este presupuesto es válido por 30 días.", thanks: "¡Gracias por su confianza!" };

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  pdf.setTitle(printable(quote.project_title));
  pdf.setAuthor(printable(brand?.company_name || "ObraFácil"));
  pdf.setSubject(en ? "Construction estimate" : "Presupuesto de obra");

  const logo = brand?.logo_url ? await embedLogo(pdf, brand.logo_url) : null;
  const [ar, ag, ab] = brand?.logo_url ? await brandColor(brand.logo_url) : NEUTRAL;
  const ACCENT: RGB = rgb(ar, ag, ab);
  const TINT: RGB = rgb(1 - (1 - ar) * 0.1, 1 - (1 - ag) * 0.1, 1 - (1 - ab) * 0.1);
  const WHITE = rgb(1, 1, 1);

  const now = new Date();
  const dateStr = now.toLocaleDateString(en ? "en-US" : "es-US", { year: "numeric", month: "long", day: "numeric" });
  const number = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

  const draw = (page: ReturnType<PDFDocument["addPage"]>, s: string, x: number, y: number, size: number, font = regular, color: RGB = INK) =>
    page.drawText(printable(s), { x, y, size, font, color });
  const drawRight = (page: ReturnType<PDFDocument["addPage"]>, s: string, x: number, y: number, size: number, font = regular, color: RGB = INK) =>
    draw(page, s, x - font.widthOfTextAtSize(printable(s), size), y, size, font, color);

  // Columns
  const cDesc = M + 10, cQty = 360, cUnit = 455, cAmt = R - 10, descW = cQty - 40 - cDesc;

  let page = pdf.addPage([W, H]);
  let y = H;

  const tableHeader = () => {
    page.drawRectangle({ x: M, y: y - 24, width: R - M, height: 24, color: ACCENT });
    draw(page, t.desc, cDesc, y - 16, 8.5, bold, WHITE);
    drawRight(page, t.qty, cQty, y - 16, 8.5, bold, WHITE);
    drawRight(page, t.unit, cUnit, y - 16, 8.5, bold, WHITE);
    drawRight(page, t.amt, cAmt, y - 16, 8.5, bold, WHITE);
    y -= 24;
  };
  const continuation = () => {
    page = pdf.addPage([W, H]);
    page.drawRectangle({ x: 0, y: H - 6, width: W, height: 6, color: ACCENT });
    y = H - 40;
    draw(page, `${t.doc} · ${quote.project_title}`.slice(0, 90), M, y, 9, bold, MUTED);
    y -= 18;
  };

  // Header band
  page.drawRectangle({ x: 0, y: H - 6, width: W, height: 6, color: ACCENT });
  y = H - 40;
  let left = M;
  const headerTop = y;
  if (logo) {
    const s = Math.min(70 / logo.width, 56 / logo.height);
    page.drawImage(logo, { x: M, y: headerTop - logo.height * s + 6, width: logo.width * s, height: logo.height * s });
    left = M + logo.width * s + 14;
  }
  let hy = headerTop - 8;
  if (brand?.company_name) { draw(page, brand.company_name, left, hy, 15, bold); hy -= 16; }
  else if (!brand) { draw(page, "ObraFácil", left, hy, 15, bold); hy -= 16; }
  for (const c of [brand?.phone, brand?.email, brand?.address]) if (c) for (const l of wrap(c, regular, 9, 260)) { draw(page, l, left, hy, 9, regular, MUTED); hy -= 12; }

  drawRight(page, t.doc, R, headerTop - 14, 24, bold, ACCENT);
  drawRight(page, `${t.no} ${number}`, R, headerTop - 32, 8.5, regular, MUTED);
  y = Math.min(hy, headerTop - 60) - 20;

  // Info panel
  const titleLines = wrap(quote.project_title, bold, 14, 320);
  const panelH = 46 + titleLines.length * 17;
  page.drawRectangle({ x: M, y: y - panelH, width: R - M, height: panelH, color: TINT });
  page.drawRectangle({ x: M, y: y - panelH, width: 3, height: panelH, color: ACCENT });
  draw(page, t.for, M + 16, y - 18, 7.5, bold, MUTED);
  draw(page, quote.client_name, M + 16, y - 32, 11, bold);
  let ty = y - 52;
  for (const l of titleLines) { draw(page, l, M + 16, ty, 14, bold, ACCENT); ty -= 17; }
  draw(page, t.date, 400, y - 18, 7.5, bold, MUTED);
  draw(page, dateStr, 400, y - 32, 10);
  y -= panelH + 22;

  // Items
  tableHeader();
  quote.items.forEach((item, i) => {
    const lines = wrap(item.description, regular, 10, descW);
    for (let start = 0; start < lines.length;) {
      if (y < 110) { continuation(); tableHeader(); }
      const fit = Math.max(1, Math.min(lines.length - start, Math.floor((y - 110 - 12) / 13)));
      const chunk = lines.slice(start, start + fit);
      const rowH = chunk.length * 13 + 12;
      if (i % 2 === 1) page.drawRectangle({ x: M, y: y - rowH, width: R - M, height: rowH, color: ZEBRA });
      chunk.forEach((l, k) => draw(page, l, cDesc, y - 17 - k * 13, 10));
      if (start === 0) {
        drawRight(page, String(item.qty), cQty, y - 17, 10);
        drawRight(page, currency(item.unit_price), cUnit, y - 17, 10);
        drawRight(page, currency(item.total), cAmt, y - 17, 10, bold);
      }
      y -= rowH;
      page.drawLine({ start: { x: M, y }, end: { x: R, y }, thickness: 0.5, color: LINE });
      start += fit;
    }
  });

  // Totals
  const total = quote.items.reduce((s, i) => s + i.total, 0);
  if (y < 150) continuation();
  y -= 14;
  const bx = 330;
  draw(page, t.sub, bx + 12, y - 12, 10, regular, MUTED);
  drawRight(page, currency(total), cAmt, y - 12, 10);
  y -= 24;
  page.drawRectangle({ x: bx, y: y - 34, width: R - bx, height: 34, color: ACCENT });
  draw(page, `${t.total} (USD)`, bx + 12, y - 22, 11, bold, WHITE);
  drawRight(page, currency(total), cAmt, y - 23, 15, bold, WHITE);
  y -= 60;

  // Notes
  const noteLines = [...(quote.notes ? wrap(quote.notes, regular, 9.5, R - M) : []), ...wrap(t.valid, regular, 9.5, R - M)];
  if (y < 90 + 20) continuation();
  draw(page, t.notes.toUpperCase(), M, y, 8.5, bold, ACCENT);
  page.drawLine({ start: { x: M, y: y - 6 }, end: { x: R, y: y - 6 }, thickness: 0.5, color: LINE });
  y -= 22;
  for (const l of noteLines) { if (y < 70) continuation(); draw(page, l, M, y, 9.5, regular, INK); y -= 13; }
  y -= 14;
  if (y < 70) continuation();
  draw(page, t.thanks, M, y, 10, bold, ACCENT);

  // Footer
  const pages = pdf.getPages();
  const foot = [brand?.company_name, brand?.phone, brand?.email].filter(Boolean).join("  ·  ");
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: 44 }, end: { x: R, y: 44 }, thickness: 0.5, color: LINE });
    if (foot) draw(p, foot.slice(0, 95), M, 30, 8, regular, MUTED);
    drawRight(p, `${i + 1} / ${pages.length}`, R, 30, 8, regular, MUTED);
  });

  const bytes = await pdf.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

export function quotePdfFilename(quote: Quote) {
  const name = quote.client_name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 60);
  return `ObraFacil-${name || "presupuesto"}.pdf`;
}
