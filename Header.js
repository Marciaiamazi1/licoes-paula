import React from "react";
import "./Header.css";

export default function Header({ ultimaSync, onRefresh, onAdd, view, setView }) {
  return (
    <header className="header">
      {/* ESCOLA */}
      <div className="header-escola">
        <span className="escola-icone">🏫</span>
        <div>
          <div className="escola-nome">Colégio Portinari</div>
          <div className="escola-sub">Painel de Lições e Compromissos</div>
        </div>
        <div className="header-acoes">
          <button onClick={onRefresh} className="btn-icon" title="Atualizar">🔄</button>
          <button onClick={onAdd} className="btn-add" title="Adicionar lição">＋</button>
        </div>
      </div>

      {/* ALUNA */}
      <div className="header-aluna">
        <div className="aluna-info">
          <span className="aluna-avatar">👧</span>
          <div>
            <div className="aluna-nome">Paula</div>
            {ultimaSync && <div className="aluna-sync">Atualizado às {ultimaSync}</div>}
          </div>
        </div>
        {/* TABS */}
        <div className="header-tabs">
          <button
            className={`tab ${view === "lista" ? "tab-ativa" : ""}`}
            onClick={() => setView("lista")}
          >📋 Lista</button>
          <button
            className={`tab ${view === "calendario" ? "tab-ativa" : ""}`}
            onClick={() => setView("calendario")}
          >📅 Calendário</button>
        </div>
      </div>
    </header>
  );
}
