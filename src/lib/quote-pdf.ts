import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import type { Quote } from "@/lib/quote.functions";
import type { CompanyBrand } from "@/lib/quote-branding";

const currency = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const printable = (s: string) => s.replace(/[\u2010-\u2015]/g, "-").replace(/[^\x20-\x7E\xA0-\xFF\n]/g, "");

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  for (const paragraph of printable(text).split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      for (const letter of (line ? " " : "") + word) {
        if (font.widthOfTextAtSize(line + letter, size) > width) { lines.push(line); line = ""; }
        line += letter;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function createQuotePdf(quote: Quote, language: "en" | "es", brand: CompanyBrand | null) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  pdf.setTitle(printable(quote.project_title));
  pdf.setAuthor(printable(brand?.company_name || "ObraFácil"));
  pdf.setSubject(language === "en" ? "Construction estimate" : "Presupuesto de obra");
  let page = pdf.addPage([595.28, 841.89]);
  let y = 790;
  const margin = 44;
  const newPage = () => { page = pdf.addPage([595.28, 841.89]); y = 790; };
  const ensure = (height: number) => { if (y - height < 58) newPage(); };
  const text = (value: string, size = 11, strong = false, width = 507, x = margin) => {
    const font = strong ? bold : regular;
    for (const line of wrap(value, font, size, width)) {
      ensure(size + 6);
      page.drawText(line, { x, y, font, size });
      y -= size + 6;
    }
  };
  if (brand) {
    if (brand.logo_url) {
      try {
        const image = await pdf.embedPng(brand.logo_url);
        const dims = image.scale(Math.min(64 / image.width, 54 / image.height));
        page.drawImage(image, { x: margin, y: y - dims.height, width: dims.width, height: dims.height });
        y -= dims.height + 12;
      } catch { throw new Error("No pudimos incluir el logo. Sube de nuevo la imagen o desactiva los datos de empresa."); }
    }
    if (brand.company_name) text(brand.company_name, 17, true);
    for (const contact of [brand.phone, brand.email, brand.address]) if (contact) text(contact, 10);
    y -= 14;
  }
  text(language === "en" ? "ESTIMATE" : "PRESUPUESTO", 10, true);
  text(quote.project_title, 20, true);
  text(`${language === "en" ? "Prepared for" : "Preparado para"}: ${quote.client_name}`, 11);
  y -= 16;
  text(language === "en" ? "DESCRIPTION / QUANTITY / UNIT PRICE" : "DESCRIPCIÓN / CANTIDAD / PRECIO UNITARIO", 9, true);
  y -= 4;
  for (const item of quote.items) {
    const lines = wrap(item.description, regular, 11, 392);
    ensure(Math.min(660, lines.length * 17 + 40));
    const top = y;
    text(item.description, 11, false, 392);
    const amount = currency(item.total);
    page.drawText(amount, { x: 551 - bold.widthOfTextAtSize(amount, 11), y: lines.length > 38 ? y : top, font: bold, size: 11 });
    text(`${item.qty} × ${currency(item.unit_price)}`, 9);
    y -= 12;
  }
  ensure(58);
  page.drawLine({ start: { x: margin, y }, end: { x: 551, y }, thickness: 0.7 });
  y -= 24;
  const total = currency(quote.items.reduce((sum, item) => sum + item.total, 0));
  page.drawText("Total (USD)", { x: margin, y, font: bold, size: 16 });
  page.drawText(total, { x: 551 - bold.widthOfTextAtSize(total, 16), y, font: bold, size: 16 });
  y -= 34;
  if (quote.notes) { text(language === "en" ? "Notes" : "Notas", 11, true); text(quote.notes, 10); }
  const pages = pdf.getPages();
  pages.forEach((p, index) => p.drawText(`${index + 1} / ${pages.length}`, { x: margin, y: 28, font: regular, size: 9 }));
  const bytes = await pdf.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

export function quotePdfFilename(quote: Quote) {
  const name = quote.client_name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 60);
  return `ObraFacil-${name || "presupuesto"}.pdf`;
}