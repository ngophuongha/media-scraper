import { renderHook, act } from "@testing-library/react";
import { useScraperForm } from "./useScraperForm";
import { useScrapeMedia } from "../../application/useScrapeMedia";
import { useToast } from "../shared/ToastContext";

// Mock the dependencies
jest.mock("../../application/useScrapeMedia");
jest.mock("../shared/ToastContext");

describe("useScraperForm hook", () => {
  let mockScrape: jest.Mock;
  let mockReset: jest.Mock;
  let mockShowToast: jest.Mock;
  let mockOnSuccess: jest.Mock;

  beforeEach(() => {
    mockScrape = jest.fn();
    mockReset = jest.fn();
    mockShowToast = jest.fn();
    mockOnSuccess = jest.fn();

    (useScrapeMedia as jest.Mock).mockReturnValue({
      mutate: mockScrape,
      isPending: false,
      error: null,
      reset: mockReset,
    });

    (useToast as jest.Mock).mockReturnValue({
      showToast: mockShowToast,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockEvent = {
    preventDefault: jest.fn(),
  } as unknown as React.FormEvent;

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useScraperForm({ onSuccess: mockOnSuccess }));
    expect(result.current.urls).toBe("");
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("should set validation error if URLs exceed maximum limit", async () => {
    const { result } = renderHook(() => useScraperForm({ onSuccess: mockOnSuccess }));
    
    act(() => {
      result.current.setUrls("a.com, b.com, c.com, d.com, e.com, f.com");
    });

    await act(async () => {
      result.current.handleSubmit(mockEvent);
    });

    expect(result.current.error).toContain("Maximum 5 URLs allowed");
    expect(mockScrape).not.toHaveBeenCalled();
  });

  it("should set validation error for invalid URL formats", async () => {
    const { result } = renderHook(() => useScraperForm({ onSuccess: mockOnSuccess }));
    
    act(() => {
      result.current.setUrls("invalid-url-format-without-domain");
    });

    await act(async () => {
      result.current.handleSubmit(mockEvent);
    });

    expect(result.current.error).toContain("Invalid URL format");
    expect(mockScrape).not.toHaveBeenCalled();
  });

  it("should pass validation and call scrape with cleanly parsed URLs", async () => {
    const { result } = renderHook(() => useScraperForm({ onSuccess: mockOnSuccess }));
    
    act(() => {
      result.current.setUrls("example.com, https://test.com\nhttp://demo.com");
    });

    await act(async () => {
      result.current.handleSubmit(mockEvent);
    });

    expect(result.current.error).toBeNull();
    expect(mockReset).toHaveBeenCalled();
    expect(mockScrape).toHaveBeenCalled();
    expect(mockScrape.mock.calls[0][0]).toEqual({
      urls: ["https://example.com", "https://test.com", "http://demo.com"],
    });
  });

  it("should handle successful scrape with perfectly scraped items", async () => {
    mockScrape.mockImplementation((_vars, options) => {
      options.onSuccess({ count: 10, failed: 0, failedUrls: [] });
    });

    const { result } = renderHook(() => useScraperForm({ onSuccess: mockOnSuccess }));
    act(() => {
      result.current.setUrls("example.com");
    });

    await act(async () => {
      result.current.handleSubmit(mockEvent);
    });

    expect(mockShowToast).toHaveBeenCalledWith("success", expect.stringContaining("Successfully scraped 10 media items"));
    expect(result.current.urls).toBe(""); // should reset urls
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("should handle successful scrape API call but with failed records", async () => {
    mockScrape.mockImplementation((_vars, options) => {
      options.onSuccess({ count: 5, failed: 1, failedUrls: ["https://broken.com"] });
    });

    const { result } = renderHook(() => useScraperForm({ onSuccess: mockOnSuccess }));
    act(() => {
      result.current.setUrls("broken.com");
    });

    await act(async () => {
      result.current.handleSubmit(mockEvent);
    });

    expect(mockShowToast).toHaveBeenCalledWith("error", expect.stringContaining("Failed to scrape: https://broken.com"));
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("should trigger an error toast when generic API mutation fails entirely", async () => {
    mockScrape.mockImplementation((_vars, options) => {
      options.onError(new Error("Network Timeout"));
    });

    const { result } = renderHook(() => useScraperForm({ onSuccess: mockOnSuccess }));
    act(() => {
      result.current.setUrls("valid.com");
    });

    await act(async () => {
      result.current.handleSubmit(mockEvent);
    });

    expect(mockShowToast).toHaveBeenCalledWith("error", "System error: Network Timeout");
  });
});
