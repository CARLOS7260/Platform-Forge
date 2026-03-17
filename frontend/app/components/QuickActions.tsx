"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Project = { id: number; name: string };
type Environment = { id: number; namespace: string; project_id: number };
type Deploy = { id: number; version: string; status: string };

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function postJson(path: string, body?: unknown) {
  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `HTTP ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function Button({
  children,
  onClick,
  tone = "cyan",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "cyan" | "emerald" | "amber" | "slate";
  disabled?: boolean;
}) {
  const tones: Record<string, string> = {
    cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20",
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20",
    slate: "border-slate-700 bg-slate-900/80 text-slate-100 hover:bg-slate-900",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export function QuickActions({ projects, environments, deploys }: { projects: Project[]; environments: Environment[]; deploys: Deploy[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ tone: "ok" | "err"; message: string } | null>(null);

  const projectId = projects[0]?.id ?? 0;
  const defaultNamespace = `dev-${projects[0]?.name ?? "app"}-${Math.floor(Math.random() * 1000)}`;
  const [envName, setEnvName] = useState("Development");
  const [namespace, setNamespace] = useState(defaultNamespace);
  const [cpu, setCpu] = useState(2);
  const [memoryGb, setMemoryGb] = useState(4);

  const environmentOptions = useMemo(() => environments, [environments]);
  const [envId, setEnvId] = useState<number>(environmentOptions[0]?.id ?? 0);

  const [deployVersion, setDeployVersion] = useState(`v${2 + Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`);
  const [deployReason, setDeployReason] = useState("Release controlada com gate de aprovação");
  const [deployIdToApprove, setDeployIdToApprove] = useState<number>(() => {
    const queued = deploys.find((d) => d.status !== "succeeded");
    return queued?.id ?? deploys[0]?.id ?? 0;
  });

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function run(action: () => Promise<unknown>, okMessage: string) {
    setToast(null);
    try {
      await action();
      setToast({ tone: "ok", message: okMessage });
      refresh();
    } catch (err) {
      setToast({ tone: "err", message: err instanceof Error ? err.message : "Falha inesperada" });
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-[2.5rem] border border-slate-800 bg-slate-950/75 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Ações rápidas</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Demo interativa (sem roteiro manual)</h2>
            <p className="mt-2 text-sm text-slate-400">
              Esses botões chamam a API e atualizam o dashboard. Perfeito para abrir em entrevista e narrar o fluxo de plataforma.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button tone="slate" onClick={refresh} disabled={pending}>
              Atualizar agora
            </Button>
            <Button tone="emerald" onClick={() => run(() => postJson("/demo/seed"), "Dados de demo gerados")} disabled={pending}>
              Seed demo
            </Button>
            <Button tone="amber" onClick={() => run(() => postJson("/demo/simulate/cpu-spike"), "Incidente CPU spike simulado")} disabled={pending}>
              Simular CPU spike
            </Button>
            <Button tone="amber" onClick={() => run(() => postJson("/demo/simulate/deploy-storm"), "Incidente deploy storm simulado")} disabled={pending}>
              Simular deploy storm
            </Button>
          </div>
        </div>

        {toast ? (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
              toast.tone === "ok" ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100" : "border-rose-400/20 bg-rose-500/10 text-rose-100"
            }`}
          >
            {toast.message}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Criar ambiente" subtitle="Provisiona um namespace e grava auditoria.">
          <div className="grid gap-3">
            <label className="text-xs uppercase tracking-[0.25em] text-slate-500">Nome</label>
            <input
              value={envName}
              onChange={(e) => setEnvName(e.target.value)}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/30"
            />
          </div>
          <div className="grid gap-3">
            <label className="text-xs uppercase tracking-[0.25em] text-slate-500">Namespace</label>
            <input
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-[0.25em] text-slate-500">CPU</label>
              <input
                type="number"
                min={1}
                value={cpu}
                onChange={(e) => setCpu(Number(e.target.value))}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/30"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-[0.25em] text-slate-500">Memória (GB)</label>
              <input
                type="number"
                min={1}
                value={memoryGb}
                onChange={(e) => setMemoryGb(Number(e.target.value))}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/30"
              />
            </div>
          </div>
          <Button
            onClick={() =>
              run(
                () =>
                  postJson("/environments", {
                    project_id: projectId,
                    name: envName,
                    namespace,
                    cpu,
                    memory_gb: memoryGb,
                  }),
                "Ambiente criado"
              )
            }
            disabled={pending || !projectId}
          >
            Criar ambiente
          </Button>
          {!projectId ? <p className="text-sm text-amber-200">Sem projeto seedado. Clique em “Seed demo”.</p> : null}
        </Card>

        <Card title="Solicitar deploy" subtitle="Cria um deploy e entra na fila de aprovação.">
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-[0.25em] text-slate-500">Ambiente</label>
            <select
              value={envId}
              onChange={(e) => setEnvId(Number(e.target.value))}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/30"
            >
              {environmentOptions.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.namespace}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3">
            <label className="text-xs uppercase tracking-[0.25em] text-slate-500">Versão</label>
            <input
              value={deployVersion}
              onChange={(e) => setDeployVersion(e.target.value)}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/30"
            />
          </div>
          <div className="grid gap-3">
            <label className="text-xs uppercase tracking-[0.25em] text-slate-500">Motivo</label>
            <textarea
              value={deployReason}
              onChange={(e) => setDeployReason(e.target.value)}
              rows={3}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/30"
            />
          </div>
          <Button
            tone="cyan"
            onClick={() =>
              run(
                () =>
                  postJson("/deploys", {
                    environment_id: envId,
                    version: deployVersion,
                    change_reason: deployReason,
                  }),
                "Deploy solicitado"
              )
            }
            disabled={pending || !envId}
          >
            Solicitar deploy
          </Button>
          {!envId ? <p className="text-sm text-amber-200">Sem ambiente disponível. Crie um ambiente primeiro.</p> : null}
        </Card>

        <Card title="Aprovar deploy" subtitle="Simula gate de produção com aprovação explícita.">
          <div className="grid gap-2">
            <label className="text-xs uppercase tracking-[0.25em] text-slate-500">Deploy</label>
            <select
              value={deployIdToApprove}
              onChange={(e) => setDeployIdToApprove(Number(e.target.value))}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/30"
            >
              {deploys.map((deploy) => (
                <option key={deploy.id} value={deploy.id}>
                  #{deploy.id} • {deploy.version} • {deploy.status}
                </option>
              ))}
            </select>
          </div>
          <Button
            tone="emerald"
            onClick={() => run(() => postJson(`/deploys/${deployIdToApprove}/approve`, { approved_by: "release-manager@platformforge.io" }), "Deploy aprovado")}
            disabled={pending || !deployIdToApprove}
          >
            Aprovar deploy
          </Button>
          {!deployIdToApprove ? <p className="text-sm text-amber-200">Sem deploy para aprovar. Solicite um deploy primeiro.</p> : null}
        </Card>
      </div>
    </section>
  );
}

