import React, { useState } from "react";
import { MATERIAS, PLATAFORMA_ICON } from "../App";
import "./AddTaskModal.css";

const PLATAFORMAS = ["", "Eureka", "Google Classroom", "Caderno", "Livro didático", "Folha avulsa", "Vindimo", "Escola", "Caderno Suplementar", "Presencial"];
const TIPOS = [
  { val: "licao", label: "📝 Lição" },
  { val: "prova", label: "🎯 Prova/Avaliação" },
  { val: "lembrete", label: "📌 Lembrete" },
];

export default function AddTaskModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    materia: "Matemática",
    desc: "",
    date: "",
    platform: "",
    obs: "",
    tipo: "licao",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const ok = form.desc.trim().length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-titulo">➕ Nova Lição</div>

        {/* TIPO */}
        <div className="add-tipo-grid">
          {TIPOS.map(t => (
            <button key={t.val}
              className={`add-tipo-btn ${form.tipo === t.val ? "add-tipo-ativo" : ""}`}
              onClick={() => set("tipo", t.val)}
            >{t.label}</button>
          ))}
        </div>

        {/* MATÉRIA */}
        <div className="add-campo">
          <div className="input-label">Matéria</div>
          <select className="input-field" value={form.materia} onChange={e => set("materia", e.target.value)}>
            {MATERIAS.filter(m => m !== "Todas").map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* DESCRIÇÃO */}
        <div className="add-campo">
          <div className="input-label">Descrição *</div>
          <textarea
            className="input-field"
            rows={3}
            placeholder="O que precisa ser feito?"
            value={form.desc}
            onChange={e => set("desc", e.target.value)}
          />
        </div>

        {/* DATA */}
        <div className="add-campo">
          <div className="input-label">Data de entrega</div>
          <input
            type="date"
            className="input-field"
            value={form.date}
            onChange={e => set("date", e.target.value)}
          />
        </div>

        {/* PLATAFORMA */}
        <div className="add-campo">
          <div className="input-label">Plataforma / Local</div>
          <select className="input-field" value={form.platform} onChange={e => set("platform", e.target.value)}>
            {PLATAFORMAS.map(p => (
              <option key={p} value={p}>{p ? `${PLATAFORMA_ICON[p] || "📍"} ${p}` : "Não especificado"}</option>
            ))}
          </select>
        </div>

        {/* OBS */}
        <div className="add-campo">
          <div className="input-label">Observação (opcional)</div>
          <input
            type="text"
            className="input-field"
            placeholder="Página, capítulo, conteúdo..."
            value={form.obs}
            onChange={e => set("obs", e.target.value)}
          />
        </div>

        <button
          className="btn-primary"
          onClick={() => ok && onAdd(form)}
          disabled={!ok}
          style={!ok ? { opacity: 0.5 } : {}}
        >Salvar Lição</button>
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
