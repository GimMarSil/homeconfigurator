export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Executivo</h1>
        <p className="text-muted-foreground">Resumo executivo com KPIs e previsões.</p>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Receita Mês</div>
          <div className="text-2xl font-semibold">€ 120,450</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Utilização Equipa</div>
          <div className="text-2xl font-semibold">76%</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Projetos em Risco</div>
          <div className="text-2xl font-semibold">3</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Cash Flow 6m</div>
          <div className="text-2xl font-semibold">€ 640,000</div>
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
        <div className="rounded-lg border p-4 h-[360px]">Heatmap de Recursos</div>
        <div className="rounded-lg border p-4 h-[360px]">Projeção de Cash Flow</div>
      </div>
      <div className="rounded-lg border p-4">Aprovações Recentes</div>
    </div>
  );
}