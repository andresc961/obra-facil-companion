import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isIosNativeApp, useIsIosNativeApp } from "@/lib/ios-app";
import { deliverFile, sendPdfWithMessage } from "@/lib/file-download";

const originalAgent = navigator.userAgent;
beforeEach(() => {
  sessionStorage.clear();
  history.replaceState({}, "", "/");
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Object.defineProperty(navigator, "userAgent", { configurable: true, value: originalAgent });
  Reflect.deleteProperty(window, "Capacitor");
});

describe("iOS app detection", () => {
  it("leaves regular web sessions unchanged", () => { expect(isIosNativeApp()).toBe(false); });
  it("detects the native Capacitor platform", () => {
    Object.defineProperty(window, "Capacitor", { configurable: true, value: { isNativePlatform: () => true } });
    expect(isIosNativeApp()).toBe(true);
  });
  it("detects the ObraFacilIOS user agent", () => {
    Object.defineProperty(navigator, "userAgent", { configurable: true, value: "Mozilla ObraFacilIOS" });
    expect(isIosNativeApp()).toBe(true);
  });
  it("persists ios=1 across route navigation in sessionStorage", () => {
    history.replaceState({}, "", "/?ios=1");
    expect(isIosNativeApp()).toBe(true);
    expect(sessionStorage.getItem("obrafacil-ios")).toBe("1");
    history.replaceState({}, "", "/cuenta");
    expect(isIosNativeApp()).toBe(true);
  });
  it("does not enable iOS for other query values", () => {
    history.replaceState({}, "", "/?ios=0");
    expect(isIosNativeApp()).toBe(false);
  });
  it("still detects a direct signal when session storage is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    history.replaceState({}, "", "/?ios=1");
    expect(isIosNativeApp()).toBe(true);
  });
  it("updates the hook after client mount", () => {
    history.replaceState({}, "", "/?ios=1");
    const { result } = renderHook(() => useIsIosNativeApp());
    act(() => {});
    expect(result.current).toBe(true);
  });
  it("returns false without a browser", () => {
    vi.stubGlobal("window", undefined);
    expect(isIosNativeApp()).toBe(false);
  });
});

describe("PDF delivery", () => {
  const prepare = () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { configurable: true, value: share });
    Object.defineProperty(navigator, "canShare", { configurable: true, value: vi.fn(() => true) });
    return share;
  };
  it("shares PDFs in the iOS app even without a coarse pointer", async () => {
    history.replaceState({}, "", "/?ios=1");
    const share = prepare();
    await deliverFile(new Blob(["pdf"], { type: "application/pdf" }), "quote.pdf");
    expect(share).toHaveBeenCalledOnce();
    expect(share.mock.calls[0]?.[0].files[0].name).toBe("quote.pdf");
  });
  it("shares a PDF and its message together in iOS", async () => {
    history.replaceState({}, "", "/?ios=1");
    const share = prepare();
    await sendPdfWithMessage(new Blob(["pdf"], { type: "application/pdf" }), "quote.pdf", "Estimate");
    expect(share).toHaveBeenCalledWith({ files: [expect.any(File)], text: "Estimate" });
  });
  it("keeps coarse-pointer web sharing", async () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    const share = prepare();
    await deliverFile(new Blob(["pdf"]), "quote.pdf");
    expect(share).toHaveBeenCalledOnce();
  });
  it("keeps desktop downloads instead of invoking share", async () => {
    const share = prepare();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:test") });
    await deliverFile(new Blob(["pdf"]), "quote.pdf");
    expect(share).not.toHaveBeenCalled();
    expect(click).toHaveBeenCalledOnce();
  });
  it("does not fall back to sending when the user cancels sharing", async () => {
    history.replaceState({}, "", "/?ios=1");
    const share = prepare().mockRejectedValue(new DOMException("Canceled", "AbortError"));
    const open = vi.spyOn(window, "open");
    await sendPdfWithMessage(new Blob(["pdf"]), "quote.pdf", "Estimate");
    expect(share).toHaveBeenCalledOnce();
    expect(open).not.toHaveBeenCalled();
  });
});