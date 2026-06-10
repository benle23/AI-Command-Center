import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ClipboardCheck,
  Clock3,
  Code2,
  Database,
  Download,
  ExternalLink,
  FileText,
  Filter,
  FlaskConical,
  HeartHandshake,
  LayoutDashboard,
  Lightbulb,
  Mail,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UserRoundSearch,
  Users,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { demoData, makeId, pipelineData } from "./demo";
import {
  fallbackCommand,
  fallbackContent,
  fallbackOutreach,
  fallbackProspectAnalysis,
} from "./fallbacks";
import {
  PERSONAS,
  STATUSES,
  type AppData,
  type CommandOutput,
  type ContentIdea,
  type ICP,
  type OutreachSequence,
  type Persona,
  type Priority,
  type Prospect,
  type ProspectAnalysis,
  type SEOExperiment,
  type Status,
} from "./types";

type Tab =
  | "overview"
  | "prospects"
  | "outreach"
  | "pipeline"
  | "seo"
  | "content"
  | "command"
  | "prompts";

type AIOutputSource = "openai" | "built-in" | null;

const STORAGE_KEY = "researchgtm-command-center-v1";
const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10";
const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600";
const blankProspect: Prospect = {
  id: "",
  prospectName: "",
  institution: "",
  role: "",
  persona: "Researcher",
  researchField: "",
  source: "",
  recentContext: "",
  painPoint: "",
  fitScore: 70,
  priority: "Medium",
  status: "Targeted",
  notes: "",
  lastTouch: "Not contacted",
  nextAction: "Research recent context",
  channel: "Email",
};

function loadInitialData(): AppData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : demoData;
  } catch {
    return demoData;
  }
}

