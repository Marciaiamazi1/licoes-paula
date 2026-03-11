import React from "react";
import { MATERIAS } from "../App";
import "./FilterBar.css";

export default function FilterBar({ filtroMateria, setFiltroMateria, busca, setBusca }) {
  return (
    <div className="filter-bar">
      {/* BUSCA */}
      <div className="busca-wrap">
        <span className="busca-icone">🔍</span>
        <input
          type="text"
          placeholder="Buscar lição, matéria..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="busca-input"
        />
        {busca && (
          <button onClick={() => setBusca("")} className="busca-limpar">✕</button>
        )}
      </div>

      {/* MATÉRIAS */}
      <div className="materias-scroll">
        {MATERIAS.map(m => (
          <button
            key={m}
            className={`materia-chip ${filtroMateria === m ? "materia-ativa" : ""}`}
            onClick={() => setFiltroMateria(m)}
          >
            {m === "Todas" ? "📚" : ""} {m}
          </button>
        ))}
      </div>
    </div>
  );
}
