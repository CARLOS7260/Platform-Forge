import type { ReactNode } from "react";
import { QuickActions } from "./components/QuickActions";

const serverBase = process.env.API_INTERNAL_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function fetchJson(path: string) {
  const response = await fetch(`${serverBase}${path}`, { cache: "no-store" });
  if (!response.ok) {
    return null;
  }
  return response.json();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{eyebrow}</p>
      <h2 className="text-2xl font-semibold text-white md:text-3xl">{title}</h2>
      <p className="max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

function Pill({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "emerald" | "cyan" | "amber" }) {
  const tones = {
    slate: "border-slate-700 bg-slate-900/80 text-slate-200",
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-200",
  };
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-slate-950/30">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  return (
    <div
      className="flex h-40 w-40 items-center justify-center rounded-full border border-cyan-400/20"
      style={{ background: `conic-gradient(rgba(34,211,238,0.95) ${value}%, rgba(15,23,42,0.65) 0)` }}
    >
      <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-slate-800 bg-slate-950/95 text-center">
        <span className="text-3xl font-semibold text-white">{value}%</span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Readiness</span>
      </div>
    </div>
  );
}

export default async function Page() {
  const [overview, scorecard, catalog, policies, timeline, topology, projects, environments, deploys, audits, logs, me] = await Promise.all([
    fetchJson("/overview"),
    fetchJson("/scorecard"),
    fetchJson("/catalog"),
    fetchJson("/policies"),
    fetchJson("/timeline"),
    fetchJson("/topology"),
    fetchJson("/projects"),
    fetchJson("/environments"),
    fetchJson("/deploys"),
    fetchJson("/audits"),
    fetchJson("/logs"),
    fetchJson("/me"),
  ]);

  const readiness = Number(scorecard?.readiness ?? 0);
  const signals = scorecard?.signals ?? [];
  const servicePaths = catalog?.golden_paths ?? [];
  const policyItems = policies?.items ?? [];
  const timelineItems = timeline?.items ?? [];
  const topologyNodes = topology?.nodes ?? [];
  const topologyEdges = topology?.edges ?? [];
  const recentLogs = logs?.items ?? [];
  const auditItems = audits ?? [];
  const deployItems = deploys ?? [];
  const projectItems = projects ?? [];
  const environmentItems = environments ?? [];
  const deploysForActions = deployItems ?? [];

  const metrics = [
    { label: "Projetos", value: overview?.projects ?? projectItems.length ?? 0, hint: "Portfólios ativos na plataforma" },
    { label: "Ambientes", value: overview?.environments ?? environmentItems.length ?? 0, hint: "Namespaces provisionados" },
    { label: "Deploys", value: overview?.deploys ?? deployItems.length ?? 0, hint: "Entregas registradas" },
    { label: "Auditorias", value: overview?.audits ?? auditItems.length ?? 0, hint: "Eventos rastreados" },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_28%),linear-gradient(180deg,#020617_0%,#020617_35%,#0f172a_100%)] px-6 py-10 text-slate-100 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-950/75 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="grid gap-8 p-8 xl:grid-cols-[1.2fr_0.8fr] xl:p-10">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Pill tone="cyan">Platform Forge</Pill>
                <Pill tone="emerald">Internal Developer Platform</Pill>
                <Pill tone="amber">Portfolio Grade</Pill>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                  Uma plataforma interna de exemplo que simula o fluxo de um produto real.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-300">
                  Self-service para criar ambientes, aprovar deploys, registrar incidentes e auditar operações com foco em arquitetura de plataforma e operação de serviços.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Perfil</p>
                  <p className="mt-2 text-sm font-medium text-white">{me?.role ?? "admin"}</p>
                  <p className="mt-1 text-xs text-slate-400">{me?.user ?? "platform-operator"}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Health</p>
                  <p className="mt-2 text-sm font-medium text-emerald-300">Operacional</p>
                  <p className="mt-1 text-xs text-slate-400">API, worker e persistência simulada</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Score</p>
                  <p className="mt-2 text-sm font-medium text-white">{readiness}% pronto</p>
                  <p className="mt-1 text-xs text-slate-400">Readiness de plataforma</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-slate-800 bg-slate-900/60 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Gauge value={readiness} />
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-white">Platform Score</h2>
                    <p className="max-w-xs text-sm leading-6 text-slate-400">
                      Índice de maturidade do ambiente com base em projetos, ambientes, deploys e auditorias.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {signals.map((signal: any) => (
                    <div key={signal.name} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{signal.name}</p>
                      <p className="mt-2 text-sm font-medium text-white">{signal.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full rounded-2xl border border-cyan-400/10 bg-cyan-500/5 p-4 text-sm text-cyan-100">
                Demo operacional pronta: abra a plataforma, visualize a trilha, faça um deploy e mostre o incidente.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <StatCard key={metric.label} {...metric} />
          ))}
        </section>

        <QuickActions projects={projectItems} environments={environmentItems} deploys={deploysForActions} />

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-6">
            <SectionTitle
              eyebrow="Golden Paths"
              title="Catálogo de serviços pronto para produção"
              description="Templates aprovados, com governança e padrão de entrega. Isso é o que recrutadores normalmente procuram quando falamos de Platform Engineering."
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {servicePaths.map((item: any) => (
                <article key={item.name} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-900/90">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                    </div>
                    <Pill tone={item.status === "approved" ? "emerald" : "cyan"}>{item.sla}</Pill>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Pill>{item.template}</Pill>
                    <Pill tone="slate">Owner: {item.owner}</Pill>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-6">
              <SectionTitle
                eyebrow="Policies"
                title="Governança e aprovação"
                description="Regras visíveis deixam o sistema mais crível: produção exige aprovação, ações privilegiadas são auditadas e o time sabe o que está travando ou liberando a entrega."
              />
              <div className="mt-5 space-y-3">
                {policyItems.map((policy: any) => (
                  <div key={policy.name} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium text-white">{policy.name}</p>
                      <Pill tone={policy.status === "enforced" ? "emerald" : "amber"}>{policy.status}</Pill>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">Owner: {policy.owner}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-6">
              <SectionTitle
                eyebrow="Timeline"
                title="Linha do tempo operacional"
                description="Uma narrativa de eventos ajuda muito na entrevista: o recrutador enxerga a sequência de impacto, não apenas uma lista de dados."
              />
              <div className="mt-5 space-y-3">
                {timelineItems.map((item: any) => (
                  <div key={`${item.time}-${item.title}`} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.time}</p>
                      </div>
                      <Pill tone="slate">{item.type}</Pill>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-6">
            <SectionTitle
              eyebrow="Topology"
              title="Mapa da plataforma"
              description="Mostra a relação entre portal, API, dados, fila e governança. Visualmente simples, mas com a arquitetura certa para uma plataforma interna." 
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-3">
                {topologyNodes.map((node: any) => (
                  <div key={node.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <strong className="text-white">{node.label}</strong>
                      <Pill tone="cyan">{node.kind}</Pill>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{node.id}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="space-y-3">
                  {topologyEdges.map((edge: any) => (
                    <div key={`${edge.from}-${edge.to}`} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
                      <span>{edge.from}</span>
                      <span className="text-cyan-300">{edge.label}</span>
                      <span>{edge.to}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-6">
            <SectionTitle
              eyebrow="Operations"
              title="Projetos, ambientes e deploys"
              description="Este bloco dá a sensação de uma ferramenta viva, com dados de domínio, histórico e trilha de mudança."
            />
            <div className="mt-6 space-y-4">
              {projectItems.map((project: any) => (
                <div key={project.id} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{project.description}</p>
                    </div>
                    <Pill tone="cyan">{project.owner}</Pill>
                  </div>
                </div>
              ))}

              {environmentItems.map((environment: any) => (
                <div key={environment.id} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{environment.namespace}</h3>
                      <p className="text-sm text-slate-400">
                        {environment.name} • CPU {environment.cpu} • Memória {environment.memory_gb} GB
                      </p>
                    </div>
                    <Pill tone="emerald">{environment.status}</Pill>
                  </div>
                </div>
              ))}

              {deployItems.map((deploy: any) => (
                <div key={deploy.id} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Deploy {deploy.version}</h3>
                      <p className="text-sm text-slate-400">{deploy.change_reason || "Mudança sem justificativa registrada"}</p>
                    </div>
                    <Pill tone="amber">{deploy.status}</Pill>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Aprovado por {deploy.approved_by || "aguardando aprovação"}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-6">
            <SectionTitle
              eyebrow="Audit Trail"
              title="Mudanças rastreadas"
              description="Toda ação crítica aparece aqui. Esse detalhe aumenta muito a percepção de maturidade do produto."
            />
            <div className="mt-6 space-y-3">
              {auditItems.slice(0, 8).map((audit: any) => (
                <div key={audit.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <strong className="text-white">{audit.action}</strong>
                    <Pill tone="slate">{audit.subject}</Pill>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{audit.details}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-6">
            <SectionTitle
              eyebrow="Telemetry"
              title="Logs e sinais operacionais"
              description="O sistema parece mais real quando entrega telemetria, mesmo em demo. Isso ajuda muito na apresentação de arquitetura e observabilidade."
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="text-lg font-semibold text-white">Logs recentes</h3>
                <div className="mt-4 space-y-3">
                  {recentLogs.slice(0, 6).map((entry: any) => (
                    <div key={`${entry.timestamp}-${entry.message}`} className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                      <p className="text-xs text-slate-500">{entry.timestamp}</p>
                      <p className="mt-1 text-sm text-slate-300">{entry.message}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="text-lg font-semibold text-white">Leitura pessoal</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                    Projeto que usei para treinar arquitetura de plataforma, automação e operação de serviços.
                  </li>
                  <li className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                    Mostra como eu organizo um sistema completo: portal, API, fila, worker, banco e observabilidade.
                  </li>
                  <li className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                    Serve como base para conversas técnicas sobre design de plataforma, não apenas telas isoladas.
                  </li>
                </ul>
                <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-500/5 p-4 text-sm text-cyan-100">
                  Stack: Next.js, TypeScript, FastAPI, PostgreSQL, Redis e Docker.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