async function callAI(payload: Record<string, unknown>) {
  const response = await fetch("/api/analyze-gtm-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary: "bg-ink text-white hover:bg-brand-700 shadow-sm",
    secondary: "border border-slate-200 bg-white text-ink hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-ink",
    danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const hasCustomBackground = /(?:^|\s)!?bg-/.test(className);
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 shadow-card ${
        hasCustomBackground ? "" : "bg-white"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-ink">{title}</h2>
        {description && <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function StatusPill({ status }: { status: Status | string }) {
  const styles: Record<string, string> = {
    Targeted: "bg-slate-100 text-slate-700",
    Researched: "bg-blue-50 text-blue-700",
    Qualified: "bg-violet-50 text-violet-700",
    Contacted: "bg-amber-50 text-amber-700",
    Engaged: "bg-cyan-50 text-cyan-700",
    Interested: "bg-emerald-50 text-emerald-700",
    "Meeting/Demo": "bg-brand-100 text-brand-700",
    "Active Opportunity": "bg-green-100 text-green-800",
    "Not a Fit": "bg-red-50 text-red-700",
  };
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${styles[status] || styles.Targeted}`}>
      {status}
    </span>
  );
}

function PriorityPill({ priority }: { priority: Priority | string }) {
  const style =
    priority === "High"
      ? "bg-orange-50 text-orange-700"
      : priority === "Medium"
        ? "bg-blue-50 text-blue-700"
        : "bg-slate-100 text-slate-600";
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${style}`}>{priority}</span>;
}

function FormField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-muted">
      {text}
    </div>
  );
}

function AIOutputStatus({ source }: { source: AIOutputSource }) {
  if (!source) return null;

  const isOpenAI = source === "openai";
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-xs leading-5 ${
        isOpenAI
          ? "border-brand-100 bg-brand-50 text-brand-800"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
          isOpenAI ? "bg-brand-100 text-brand-700" : "bg-white text-slate-500"
        }`}
      >
        {isOpenAI ? <Sparkles size={13} /> : <Database size={13} />}
      </div>
      <div>
        <p className="font-bold text-ink">
          {isOpenAI ? "Generated with OpenAI" : "Built-in analysis used"}
        </p>
        <p className="mt-0.5">
          {isOpenAI
            ? "Review the model-generated draft before saving or applying it."
            : "This locally generated draft is ready to review. Connect OpenAI in deployment settings for model-generated output."}
        </p>
      </div>
    </div>
  );
}

const navItems: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: "overview", label: "GTM Overview", icon: LayoutDashboard },
  { id: "prospects", label: "Prospect Intelligence", icon: UserRoundSearch },
  { id: "outreach", label: "AI Outreach Builder", icon: Mail },
  { id: "pipeline", label: "Pipeline Tracker", icon: TrendingUp },
  { id: "seo", label: "SEO Experiments", icon: Search },
  { id: "content", label: "Content Engine", icon: FileText },
  { id: "command", label: "AI Command Center", icon: BrainCircuit },
  { id: "prompts", label: "Prompt Library", icon: BookOpen },
];

function App() {
  const [data, setData] = useState<AppData>(loadInitialData);
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const saveData = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setToast("GTM workspace saved locally");
  };

  const loadDemo = () => {
    setData(JSON.parse(JSON.stringify(demoData)));
    setToast("Demo data loaded");
  };

  const clearData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData({ ...demoData, prospects: [], seoExperiments: [], outreach: [], contentIdeas: [] });
    setToast("Local workspace cleared");
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "researchgtm-command-center.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const navigate = (next: Tab) => {
    setTab(next);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {toast && (
        <div className="fixed right-5 top-5 z-[80] flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle2 size={16} className="text-emerald-300" />
          {toast}
        </div>
      )}
      <div
        className={`fixed inset-0 z-40 bg-ink/30 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[276px] flex-col border-r border-slate-200 bg-[#fbfcfa] transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[84px] items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white">
            <BrainCircuit size={20} />
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight">ResearchGTM</p>
            <p className="text-[11px] font-semibold text-brand-600">AI COMMAND CENTER</p>
          </div>
          <button
            className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            GTM workspace
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  tab === item.id
                    ? "bg-ink text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="m-3 rounded-2xl border border-brand-100 bg-brand-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-brand-700">
            <ShieldCheck size={15} />
            Privacy by default
          </div>
          <p className="text-xs leading-5 text-slate-600">
            Data stays in your browser and is only sent to OpenAI when you click an AI button.
          </p>
        </div>
      </aside>

      <main className="lg:pl-[276px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-canvas/90 backdrop-blur-xl">
          <div className="flex h-[70px] items-center gap-3 px-4 sm:px-7">
            <button
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {navItems.find((item) => item.id === tab)?.label}
              </p>
              <p className="hidden text-xs text-muted sm:block">Research demand generation learning system</p>
            </div>
            <div className="ml-auto hidden items-center gap-2 md:flex">
              <Button variant="ghost" onClick={loadDemo}>
                <RefreshCw size={15} /> Demo data
              </Button>
              <Button variant="ghost" onClick={exportJSON}>
                <Download size={15} /> Export
              </Button>
              <Button variant="secondary" onClick={saveData}>
                <Save size={15} /> Save
              </Button>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-extrabold text-brand-700">
              RG
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-7 sm:py-8">
          {tab === "overview" && (
            <Overview data={data} setData={setData} navigate={navigate} />
          )}
          {tab === "prospects" && (
            <Prospects data={data} setData={setData} setToast={setToast} />
          )}
          {tab === "outreach" && (
            <Outreach data={data} setData={setData} setToast={setToast} />
          )}
          {tab === "pipeline" && <Pipeline data={data} setData={setData} />}
          {tab === "seo" && <SEO data={data} setData={setData} setToast={setToast} />}
          {tab === "content" && (
            <ContentEngine data={data} setData={setData} setToast={setToast} />
          )}
          {tab === "command" && (
            <CommandCenter data={data} setData={setData} setToast={setToast} />
          )}
          {tab === "prompts" && <PromptLibrary />}
        </div>

        <footer className="border-t border-slate-200 px-7 py-6 text-center text-xs text-muted">
          ResearchGTM AI Command Center · Local + API prototype · Built for meaningful GTM learning
        </footer>
      </main>

      <div className="fixed inset-x-3 bottom-3 z-30 flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl md:hidden">
        <Button variant="ghost" className="flex-1 px-2" onClick={loadDemo}>
          <RefreshCw size={15} /> Demo
        </Button>
        <Button variant="ghost" className="flex-1 px-2" onClick={exportJSON}>
          <Download size={15} /> Export
        </Button>
        <Button variant="secondary" className="flex-1 px-2" onClick={saveData}>
          <Save size={15} /> Save
        </Button>
      </div>
    </div>
  );
}

function Overview({
  data,
  setData,
  navigate,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  navigate: (tab: Tab) => void;
}) {
  const kpis = [
    { label: "Target prospects", value: "250", delta: "+18 this month", icon: Target },
    { label: "Qualified prospects", value: "118", delta: "47.2% of target", icon: UserRoundSearch },
    { label: "Outreach sent", value: "86", delta: "32 high-fit waiting", icon: Send },
    { label: "Reply rate", value: "14.2%", delta: "+2.4% vs prior", icon: MessageSquareText },
    { label: "Early access requests", value: "19", delta: "10.1% of engaged", icon: Sparkles },
    { label: "Meetings booked", value: "8", delta: "42.1% of interested", icon: Clock3 },
    { label: "Active opportunities", value: "12", delta: "$48k influenced", icon: TrendingUp },
    { label: "Conversion rate", value: "9.3%", delta: "Qualified to opportunity", icon: Activity },
  ];

  return (
    <>
      <Card className="relative mb-7 overflow-hidden bg-ink p-6 text-white sm:p-8">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-orange/15 blur-3xl" />
        <div className="relative max-w-4xl">
          <div className="mb-5 flex flex-wrap gap-2">
            {["Built for AI Demand Gen", "Local + API Prototype", "Research GTM Workflow"].map(
              (badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/80"
                >
                  {badge}
                </span>
              ),
            )}
          </div>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            ResearchGTM AI Command Center
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
            AI-assisted demand generation system for researcher outreach, pipeline tracking, SEO
            experiments, and GTM learning.
          </p>
          <p className="mt-5 max-w-3xl border-l-2 border-brand-500 pl-4 text-sm leading-6 text-white/85">
            This tool turns messy GTM inputs into structured prospect intelligence, outreach
            sequences, pipeline stages, SEO experiments, and next-best actions.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button className="!bg-white !text-ink hover:!bg-brand-50" onClick={() => navigate("command")}>
              Organize messy notes <ArrowRight size={16} />
            </Button>
            <Button
              className="border border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => navigate("prospects")}
            >
              Explore prospects
            </Button>
          </div>
        </div>
      </Card>

      <SectionTitle
        eyebrow="Funnel snapshot"
        title="Meaningful engagement, not vanity metrics"
        description="A fast read on where the research GTM motion is creating learning and where it is losing momentum."
      />
      <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-5">
              <div className="mb-5 flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Icon size={17} />
                </div>
                <span className="text-[11px] font-bold text-brand-600">{kpi.delta}</span>
              </div>
              <p className="text-2xl font-extrabold tracking-tight">{kpi.value}</p>
              <p className="mt-1 text-xs font-semibold text-muted">{kpi.label}</p>
            </Card>
          );
        })}
      </div>

      <div className="mb-8 grid gap-5 xl:grid-cols-[1.55fr_0.85fr]">
        <Card className="p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h3 className="font-bold">Pipeline by stage</h3>
              <p className="mt-1 text-xs text-muted">Prospect volume and conversion progression</p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold text-brand-700">
              250 total targets
            </span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 5, right: 0, left: -25, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0ed" />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 10, fill: "#657269" }}
                  angle={-30}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: "#657269" }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "#f4f6f2" }}
                  contentStyle={{ borderRadius: 12, borderColor: "#e2e8e3", fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {pipelineData.map((entry, index) => (
                    <Cell
                      key={entry.stage}
                      fill={index === 2 ? "#278248" : index > 2 ? "#80b98f" : "#c5d9ca"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="border-orange-100 bg-orange-50/40 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <Zap size={18} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">
              Strongest bottleneck
            </p>
            <h3 className="mt-2 text-xl font-extrabold">Qualified → Contacted</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Increase outreach volume while preserving personalization quality. There are 32
              high-fit prospects waiting for a credible first touch.
            </p>
            <Button variant="secondary" className="mt-5" onClick={() => navigate("outreach")}>
              Build outreach sequence <ArrowRight size={15} />
            </Button>
          </Card>
          <Card className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
              This week’s focus
            </p>
            <div className="mt-4 space-y-3">
              {[
                "Contact 20 high-fit PIs and researchers",
                "Test workflow-first vs. product-first messaging",
                "Review early access quality by persona",
              ].map((text, index) => (
                <div key={text} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
                    {index + 1}
                  </span>
                  <span className="leading-6 text-slate-600">{text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <ICPSetup icp={data.icp} onChange={(icp) => setData((current) => ({ ...current, icp }))} />
    </>
  );
}

function ICPSetup({ icp, onChange }: { icp: ICP; onChange: (icp: ICP) => void }) {
  const fields: Array<{ key: keyof ICP; label: string; large?: boolean }> = [
    { key: "productName", label: "Product name" },
    { key: "primaryConversionGoal", label: "Primary conversion goal" },
    { key: "productDescription", label: "Product description", large: true },
    { key: "targetICP", label: "Target ICP", large: true },
    { key: "primaryPersonas", label: "Primary personas", large: true },
    { key: "corePainPoints", label: "Core pain points", large: true },
    { key: "keyProofPoints", label: "Key proof points", large: true },
    { key: "thingsNotToClaim", label: "Things not to claim", large: true },
  ];
  return (
    <Card className="p-5 sm:p-7">
      <SectionTitle
        eyebrow="GTM foundation"
        title="Product and ICP Setup"
        description="The shared context used by prospect analysis, outreach, and content planning. Changes save automatically."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <FormField key={field.key} label={field.label}>
            {field.large ? (
              <textarea
                className={`${fieldClass} min-h-[90px] resize-y`}
                value={icp[field.key]}
                onChange={(event) => onChange({ ...icp, [field.key]: event.target.value })}
              />
            ) : (
              <input
                className={fieldClass}
                value={icp[field.key]}
                onChange={(event) => onChange({ ...icp, [field.key]: event.target.value })}
              />
            )}
          </FormField>
        ))}
      </div>
    </Card>
  );
}

function Prospects({
  data,
  setData,
  setToast,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (toast: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Prospect>(blankProspect);
  const [personaFilter, setPersonaFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [rawInput, setRawInput] = useState("");
  const [analyzerPersona, setAnalyzerPersona] = useState<Persona>("Researcher");
  const [analysis, setAnalysis] = useState<ProspectAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiSource, setAiSource] = useState<AIOutputSource>(null);

  const filtered = useMemo(
    () =>
      data.prospects.filter((prospect) => {
        const matchesQuery = `${prospect.prospectName} ${prospect.institution} ${prospect.researchField}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return (
          matchesQuery &&
          (personaFilter === "All" || prospect.persona === personaFilter) &&
          (statusFilter === "All" || prospect.status === statusFilter) &&
          (priorityFilter === "All" || prospect.priority === priorityFilter)
        );
      }),
    [data.prospects, query, personaFilter, statusFilter, priorityFilter],
  );

  const addProspect = () => {
    if (!draft.prospectName) return;
    setData((current) => ({
      ...current,
      prospects: [...current.prospects, { ...draft, id: makeId() }],
    }));
    setDraft(blankProspect);
    setShowForm(false);
    setToast("Prospect added to pipeline");
  };

  const analyze = async () => {
    if (!rawInput.trim()) return;
    setLoading(true);
    setAiSource(null);
    try {
      const result = await callAI({
        workflow: "prospect",
        rawInput,
        persona: analyzerPersona,
        icp: data.icp,
      });
      setAnalysis(result);
      setAiSource("openai");
    } catch {
      setAnalysis(fallbackProspectAnalysis(rawInput, analyzerPersona));
      setAiSource("built-in");
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysis = () => {
    if (!analysis) return;
    setData((current) => ({
      ...current,
      prospects: [
        ...current.prospects,
        {
          ...analysis.prospect,
          id: makeId(),
          lastTouch: "Not contacted",
          nextAction: analysis.nextAction,
          channel: "Email",
        },
      ],
    }));
    setToast("Reviewed AI prospect added");
    setAnalysis(null);
    setRawInput("");
  };

  return (
    <>
      <SectionTitle
        eyebrow="Prospect intelligence"
        title="Find the research teams most likely to care"
        description="Turn account context into prioritized, credible outreach decisions."
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? "Close form" : "Add prospect"}
          </Button>
        }
      />
      {showForm && (
        <Card className="mb-6 p-5 sm:p-6">
          <h3 className="mb-5 font-bold">Add prospect manually</h3>
          <ProspectForm draft={draft} setDraft={setDraft} />
          <div className="mt-5 flex justify-end">
            <Button onClick={addProspect} disabled={!draft.prospectName}>
              <Plus size={15} /> Add to prospect table
            </Button>
          </div>
        </Card>
      )}

      <Card className="mb-6 overflow-hidden border-brand-100">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-ink p-5 text-white sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <WandSparkles size={18} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-100">
                  Multi-step AI workflow
                </p>
                <h3 className="text-lg font-bold">AI Prospect Analyzer</h3>
              </div>
            </div>
            <p className="mb-5 text-sm leading-6 text-white/60">
              Paste messy notes. The analyzer scores fit, extracts pain points, identifies missing
              context, and recommends a credible next action.
            </p>
            <textarea
              value={rawInput}
              onChange={(event) => setRawInput(event.target.value)}
              className="min-h-[210px] w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-brand-500"
              placeholder="Paste prospect notes, research interests, lab description, recent paper topics, LinkedIn notes, CRM notes, or outreach context here…"
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <select
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none"
                value={analyzerPersona}
                onChange={(event) => setAnalyzerPersona(event.target.value as Persona)}
              >
                {PERSONAS.map((persona) => (
                  <option className="text-ink" key={persona}>
                    {persona}
                  </option>
                ))}
              </select>
              <select className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none">
                <option className="text-ink">Full prospect analysis</option>
                <option className="text-ink">Score prospect fit</option>
                <option className="text-ink">Identify pain points</option>
                <option className="text-ink">Generate outreach angle</option>
                <option className="text-ink">Create CRM note</option>
              </select>
            </div>
            <Button
              className="mt-4 w-full bg-brand-500 hover:bg-brand-600"
              onClick={analyze}
              disabled={!rawInput.trim() || loading}
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? "Analyzing prospect…" : "Analyze Prospect with AI"}
            </Button>
          </div>
          <div className="p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600">
                  Review step
                </p>
                <h3 className="mt-1 text-lg font-bold">Review AI Output</h3>
              </div>
              {analysis && <PriorityPill priority={analysis.prospect.priority} />}
            </div>
            {!analysis ? (
              <EmptyState text="AI output appears here for human review before anything is saved." />
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Fit score</p>
                    <p className="mt-1 text-xl font-extrabold">{analysis.prospect.fitScore}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Pain point</p>
                    <p className="mt-1 text-sm font-bold">{analysis.prospect.painPoint}</p>
                  </div>
                </div>
                {[
                  ["Why good fit", analysis.analysis.whyGoodFit],
                  ["Best outreach angle", analysis.analysis.bestOutreachAngle],
                  ["Likely objection", analysis.analysis.likelyObjection],
                  ["Next action", analysis.nextAction],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      {label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{value}</p>
                  </div>
                ))}
                <AIOutputStatus source={aiSource} />
                <Button className="w-full" onClick={saveAnalysis}>
                  <Check size={15} /> Save reviewed prospect
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-bold">Prospect table</h3>
              <p className="mt-1 text-xs text-muted">{filtered.length} prospects in current view</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">
              <Lightbulb size={14} />
              Prioritize high-fit PIs with clear discovery pain
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                className={`${fieldClass} pl-9`}
                placeholder="Search name, institution, or field"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select className={fieldClass} value={personaFilter} onChange={(e) => setPersonaFilter(e.target.value)}>
              <option>All</option>
              {PERSONAS.map((persona) => <option key={persona}>{persona}</option>)}
            </select>
            <select className={fieldClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All</option>
              {STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
            <select className={fieldClass} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="px-5 py-3">Prospect</th>
                <th className="px-4 py-3">Persona</th>
                <th className="px-4 py-3">Research field</th>
                <th className="px-4 py-3">Pain point</th>
                <th className="px-4 py-3">Fit</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prospect) => (
                <tr key={prospect.id} className="text-sm hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="font-bold">{prospect.prospectName}</p>
                    <p className="mt-1 text-xs text-muted">{prospect.institution} · {prospect.role}</p>
                  </td>
                  <td className="px-4 py-4 text-xs font-semibold text-slate-600">{prospect.persona}</td>
                  <td className="px-4 py-4 text-xs text-slate-600">{prospect.researchField}</td>
                  <td className="max-w-[210px] px-4 py-4 text-xs text-slate-600">{prospect.painPoint}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold">{prospect.fitScore}</span>
                      <div className="h-1.5 w-12 rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${prospect.fitScore}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><PriorityPill priority={prospect.priority} /></td>
                  <td className="px-4 py-4"><StatusPill status={prospect.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function ProspectForm({
  draft,
  setDraft,
}: {
  draft: Prospect;
  setDraft: React.Dispatch<React.SetStateAction<Prospect>>;
}) {
  const input = (key: keyof Prospect, type = "text") => (
    <input
      type={type}
      className={fieldClass}
      value={draft[key] as string | number}
      onChange={(e) =>
        setDraft((current) => ({
          ...current,
          [key]: type === "number" ? Number(e.target.value) : e.target.value,
        }))
      }
    />
  );
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <FormField label="Prospect name">{input("prospectName")}</FormField>
      <FormField label="Institution">{input("institution")}</FormField>
      <FormField label="Role">{input("role")}</FormField>
      <FormField label="Persona">
        <select
          className={fieldClass}
          value={draft.persona}
          onChange={(e) => setDraft({ ...draft, persona: e.target.value as Persona })}
        >
          {PERSONAS.map((persona) => <option key={persona}>{persona}</option>)}
        </select>
      </FormField>
      <FormField label="Research field">{input("researchField")}</FormField>
      <FormField label="Source">{input("source")}</FormField>
      <FormField label="Pain point">{input("painPoint")}</FormField>
      <FormField label="Fit score">{input("fitScore", "number")}</FormField>
      <FormField label="Priority">
        <select
          className={fieldClass}
          value={draft.priority}
          onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}
        >
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
      </FormField>
      <FormField label="Status">
        <select
          className={fieldClass}
          value={draft.status}
          onChange={(e) => setDraft({ ...draft, status: e.target.value as Status })}
        >
          {STATUSES.map((status) => <option key={status}>{status}</option>)}
        </select>
      </FormField>
      <FormField label="Recent context">{input("recentContext")}</FormField>
      <FormField label="Notes">{input("notes")}</FormField>
    </div>
  );
}

function Outreach({
  data,
  setData,
  setToast,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (toast: string) => void;
}) {
  const [prospectId, setProspectId] = useState(data.prospects[0]?.id || "");
  const [tone, setTone] = useState("Academic");
  const [goal, setGoal] = useState("Early access");
  const [length, setLength] = useState("3-email sequence");
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState<OutreachSequence | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiSource, setAiSource] = useState<AIOutputSource>(null);
  const prospect = data.prospects.find((item) => item.id === prospectId);

  const generate = async () => {
    if (!prospect) return;
    setLoading(true);
    setAiSource(null);
    try {
      const result = await callAI({
        workflow: "outreach",
        rawInput: JSON.stringify(prospect),
        persona: prospect.persona,
        icp: data.icp,
        context: prospect,
        options: { tone, goal, length, notes },
      });
      setOutput({
        id: makeId(),
        prospectId: prospect.id,
        prospectName: prospect.prospectName,
        tone,
        goal,
        createdAt: new Date().toISOString(),
        ...result,
      });
      setAiSource("openai");
    } catch {
      setOutput(fallbackOutreach(prospect, tone, goal, notes));
      setAiSource("built-in");
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    if (!output) return;
    setData((current) => ({ ...current, outreach: [output, ...current.outreach] }));
    setToast("Reviewed outreach sequence saved");
  };

  return (
    <>
      <SectionTitle
        eyebrow="AI outreach builder"
        title="Create credible outreach for academic audiences"
        description="Personalization is grounded in supplied context, with a human review step before saving."
      />
      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card className="h-fit p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="font-bold">Sequence inputs</h3>
              <p className="text-xs text-muted">One prospect, one goal, one clear CTA</p>
            </div>
          </div>
          <div className="space-y-4">
            <FormField label="Select prospect">
              <select className={fieldClass} value={prospectId} onChange={(e) => setProspectId(e.target.value)}>
                {data.prospects.map((item) => <option key={item.id} value={item.id}>{item.prospectName} · {item.persona}</option>)}
              </select>
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Tone">
                <select className={fieldClass} value={tone} onChange={(e) => setTone(e.target.value)}>
                  {["Academic", "Concise", "Warm", "Technical", "Founder-like"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </FormField>
              <FormField label="Campaign goal">
                <select className={fieldClass} value={goal} onChange={(e) => setGoal(e.target.value)}>
                  {["Early access", "Product demo", "Research interview", "Newsletter signup", "Feedback call"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="Sequence length">
              <select className={fieldClass} value={length} onChange={(e) => setLength(e.target.value)}>
                {["1 email", "3-email sequence", "LinkedIn message + email"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
            <FormField label="Custom notes">
              <textarea
                className={`${fieldClass} min-h-[110px] resize-y`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add verified context, constraints, or message direction…"
              />
            </FormField>
            {prospect && (
              <div className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
                <p className="font-bold text-ink">{prospect.prospectName} · Fit {prospect.fitScore}</p>
                <p className="mt-1">{prospect.recentContext}</p>
              </div>
            )}
            <Button className="w-full" onClick={generate} disabled={!prospect || loading}>
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? "Generating…" : "Generate Outreach Sequence"}
            </Button>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600">Human review</p>
                <h3 className="mt-1 text-lg font-bold">Generated sequence</h3>
              </div>
              {output && <Button onClick={save}><Save size={15} /> Save sequence</Button>}
            </div>
            {!output ? (
              <EmptyState text="Generate a sequence to review every message, claim, and CTA before saving." />
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {output.subjectLines.map((line) => (
                    <span key={line} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{line}</span>
                  ))}
                </div>
                {[
                  ["Email 1", output.email1],
                  ["Follow-up 1", output.followUp1],
                  ["Follow-up 2", output.followUp2],
                  ["LinkedIn message", output.linkedInMessage],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
                    <textarea
                      className={`${fieldClass} min-h-[120px] resize-y leading-6`}
                      value={value}
                      onChange={(e) => {
                        const map: Record<string, keyof OutreachSequence> = {
                          "Email 1": "email1",
                          "Follow-up 1": "followUp1",
                          "Follow-up 2": "followUp2",
                          "LinkedIn message": "linkedInMessage",
                        };
                        setOutput({ ...output, [map[label]]: e.target.value });
                      }}
                    />
                  </div>
                ))}
                <AIOutputStatus source={aiSource} />
              </div>
            )}
          </Card>
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCheck size={17} className="text-brand-600" />
              <h3 className="font-bold">Quality check</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Mentions a real pain point",
                "Avoids unsupported claims",
                "Specific to the persona",
                "CTA is clear and low-friction",
                "Sounds human, not automated",
              ].map((check) => (
                <label key={check} className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-brand-600" /> {check}
                </label>
              ))}
            </div>
            {output && (
              <div className="mt-4 rounded-xl bg-orange-50 p-3 text-xs leading-5 text-orange-800">
                <strong>Risk check:</strong> {output.riskCheck}
              </div>
            )}
          </Card>
          {data.outreach.length > 0 && (
            <Card className="p-5">
              <h3 className="mb-4 font-bold">Saved sequences</h3>
              <div className="space-y-2">
                {data.outreach.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div><p className="text-sm font-bold">{item.prospectName}</p><p className="text-xs text-muted">{item.goal} · {item.tone}</p></div>
                    <CheckCircle2 size={16} className="text-brand-600" />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Pipeline({
  data,
  setData,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
}) {
  const updateStatus = (id: string, status: Status) => {
    setData((current) => ({
      ...current,
      prospects: current.prospects.map((prospect) =>
        prospect.id === id ? { ...prospect, status } : prospect,
      ),
    }));
  };
  const metrics = [
    ["Contacted → engaged", "37.2%", "+4.1%"],
    ["Engaged → interested", "59.4%", "+6.8%"],
    ["Meetings booked", "8", "42% of interested"],
    ["Best persona", "Principal Investigator", "18.7% reply"],
    ["Best channel", "Warm email", "21.3% reply"],
  ];
  const visibleStages = STATUSES.filter((status) => status !== "Not a Fit");

  return (
    <>
      <SectionTitle
        eyebrow="Pipeline tracker"
        title="Move prospects based on evidence"
        description="Track next actions and conversion quality across the full research GTM funnel."
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(([label, value, detail]) => (
          <Card key={label} className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
            <p className="mt-2 text-lg font-extrabold">{value}</p>
            <p className="mt-1 text-[11px] font-semibold text-brand-600">{detail}</p>
          </Card>
        ))}
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="grid min-w-[2100px] grid-cols-8 gap-3">
          {visibleStages.map((status) => {
            const prospects = data.prospects.filter((prospect) => prospect.status === status);
            return (
              <div key={status} className="rounded-2xl bg-slate-100/70 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-xs font-bold">{status}</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-muted">{prospects.length}</span>
                </div>
                <div className="space-y-3">
                  {prospects.map((prospect) => (
                    <Card key={prospect.id} className="p-3.5 shadow-sm">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold">{prospect.prospectName}</p>
                          <p className="mt-0.5 text-[11px] text-muted">{prospect.institution}</p>
                        </div>
                        <span className="rounded-lg bg-brand-50 px-2 py-1 text-[11px] font-extrabold text-brand-700">{prospect.fitScore}</span>
                      </div>
                      <p className="mb-3 text-[11px] font-semibold text-slate-500">{prospect.persona}</p>
                      <div className="mb-3 space-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                        <p><strong className="text-slate-700">Last:</strong> {prospect.lastTouch}</p>
                        <p className="leading-4"><strong className="text-slate-700">Next:</strong> {prospect.nextAction}</p>
                      </div>
                      <select
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] font-semibold outline-none"
                        value={prospect.status}
                        onChange={(e) => updateStatus(prospect.id, e.target.value as Status)}
                      >
                        {STATUSES.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </Card>
                  ))}
                  {prospects.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-[11px] text-slate-400">No prospects</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function SEO({
  data,
  setData,
  setToast,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (toast: string) => void;
}) {
  const blank: SEOExperiment = {
    id: "",
    experimentName: "",
    targetQuery: "AI tool for researchers",
    searchIntent: "Find a solution",
    contentType: "Blog post",
    hypothesis: "",
    publishStatus: "Draft",
    impressions: 0,
    clicks: 0,
    signups: 0,
    earlyAccessRequests: 0,
    notes: "",
  };
  const [draft, setDraft] = useState(blank);
  const [showForm, setShowForm] = useState(false);
  const add = () => {
    if (!draft.experimentName) return;
    setData((current) => ({ ...current, seoExperiments: [...current.seoExperiments, { ...draft, id: makeId() }] }));
    setDraft(blank);
    setShowForm(false);
    setToast("SEO experiment added");
  };
  const ctr = (item: SEOExperiment) => (item.impressions ? (item.clicks / item.impressions) * 100 : 0);
  const conversion = (item: SEOExperiment) => (item.clicks ? (item.earlyAccessRequests / item.clicks) * 100 : 0);

  return (
    <>
      <SectionTitle
        eyebrow="SEO experiments"
        title="Measure qualified demand, not just traffic"
        description="Design search experiments around researcher intent and downstream conversion."
        action={<Button onClick={() => setShowForm(!showForm)}>{showForm ? <X size={15} /> : <Plus size={15} />}{showForm ? "Close form" : "New experiment"}</Button>}
      />
      <Card className="mb-6 border-brand-100 bg-brand-50/60 p-5">
        <div className="flex gap-3">
          <Lightbulb size={20} className="mt-0.5 shrink-0 text-brand-700" />
          <div>
            <p className="text-sm font-bold text-brand-800">Conversion quality is the north star</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">Do not optimize only for impressions. Prioritize search queries that create early access requests or qualified researcher conversations.</p>
          </div>
        </div>
      </Card>
      {showForm && (
        <Card className="mb-6 p-5 sm:p-6">
          <h3 className="mb-5 font-bold">Design an SEO experiment</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Experiment name", "experimentName"],
              ["Target query", "targetQuery"],
              ["Search intent", "searchIntent"],
              ["Hypothesis", "hypothesis"],
              ["Notes", "notes"],
            ].map(([label, key]) => (
              <FormField key={key} label={label}>
                <input className={fieldClass} value={draft[key as keyof SEOExperiment] as string} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
              </FormField>
            ))}
            <FormField label="Content type">
              <select className={fieldClass} value={draft.contentType} onChange={(e) => setDraft({ ...draft, contentType: e.target.value })}>
                {["Blog post", "Landing page", "LinkedIn post", "Newsletter", "Programmatic page", "Research workflow guide"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
            <FormField label="Publish status">
              <select className={fieldClass} value={draft.publishStatus} onChange={(e) => setDraft({ ...draft, publishStatus: e.target.value })}>
                <option>Draft</option><option>Scheduled</option><option>Live</option><option>Complete</option>
              </select>
            </FormField>
          </div>
          <div className="mt-5 flex justify-end"><Button onClick={add}><Plus size={15} /> Add experiment</Button></div>
        </Card>
      )}
      <div className="grid gap-5 xl:grid-cols-3">
        {data.seoExperiments.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Search size={16} /></div>
              <StatusPill status={item.publishStatus} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-600">{item.targetQuery}</p>
            <h3 className="mt-2 font-bold">{item.experimentName}</h3>
            <p className="mt-2 min-h-[40px] text-xs leading-5 text-muted">{item.hypothesis}</p>
            <div className="mt-5 grid grid-cols-4 gap-2 border-y border-slate-100 py-4">
              {[["Impr.", item.impressions], ["Clicks", item.clicks], ["CTR", `${ctr(item).toFixed(1)}%`], ["EA conv.", `${conversion(item).toFixed(1)}%`]].map(([label, value]) => (
                <div key={label}><p className="text-[9px] font-bold uppercase text-slate-400">{label}</p><p className="mt-1 text-sm font-extrabold">{value}</p></div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-600">{item.notes}</p>
          </Card>
        ))}
      </div>
    </>
  );
}

function ContentEngine({
  data,
  setData,
  setToast,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (toast: string) => void;
}) {
  const [persona, setPersona] = useState("Researcher");
  const [researchField, setResearchField] = useState("Computational Biology");
  const [painPoint, setPainPoint] = useState("Literature overload");
  const [format, setFormat] = useState("Research workflow guide");
  const [keyword, setKeyword] = useState("AI literature review tool");
  const [cta, setCta] = useState("Request early access");
  const [output, setOutput] = useState<ContentIdea | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiSource, setAiSource] = useState<AIOutputSource>(null);

  const generate = async () => {
    setLoading(true);
    setAiSource(null);
    try {
      const rawInput = JSON.stringify({ persona, researchField, painPoint, format, keyword, cta });
      const result = await callAI({ workflow: "content", rawInput, persona, icp: data.icp });
      setOutput({ id: makeId(), persona, researchField, painPoint, format, targetKeyword: keyword, ...result });
      setAiSource("openai");
    } catch {
      setOutput(fallbackContent(persona, researchField, painPoint, format, keyword, cta));
      setAiSource("built-in");
    } finally {
      setLoading(false);
    }
  };
  const save = () => {
    if (!output) return;
    setData((current) => ({ ...current, contentIdeas: [output, ...current.contentIdeas] }));
    setToast("Content plan saved");
  };

  return (
    <>
      <SectionTitle
        eyebrow="Programmatic content engine"
        title="Plan content researchers will actually trust"
        description="Use AI to structure domain-specific content ideas for human review, not mass publishing."
      />
      <Card className="mb-6 border-orange-100 bg-orange-50/60 p-4">
        <div className="flex gap-3 text-sm leading-6 text-orange-900">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
          <p><strong>Credibility first.</strong> Academic audiences will not respond to generic AI content. Review for accuracy, specificity, and credibility before publishing.</p>
        </div>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card className="h-fit p-5 sm:p-6">
          <h3 className="mb-5 font-bold">Content brief inputs</h3>
          <div className="space-y-4">
            <FormField label="Persona"><select className={fieldClass} value={persona} onChange={(e) => setPersona(e.target.value)}>{PERSONAS.map((item) => <option key={item}>{item}</option>)}</select></FormField>
            <FormField label="Research field"><input className={fieldClass} value={researchField} onChange={(e) => setResearchField(e.target.value)} /></FormField>
            <FormField label="Pain point"><input className={fieldClass} value={painPoint} onChange={(e) => setPainPoint(e.target.value)} /></FormField>
            <FormField label="Content format"><select className={fieldClass} value={format} onChange={(e) => setFormat(e.target.value)}>{["Blog post", "LinkedIn post", "Email newsletter", "Landing page", "Research workflow guide"].map((item) => <option key={item}>{item}</option>)}</select></FormField>
            <FormField label="Target keyword"><input className={fieldClass} value={keyword} onChange={(e) => setKeyword(e.target.value)} /></FormField>
            <FormField label="CTA"><input className={fieldClass} value={cta} onChange={(e) => setCta(e.target.value)} /></FormField>
            <Button className="w-full" onClick={generate} disabled={loading}>{loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}{loading ? "Planning…" : "Generate content plan"}</Button>
          </div>
        </Card>
        <Card className="p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600">Review output</p><h3 className="mt-1 text-lg font-bold">Content plan</h3></div>
            {output && <Button onClick={save}><Save size={15} /> Save idea</Button>}
          </div>
          {!output ? <EmptyState text="Generate a credible content plan with a hook, outline, warnings, and a meaningful metric." /> : (
            <div className="space-y-5">
              <div className="rounded-2xl bg-ink p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-100">{output.format} · {output.targetKeyword}</p>
                <h2 className="mt-3 text-2xl font-extrabold leading-tight">{output.title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/65">{output.hook}</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div><p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Outline</p><ol className="space-y-2">{output.outline.map((item, index) => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600"><span className="font-extrabold text-brand-600">{index + 1}.</span>{item}</li>)}</ol></div>
                <div><p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Key points</p><ul className="space-y-2">{output.keyPoints.map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600"><CheckCircle2 size={15} className="mt-1 shrink-0 text-brand-600" />{item}</li>)}</ul></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-orange-50 p-4 text-xs leading-5 text-orange-800"><strong>Credibility warning:</strong> {output.credibilityWarning}</div>
                <div className="rounded-xl bg-brand-50 p-4 text-xs leading-5 text-brand-800"><strong>Metric to track:</strong> {output.suggestedMetric}</div>
              </div>
              <AIOutputStatus source={aiSource} />
            </div>
          )}
        </Card>
      </div>
      {data.contentIdeas.length > 0 && (
        <div className="mt-7">
          <SectionTitle title="Saved content plans" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.contentIdeas.map((item) => <Card key={item.id} className="p-5"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-600">{item.format} · {item.persona}</p><h3 className="mt-2 font-bold">{item.title}</h3><p className="mt-3 text-xs leading-5 text-muted">{item.suggestedMetric}</p></Card>)}
          </div>
        </div>
      )}
    </>
  );
}

function CommandCenter({
  data,
  setData,
  setToast,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (toast: string) => void;
}) {
  const [rawInput, setRawInput] = useState("");
  const [output, setOutput] = useState<CommandOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiSource, setAiSource] = useState<AIOutputSource>(null);
  const [health, setHealth] = useState<{ apiRouteWorking?: boolean; openaiConfigured?: boolean; ms?: number; error?: string }>({});
  const checkboxes = ["Update ICP", "Extract prospects", "Create outreach angles", "Generate SEO experiments", "Generate content ideas", "Update pipeline", "Generate recommendations", "Create next-best actions"];
  const [selected, setSelected] = useState(checkboxes);

  const organize = async () => {
    if (!rawInput.trim()) return;
    setLoading(true);
    setAiSource(null);
    try {
      const result = await callAI({ workflow: "command", rawInput, icp: data.icp, options: { selected } });
      setOutput(result);
      setAiSource("openai");
    } catch {
      setOutput(fallbackCommand(rawInput, data.icp));
      setAiSource("built-in");
    } finally {
      setLoading(false);
    }
  };

  const testHealth = async () => {
    const start = performance.now();
    try {
      const response = await fetch("/api/health");
      if (!response.ok) throw new Error("Check that /api/health exists and Vercel deployed functions.");
      const body = await response.json();
      setHealth({ ...body, ms: Math.round(performance.now() - start) });
    } catch (error) {
      setHealth({ error: error instanceof Error ? error.message : "API route not found", ms: Math.round(performance.now() - start) });
    }
  };
  const testAnalysis = async () => {
    const start = performance.now();
    try {
      await callAI({ workflow: "prospect", rawInput: "Researcher evaluating literature discovery workflows.", persona: "Researcher", icp: data.icp });
      setHealth((current) => ({ ...current, apiRouteWorking: true, openaiConfigured: true, ms: Math.round(performance.now() - start), error: "" }));
    } catch (error) {
      setHealth((current) => ({ ...current, apiRouteWorking: true, openaiConfigured: false, ms: Math.round(performance.now() - start), error: error instanceof Error ? error.message : "AI test failed" }));
    }
  };

  const recommendations = useMemo(() => {
    const highFitWaiting = data.prospects.filter((p) => p.fitScore >= 80 && ["Targeted", "Researched", "Qualified"].includes(p.status)).length;
    const highImpressionLowClick = data.seoExperiments.filter((s) => s.impressions > 2000 && s.clicks / s.impressions < 0.04).length;
    return [
      { title: "Increase qualified outreach volume", issue: `${highFitWaiting} high-fit prospects are waiting`, metric: "Qualified → Contacted is the largest drop", action: "Send 20 workflow-first messages this week", priority: "High", confidence: "High" },
      { title: "Improve search intent match", issue: `${highImpressionLowClick} experiment has high impressions and low CTR`, metric: "CTR below 4%", action: "Rewrite title and opening around the exact researcher job-to-be-done", priority: "Medium", confidence: "High" },
      { title: "Double down on PI learning", issue: "PIs show the strongest reply signal", metric: "18.7% reply rate", action: "Run the next messaging experiment with Principal Investigators", priority: "High", confidence: "Medium" },
    ];
  }, [data]);

  return (
    <>
      <SectionTitle
        eyebrow="AI command center"
        title="Messy GTM Notes to Structured Plan"
        description="Turn campaign results, prospect research, and meeting notes into an editable GTM action plan."
      />
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="h-fit overflow-hidden">
          <div className="bg-ink p-5 text-white sm:p-6">
            <div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><BrainCircuit size={19} /></div><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-100">Multi-step organizer</p><h3 className="font-bold">Choose what to extract</h3></div></div>
            <textarea className="min-h-[260px] w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-brand-500" value={rawInput} onChange={(e) => setRawInput(e.target.value)} placeholder="Paste messy GTM notes, campaign results, prospect research, SEO ideas, CRM notes, or meeting notes here…" />
            <Button className="mt-4 w-full bg-brand-500 hover:bg-brand-600" onClick={organize} disabled={!rawInput.trim() || loading}>{loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}{loading ? "Organizing notes…" : "Organize with AI"}</Button>
          </div>
          <div className="p-5 sm:p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Requested outputs</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {checkboxes.map((item) => <label key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-600"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={selected.includes(item)} onChange={() => setSelected((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} />{item}</label>)}
            </div>
          </div>
        </Card>
        <Card className="p-5 sm:p-7">
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600">Review before applying</p><h3 className="mt-1 text-lg font-bold">Structured GTM plan</h3></div>
          {!output ? <EmptyState text="Your organized plan will appear here. Nothing is applied without review." /> : (
            <div className="space-y-5">
              <div className="rounded-2xl bg-brand-50 p-5">
                <div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">Main insight</p><span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-brand-700">{output.summary.confidenceScore}% confidence</span></div>
                <h3 className="text-lg font-extrabold">{output.summary.mainInsight}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600"><strong>Recommended focus:</strong> {output.summary.recommendedFocus}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["Outreach angles", output.outreachAngles, Mail],
                  ["SEO experiments", output.seoExperiments, Search],
                  ["Recommendations", output.recommendations, Lightbulb],
                  ["Next-best actions", output.nextBestActions, Zap],
                ].map(([title, items, Icon]) => {
                  const ListIcon = Icon as React.ElementType;
                  return <div key={title as string} className="rounded-xl border border-slate-200 p-4"><div className="mb-3 flex items-center gap-2"><ListIcon size={15} className="text-brand-600" /><p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{title as string}</p></div><ul className="space-y-2">{(items as string[]).length ? (items as string[]).map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-slate-600"><CircleDot size={12} className="mt-1 shrink-0 text-brand-500" />{item}</li>) : <li className="text-xs text-slate-400">No items extracted</li>}</ul></div>;
                })}
              </div>
              {output.dataQualityWarnings.length > 0 && <div className="rounded-xl bg-orange-50 p-4 text-xs leading-5 text-orange-800"><strong>Data quality:</strong> {output.dataQualityWarnings.join(" ")}</div>}
              <AIOutputStatus source={aiSource} />
              <Button className="w-full" onClick={() => setToast("Reviewed plan marked ready for execution")}><Check size={15} /> Mark reviewed plan ready</Button>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-8">
        <SectionTitle eyebrow="Recommendation engine" title="Next-best GTM actions" description="Rule-based recommendations connect funnel evidence to a focused action." />
        <div className="grid gap-4 xl:grid-cols-3">
          {recommendations.map((item) => <Card key={item.title} className="p-5"><div className="mb-4 flex items-start justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Lightbulb size={16} /></div><PriorityPill priority={item.priority} /></div><h3 className="font-bold">{item.title}</h3><p className="mt-3 text-xs leading-5 text-slate-600">{item.issue}</p><div className="my-4 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600">{item.metric}</div><p className="text-sm leading-6 text-ink">{item.action}</p><p className="mt-4 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{item.confidence} confidence</p></Card>)}
        </div>
      </div>

      <Card className="mt-8 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div><div className="mb-2 flex items-center gap-2"><Activity size={17} className="text-brand-600" /><h3 className="font-bold">AI Health + Connection Test</h3></div><p className="text-xs text-muted">Verify serverless routes and environment configuration before a live demo.</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={testHealth}><Activity size={15} /> Test API Health</Button><Button onClick={testAnalysis}><Sparkles size={15} /> Test AI Analysis</Button></div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {[["API route reachable", health.apiRouteWorking === undefined ? "Not tested" : health.apiRouteWorking ? "Yes" : "No"], ["OpenAI configured", health.openaiConfigured === undefined ? "Unknown" : health.openaiConfigured ? "Yes" : "No"], ["Last response time", health.ms ? `${health.ms} ms` : "—"], ["Last error", health.error || "None"]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-400">{label}</p><p className="mt-1 truncate text-xs font-bold" title={value}>{value}</p></div>)}
        </div>
      </Card>
    </>
  );
}

const prompts = [
  { name: "Prospect Research Prompt", use: "Turn lab notes into verified prospect context", text: "Analyze the provided researcher or lab notes. Separate verified facts from assumptions. Identify role, research field, recent context, likely workflow pain, missing information, and a credible next research step.", why: "Forces evidence separation before personalization.", variables: "prospect notes, ICP, desired action" },
  { name: "Persona Classification Prompt", use: "Map contacts to actionable personas", text: "Classify this contact as Researcher, PI, Lab Administrator, Department Lead, Industry R&D, or Other. Explain which responsibilities in the provided context support the classification. Do not infer seniority without evidence.", why: "Connects role context to message strategy.", variables: "role, bio, responsibilities" },
  { name: "Pain Point Extraction Prompt", use: "Identify workflow pains from messy notes", text: "Extract explicit and likely research workflow pain points. Label each as explicit or inferred, quote the supporting context in short form, and recommend one validation question.", why: "Keeps inferred pain from becoming a false claim.", variables: "notes, persona, product context" },
  { name: "Outreach Sequence Prompt", use: "Build a credible academic sequence", text: "Write a concise outreach sequence for the selected persona using only supplied context. Avoid hype, fake flattery, and unsupported claims. Use one real workflow pain and a low-friction CTA.", why: "Sets a clear quality bar and message constraints.", variables: "persona, prospect context, tone, CTA" },
  { name: "SEO Keyword Clustering Prompt", use: "Group queries by researcher intent", text: "Cluster these research-AI search queries by intent, persona, and likely conversion action. Recommend one content format and meaningful conversion metric per cluster.", why: "Connects SEO traffic to downstream demand.", variables: "keyword list, ICP, conversion goals" },
  { name: "Programmatic Content Prompt", use: "Plan credible content variants", text: "Create a content plan for this academic persona and workflow pain. Include a domain-specific hook, outline, credibility risks, required expert review, and the qualified-demand metric to track.", why: "Positions AI as a planning assistant, not an autopublisher.", variables: "persona, field, pain, keyword" },
  { name: "CRM Note Prompt", use: "Create useful next-step notes", text: "Turn these interaction notes into a concise CRM entry with verified context, pain point, objection, stage, next action, owner, and date. Flag missing information.", why: "Makes notes operational and auditable.", variables: "interaction notes, current stage" },
  { name: "Campaign Postmortem Prompt", use: "Turn campaign metrics into learning", text: "Analyze this GTM experiment by persona, message, channel, and conversion stage. Identify the strongest signal, biggest uncertainty, and the next smallest test that would reduce uncertainty.", why: "Prioritizes learning over activity.", variables: "campaign brief, results, baseline" },
];

function PromptLibrary() {
  return (
    <>
      <SectionTitle eyebrow="Prompt library" title="Reusable prompts for credible research GTM" description="Each prompt is designed to produce structured decisions, surface uncertainty, and prevent unsupported claims." />
      <Card className="mb-6 overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="bg-red-50 p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.14em] text-red-700">Bad prompt</p><p className="mt-3 text-lg font-bold text-red-950">“Write an email to a researcher about our AI tool.”</p><p className="mt-4 text-xs leading-5 text-red-800">No context, no constraints, no credibility guardrails, and no useful output structure.</p></div>
          <div className="bg-brand-50 p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Good prompt</p><p className="mt-3 text-sm font-bold leading-6 text-brand-950">“You are writing to a computational biology researcher. Use only the notes provided. Keep the tone credible, concise, and non-salesy. Do not invent details. Mention one likely research workflow pain point. Return a subject line, 100-word email, CTA, and CRM note.”</p><p className="mt-4 text-xs leading-5 text-brand-800">Clear role, source boundaries, voice, risk controls, and output format.</p></div>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {prompts.map((prompt, index) => (
          <Card key={prompt.name} className="p-5 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Code2 size={16} /></div><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">0{index + 1}</span></div>
            <h3 className="font-bold">{prompt.name}</h3><p className="mt-1 text-xs font-semibold text-brand-600">{prompt.use}</p>
            <div className="my-4 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">{prompt.text}</div>
            <div className="grid gap-3 sm:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Why it works</p><p className="mt-1 text-xs leading-5 text-slate-600">{prompt.why}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Variables to replace</p><p className="mt-1 text-xs leading-5 text-slate-600">{prompt.variables}</p></div></div>
          </Card>
        ))}
      </div>
    </>
  );
}

export default App;
