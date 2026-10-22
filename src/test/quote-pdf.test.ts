import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { createQuotePdf } from "@/lib/quote-pdf";
import { selectedBrand } from "@/lib/quote-branding";
import type { Quote } from "@/lib/quote.functions";

const profile = { company_name: "Empresa de Andrés", phone: "555-0100", email: "contact@example.com", address: "Chicago", logo_url: null };
const quote: Quote = { client_name: "José", project_title: "Instalación de porcelanato", items: [{ description: "Porcelanato", qty: 15, unit_price: 50, total: 750 }], notes: "Materiales incluidos.", whatsapp_message: "Hola José" };
const readBlob = (blob: Blob) => new Promise<ArrayBuffer>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => reader.result instanceof ArrayBuffer ? resolve(reader.result) : reject(new Error("Expected PDF bytes"));
  reader.onerror = () => reject(reader.error);
  reader.readAsArrayBuffer(blob);
});

describe("monthly-plan branding", () => {
  it("only grants company branding to monthly subscribers", () => {
    expect(selectedBrand(false, true, profile)).toBeNull();
    expect(selectedBrand(true, true, profile)).toEqual(profile);
  });
  it("lets the subscriber omit company details from a quote", () => {
    expect(selectedBrand(true, false, profile)).toBeNull();
  });
});

describe("quote PDF download", () => {
  it("exports a real PDF using the current edited quote and company", async () => {
    const updated = { ...quote, project_title: "Trabajo corregido", items: [{ description: "Porcelanato corregido", qty: 15, unit_price: 60, total: 900 }] };
    const blob = await createQuotePdf(updated, "es", profile);
    const pdf = await PDFDocument.load(await readBlob(blob));
    expect(blob.type).toBe("application/pdf");
    expect(pdf.getTitle()).toBe("Trabajo corregido");
    expect(pdf.getAuthor()).toBe("Empresa de Andrés");
    expect(pdf.getPageCount()).toBe(1);
  });
  it("paginates long quotes without discarding line items", async () => {
    const long = { ...quote, items: Array.from({ length: 60 }, (_, i) => ({ description: `Partida ${i}`, qty: 1, unit_price: 10, total: 10 })) };
    const blob = await createQuotePdf(long, "en", null);
    const pdf = await PDFDocument.load(await readBlob(blob));
    expect(pdf.getPageCount()).toBeGreaterThan(2);
    expect(pdf.getSubject()).toBe("Construction estimate");
    expect(pdf.getAuthor()).toBe("ObraFácil");
  });
});