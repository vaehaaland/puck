import { RunForm } from "@/components/runs/run-form";

export default function NewRunPage() {
  return (
    <div className="p-4 lg:p-8 max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Log Run</h2>
      <RunForm />
    </div>
  );
}
