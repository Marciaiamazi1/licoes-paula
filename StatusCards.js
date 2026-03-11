import React from "react";
import "./StatusCards.css";

const CARDS = [
  { key: "todos",    label: "Total",     icon: "📚", cor: "#2d2d9f" },
  { key: "pendente", label: "Pendentes", icon: "⏳", cor: "#f59e0b" },
  { key: "urgente",  label: "Urgentes",  icon: "🚨", cor: "#ff4757" },
  { key: "atrasada", label: "Atrasadas", icon: "⚠️", cor: "#ff6b35" },
  { key: "concluida",label: "Concluídas",icon: "✅", cor: "#06d6a0" },
];

export default function StatusCards({ contadores, filtroAtivo, onFiltro }) {
  return (
    <div className="status-wrap">
      <div className="status-grid">
        {CARDS.map(card => (
          <button
            key={card.key}
            className={`status-card ${filtroAtivo === card.key ? "status-ativo" : ""}`}
            onClick={() => onFiltro(filtroAtivo === card.key ? "todos" : card.key)}
            style={{ "--cor": card.cor }}
          >
            <span className="status-icon">{card.icon}</span>
            <span className="status-num">{contadores[card.key] ?? 0}</span>
            <span className="status-label">{card.label}</span>
            {filtroAtivo === card.key && <span className="status-check">●</span>}
          </button>
        ))}
      </div>
      {filtroAtivo !== "todos" && (
        <div className="filtro-ativo-aviso">
          Filtrando: <strong>{CARDS.find(c => c.key === filtroAtivo)?.label}</strong>
          <button onClick={() => onFiltro("todos")} className="filtro-limpar">✕ Limpar</button>
        </div>
      )}
    </div>
  );
}
