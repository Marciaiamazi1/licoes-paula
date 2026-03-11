import React, { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import StatusCards from "./components/StatusCards";
import FilterBar from "./components/FilterBar";
import TaskList from "./components/TaskList";
import Calendario from "./components/Calendario";
import Lembretes from "./components/Lembretes";
import TaskModal from "./components/TaskModal";
import AddTaskModal from "./components/AddTaskModal";
import "./App.css";

// ─── PLANILHA GOOGLE SHEETS ───────────────────────────────────
const SHEET_ID = "1efGIrzxE_5vHvbEW6KLLlj06-c8JfpDU9I_fieGqZmE";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=tarefas`;

// ─── HELPERS ──────────────────────────────────────────────────
export const uid = () => Math.random().toString(36).slice(2, 9);

export const getStatus = (date, done) => {
  if (done) return "concluida";
  if (!date) return "pendente";
  const diff = Math.ceil(
    (new Date(date + "T00:00:00") - new Date().setHours(0, 0, 0, 0)) / 86400000
  );
  if (diff < 0) return "atrasada";
  if (diff <= 1) return "urgente";
  return "pendente";
};

export const fmtDate = (date) => {
  if (!date) return null;
  const [, m, d] = date.split("-");
  const diff = Math.ceil(
    (new Date(date + "T00:00:00") - new Date().setHours(0, 0, 0, 0)) / 86400000
  );
  if (diff < 0) return `Atrasou ${Math.abs(diff)}d`;
  if (diff === 0) return "Hoje!";
  if (diff === 1) return "Amanhã";
  if (diff <= 4) return `Em ${diff} dias`;
  return `${d}/${m}`;
};

export const COR_MAP = {
  Matemática: "#4cc9f0", Português: "#f72585", Ciências: "#06d6a0",
  História: "#ffd60a", Geografia: "#7bed9f", Inglês: "#a29bfe",
  Artes: "#fd79a8", "Ed. Física": "#fdcb6e", Filosofia: "#e17055", Outra: "#b2bec3",
};

export const EMOJI_MAP = {
  Matemática: "📐", Português: "📖", Ciências: "🔬", História: "🏛️",
  Geografia: "🌍", Inglês: "🇺🇸", Artes: "🎨", "Ed. Física": "⚽",
  Filosofia: "🧠", Outra: "📝",
};

export const PLATAFORMA_ICON = {
  "Eureka": "🌐", "Google Classroom": "💻", "Caderno": "📓",
  "Livro didático": "📚", "Folha avulsa": "📋", "Vindimo": "📱",
  "Escola": "🏫", "Caderno Suplementar": "📒", "Presencial": "📍",
};

export const MATERIAS = [
  "Todas", "Matemática", "Português", "Ciências", "História",
  "Geografia", "Inglês", "Artes", "Ed. Física", "Filosofia",
];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────
export default function App() {
  const [tasksSheet, setTasksSheet] = useState([]);
  const [tasksLocal, setTasksLocal] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lp_local") || "[]"); } catch { return []; }
  });
  const [doneIds, setDoneIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lp_done") || "[]"); } catch { return []; }
  });

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [ultimaSync, setUltimaSync] = useState("");
  const [view, setView] = useState("lista"); // "lista" | "calendario"
  const [filtroStatus, setFiltroStatus] = useState("todos"); // "todos"|"pendente"|"urgente"|"atrasada"|"concluida"
  const [filtroMateria, setFiltroMateria] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [taskSelecionada, setTaskSelecionada] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState("");

  // ── BUSCA NA PLANILHA ──────────────────────────────────────
  const buscarPlanilha = useCallback(async () => {
    setLoading(true); setErro("");
    try {
      const res = await fetch(SHEET_URL);
      const text = await res.text();
      const json = JSON.parse(text.replace(/^[^(]+\(|\);?\s*$/g, ""));
      const rows = json.table?.rows || [];
      const tarefas = rows.slice(1).filter(r => r?.c?.[3]?.v).map(row => ({
        id: row.c[0]?.v || uid(),
        materia: row.c[1]?.v || "Outra",
        emoji: row.c[2]?.v || "📝",
        desc: row.c[3]?.v || "",
        date: row.c[4]?.v || "",
        platform: row.c[5]?.v || "",
        obs: row.c[6]?.v || "",
        tipo: row.c[7]?.v || "licao",
      }));
      setTasksSheet(tarefas);
      setUltimaSync(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setErro("Não foi possível carregar a planilha. Verifique se ela está pública.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    buscarPlanilha();
    const t = setInterval(buscarPlanilha, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [buscarPlanilha]);

  useEffect(() => { try { localStorage.setItem("lp_local", JSON.stringify(tasksLocal)); } catch { } }, [tasksLocal]);
  useEffect(() => { try { localStorage.setItem("lp_done", JSON.stringify(doneIds)); } catch { } }, [doneIds]);

  // ── AÇÕES ──────────────────────────────────────────────────
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const toggle = (id) => {
    setDoneIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    showToast(doneIds.includes(id) ? "↩️ Marcada como pendente" : "✅ Concluída!");
  };

  const del = (id) => {
    setTasksLocal(prev => prev.filter(x => x.id !== id));
    setDoneIds(prev => prev.filter(x => x !== id));
    showToast("🗑️ Removida");
  };

  const addTask = (form) => {
    setTasksLocal(prev => [{ id: uid(), ...form, emoji: EMOJI_MAP[form.materia] || "📝" }, ...prev]);
    setShowAddModal(false);
    showToast("📚 Lição adicionada!");
  };

  // ── TAREFAS COMPLETAS ──────────────────────────────────────
  const allTasks = [...tasksSheet, ...tasksLocal].map(t => ({
    ...t,
    done: doneIds.includes(t.id),
    status: getStatus(t.date, doneIds.includes(t.id)),
    // Limpa platform para evitar undefined/undefined
    platform: t.platform && t.platform !== "undefined" ? t.platform : "",
  }));

  // Filtra lembretes e provas separadamente
  const licoes = allTasks.filter(t => t.tipo === "licao" || t.tipo === "prova");
  const lembretes = allTasks.filter(t => t.tipo === "lembrete");

  // ── FILTROS ────────────────────────────────────────────────
  const tasksFiltradas = licoes.filter(t => {
    if (filtroStatus !== "todos" && t.status !== filtroStatus) return false;
    if (filtroMateria !== "Todas" && t.materia !== filtroMateria) return false;
    if (busca && !t.desc?.toLowerCase().includes(busca.toLowerCase()) &&
      !t.materia?.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const ordem = { atrasada: 0, urgente: 1, pendente: 2, concluida: 3 };
    if (ordem[a.status] !== ordem[b.status]) return ordem[a.status] - ordem[b.status];
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1; if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });

  // ── CONTADORES ─────────────────────────────────────────────
  const contadores = {
    todos: licoes.length,
    pendente: licoes.filter(t => t.status === "pendente").length,
    urgente: licoes.filter(t => t.status === "urgente").length,
    atrasada: licoes.filter(t => t.status === "atrasada").length,
    concluida: licoes.filter(t => t.status === "concluida").length,
  };

  return (
    <div className="app">
      {/* CABEÇALHO */}
      <Header
        ultimaSync={ultimaSync}
        onRefresh={buscarPlanilha}
        onAdd={() => setShowAddModal(true)}
        view={view}
        setView={setView}
      />

      <main className="main">
        {/* CARDS DE STATUS CLICÁVEIS */}
        <StatusCards
          contadores={contadores}
          filtroAtivo={filtroStatus}
          onFiltro={setFiltroStatus}
        />

        {/* ERRO DE CARREGAMENTO */}
        {erro && !loading && (
          <div className="erro-box">
            ⚠️ {erro}
            <div className="erro-dica">👉 Planilha → Compartilhar → "Qualquer pessoa com o link pode visualizar"</div>
            <button onClick={buscarPlanilha} className="btn-retry">🔄 Tentar novamente</button>
          </div>
        )}

        {/* VISTA LISTA */}
        {view === "lista" && (
          <>
            <FilterBar
              filtroMateria={filtroMateria}
              setFiltroMateria={setFiltroMateria}
              busca={busca}
              setBusca={setBusca}
            />
            <TaskList
              tasks={tasksFiltradas}
              loading={loading}
              filtroStatus={filtroStatus}
              onToggle={toggle}
              onDel={del}
              onSelect={setTaskSelecionada}
              tasksLocal={tasksLocal}
            />
          </>
        )}

        {/* VISTA CALENDÁRIO */}
        {view === "calendario" && (
          <Calendario tasks={licoes} onSelect={setTaskSelecionada} />
        )}

        {/* LEMBRETES FIXOS */}
        <Lembretes lembretes={lembretes} />
      </main>

      {/* MODAL DETALHE */}
      {taskSelecionada && (
        <TaskModal
          task={taskSelecionada}
          onClose={() => setTaskSelecionada(null)}
          onToggle={toggle}
          onDel={del}
          tasksLocal={tasksLocal}
        />
      )}

      {/* MODAL ADICIONAR */}
      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onAdd={addTask}
        />
      )}

      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
