import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgramCard } from "@/components/programs/program-card";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const baseProgram = {
  id: "prog-1",
  name: "8-Week Strength Block",
  description: "A solid strength program",
  sessions: [{ id: "s1" }, { id: "s2" }, { id: "s3" }],
};

describe("ProgramCard", () => {
  it("renders program name", () => {
    render(<ProgramCard program={baseProgram} />);
    expect(screen.getByText("8-Week Strength Block")).toBeInTheDocument();
  });

  it("renders program description", () => {
    render(<ProgramCard program={baseProgram} />);
    expect(screen.getByText("A solid strength program")).toBeInTheDocument();
  });

  it("shows session count", () => {
    render(<ProgramCard program={baseProgram} />);
    expect(screen.getByText("3 sessions")).toBeInTheDocument();
  });

  it("shows Coach badge when isCoach is true", () => {
    render(<ProgramCard program={baseProgram} isCoach />);
    expect(screen.getByText("Coach")).toBeInTheDocument();
  });

  it("does not show Coach badge when isCoach is false", () => {
    render(<ProgramCard program={baseProgram} isCoach={false} />);
    expect(screen.queryByText("Coach")).not.toBeInTheDocument();
  });

  it("renders correctly with no sessions", () => {
    render(<ProgramCard program={{ ...baseProgram, sessions: [] }} />);
    expect(screen.getByText("0 sessions")).toBeInTheDocument();
  });

  it("renders a link to the program", () => {
    render(<ProgramCard program={baseProgram} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/programs/prog-1");
  });
});
