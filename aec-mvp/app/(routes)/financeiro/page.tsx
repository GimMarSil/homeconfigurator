export default function FinancePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Financeiro</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="rounded-lg border p-4 h-48">Projeções de Cash Flow</div>
        <div className="rounded-lg border p-4 h-48">Faturação</div>
      </div>
    </div>
  );
}