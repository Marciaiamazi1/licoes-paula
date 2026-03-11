import React from "react";
import { COR_MAP, fmtDate, PLATAFORMA_ICON, getStatus } from "../App";
import "./TaskModal.css";

const STATUS_LABEL = {
  pendente: { label: "Pendente", icon: "⏳", cor: "#f59e0b" },
  urgente:  { label: "Hoje/Amanhã", icon: "🚨", cor: "#ff4757" },
  atrasada: { label: "Atrasada", icon: "⚠️", cor: "#ff6b35" },
  concluida:{ label: "Concluída", icon: "✅", cor: "#06d6a0" },
};

export default function TaskModal({ task, onClose, onToggle, onDel, tasksLocal }) {
  const cor = COR_MAP[task.materia] || "#b2bec3";
  const dataLabel = fmtDate(task.date);
  const plat = task.platform && task.platform !== "undefined" ? task.platform : null;
  const platIcon = plat ? (PLATAFORMA_ICON[plat] || "📍") : null;
  const st = STATUS_LABEL[task.status] || STATUS_LABEL.pendente;
  const isLocal = tasksLocal.some(t => t.id === task.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        {/* CABEÇALHO */}
        <div className="tm-header" style={{ background: `linear-gradient(135deg, ${cor}22, ${cor}11)`, borderLeft: `4px solid ${cor}` }}>
          <span className="tm-emoji">{task.emoji || "📝"}</span>
          <div>
            <div className="tm-materia" style={{ color: cor }}>{task.materia}</div>
            {task.tipo === "prova" && <span className="badge badge-prova">AVALIAÇÃO</span>}
            {task.tipo === "lembrete" && <span className="badge badge-lembrete">LEMBRETE</span>}
          </div>
          <span className="tm-status" style={{ background: `${st.cor}22`, color: st.cor }}>
            {st.icon} {st.label}
          </span>
        </div>

        {/* DESCRIÇÃO */}
        <div className="tm-desc">{task.desc || "—"}</div>

        {/* DETALHES */}
        <div className="tm-grid">
          {dataLabel && (
            <div className="tm-item">
              <span className="tm-item-label">📅 Data</span>
              <span className="tm-item-val">{task.date ? task.date.split("-").reverse().join("/") : "—"}</span>
            </div>
          )}
          {plat && (
            <div className="tm-item">
              <span className="tm-item-label">{platIcon} Plataforma</span>
              <span className="tm-item-val">{plat}</span>
            </div>
          )}
          {task.obs && (
            <div className="tm-item tm-item-full">
              <span className="tm-item-label">📌 Observação</span>
              <span className="tm-item-val">{task.obs}</span>
            </div>
          )}
        </div>

        {/* AÇÕES */}
        <button
          className="btn-primary"
          style={task.done ? { background: "linear-gradient(135deg, #06d6a0, #00a88c)" } : {}}
          onClick={() => { onToggle(task.id); onClose(); }}
        >
          {task.done ? "↩️ Marcar como pendente" : "✅ Marcar como concluída"}
        </button>

        {isLocal && (
          <button
            className="btn-secondary"
            style={{ color: "#ff4757" }}
            onClick={() => { onDel(task.id); onClose(); }}
          >🗑️ Remover lição</button>
        )}

        <button className="btn-secondary" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
