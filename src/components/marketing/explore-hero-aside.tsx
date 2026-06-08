export function ExploreHeroAside() {
  const leaders = [
    { rank: 1, name: "Mateo R.", score: 84, trend: "+4" },
    { rank: 2, name: "Diego S.", score: 81, trend: "+2" },
    { rank: 3, name: "Lucas M.", score: 79, trend: "new" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[380px] lg:mx-0 lg:max-w-none">
      <div
        className="absolute -inset-4 rounded-2xl bg-[radial-gradient(circle,rgba(52,211,153,0.1)_0%,rgba(27,79,140,0.05)_60%,transparent_75%)] blur-2xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-xl border border-mf-border bg-mf-surface shadow-[0_24px_48px_-12px_rgba(15,45,82,0.18)]">
        <div className="border-b border-mf-border-subtle px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-text-muted">
            Destacados de la semana
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-mf-text">
            Actividad verificada por categoría
          </p>
        </div>
        <ul className="divide-y divide-mf-border-subtle">
          {leaders.map((player) => (
            <li
              key={player.name}
              className="flex items-center justify-between gap-3 px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    player.rank === 1
                      ? "flex h-8 w-8 items-center justify-center rounded-full bg-mf-accent text-xs font-bold text-slate-950"
                      : "flex h-8 w-8 items-center justify-center rounded-full bg-mf-brand-soft text-xs font-bold text-mf-brand"
                  }
                >
                  {player.rank}
                </span>
                <div>
                  <p className="text-sm font-semibold text-mf-text">{player.name}</p>
                  <p className="text-xs text-mf-text-muted">Delantero · CDMX</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={
                    player.rank === 1
                      ? "text-lg font-semibold tabular-nums text-mf-accent-dark"
                      : "text-lg font-semibold tabular-nums text-mf-brand"
                  }
                >
                  {player.score}
                </p>
                <p className="text-[11px] font-medium text-mf-accent-dark">{player.trend}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
