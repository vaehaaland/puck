import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SetLogger } from "@/components/workout/set-logger";

describe("SetLogger", () => {
  const defaultProps = {
    setNumber: 1,
    suggestedWeight: 80,
    suggestedReps: "8-10",
    restSeconds: 90,
    onSave: vi.fn().mockResolvedValue(undefined),
  };

  it("renders weight and reps inputs", () => {
    render(<SetLogger {...defaultProps} />);
    expect(screen.getByPlaceholderText("kg")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("reps")).toBeInTheDocument();
  });

  it("renders set number label", () => {
    render(<SetLogger {...defaultProps} />);
    expect(screen.getByText("Set 1")).toBeInTheDocument();
  });

  it("populates suggested weight", () => {
    render(<SetLogger {...defaultProps} />);
    const weightInput = screen.getByPlaceholderText("kg") as HTMLInputElement;
    expect(weightInput.value).toBe("80");
  });

  it("disables submit when weight is empty", () => {
    render(<SetLogger {...defaultProps} suggestedWeight={undefined} />);
    const btn = screen.getByRole("button", { name: /log set/i });
    expect(btn).toBeDisabled();
  });

  it("calls onSave with weight, reps, and rpe", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<SetLogger {...defaultProps} onSave={onSave} />);

    const weightInput = screen.getByPlaceholderText("kg");
    const repsInput = screen.getByPlaceholderText("reps");
    const btn = screen.getByRole("button", { name: /log set/i });

    fireEvent.change(weightInput, { target: { value: "100" } });
    fireEvent.change(repsInput, { target: { value: "5" } });
    fireEvent.click(btn);

    // Wait for async onSave
    await vi.waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(100, 5, null);
    });
  });
});
