import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Search } from "./Search";

describe("Search component", () => {
  it("renders with a placeholder and initial value", () => {
    render(<Search search="initial text" setSearch={jest.fn()} />);

    const inputElement = screen.getByPlaceholderText("Search media by title or URL...");
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveValue("initial text");
  });

  it("calls setSearch when input changes", () => {
    const mockSetSearch = jest.fn();
    render(<Search search="" setSearch={mockSetSearch} />);

    const inputElement = screen.getByPlaceholderText("Search media by title or URL...");
    fireEvent.change(inputElement, { target: { value: "new text" } });

    expect(mockSetSearch).toHaveBeenCalledTimes(1);
    expect(mockSetSearch).toHaveBeenCalledWith("new text");
  });

  it("displays clear button when search is not empty", () => {
    render(<Search search="test" setSearch={jest.fn()} />);

    const clearButton = screen.getByRole("button");
    expect(clearButton).toBeInTheDocument();
  });

  it("does not display clear button when search is empty", () => {
    render(<Search search="" setSearch={jest.fn()} />);

    const clearButton = screen.queryByRole("button");
    expect(clearButton).not.toBeInTheDocument();
  });

  it("calls setSearch with empty string when clear button is clicked", () => {
    const mockSetSearch = jest.fn();
    render(<Search search="test" setSearch={mockSetSearch} />);

    const clearButton = screen.getByRole("button");
    fireEvent.click(clearButton);

    expect(mockSetSearch).toHaveBeenCalledTimes(1);
    expect(mockSetSearch).toHaveBeenCalledWith("");
  });
});
