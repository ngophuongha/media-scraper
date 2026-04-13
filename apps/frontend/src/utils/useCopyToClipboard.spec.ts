import { act, renderHook } from "@testing-library/react";
import { copyToClipboard, useCopyToClipboard } from "./useCopyToClipboard";

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe("useCopyToClipboard", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (navigator.clipboard.writeText as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("copyToClipboard function should call navigator.clipboard.writeText", () => {
    copyToClipboard("test-text");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test-text");
  });

  it("handleCopy should copy text and update copiedId temporarily", () => {
    const { result } = renderHook(() => useCopyToClipboard());

    expect(result.current.copiedId).toBeNull();

    const mockEvent = {
      stopPropagation: jest.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleCopy(mockEvent, 123, "http://example.com/image.jpg");
    });

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "http://example.com/image.jpg",
    );
    expect(result.current.copiedId).toBe(123);

    // Fast-forward time by 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.copiedId).toBeNull();
  });
});
