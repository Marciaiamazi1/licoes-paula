import React from "react";
import "./Lembretes.css";

// Lembretes fixos sempre exibidos
const LEMBRETES_FIXOS = [
  {
    id: "mat-reforca",
    icone: "📐",
    titulo: "Reforço de Matemática",
    detalhe: "Toda terça-feira",
    cor: "#4cc9f0",
    diaSemana: 2, // Terça
  },
  {
    id: "ginastica",
    icone: "🤸",
    titulo: "Ginástica Artística",
    detalhe: "Toda sexta-feira",
    cor: "#f72585",
    diaSemana: 5, // Sexta
  },
];

function diasParaProximo(diaSemana) {
  const hoje = new Date().getDay();
  let diff = diaSemana - hoje;
  if (diff < 0) diff += 7;
  if (diff === 0) return "Hoje!";
  if (diff === 1) return "Amanhã";
  return `Em ${diff} dias`;
}

export default function Lembretes({ lembretes }) {
  // Combina fixos com lembretes da planilha
  return (
    <div className="lembretes-section">
      <div className="secao-titulo">📌 Compromissos Fixos da Semana</div>
      <div className="lembretes-grid">
        {LEMBRETES_FIXOS.map(l => {
          const quando = diasParaProximo(l.diaSemana);
          const isHoje = quando === "Hoje!";
          const isAmanha = quando === "Amanhã";
          return (
            <div
              key={l.id}
              className={`lembrete-card ${isHoje ? "lembrete-hoje" : ""}`}
              style={{ "--lcor": l.cor }}
            >
              <span className="lembrete-icone">{l.icone}</span>
              <div className="lembrete-info">
                <div className="lembrete-titulo">{l.titulo}</div>
                <div className="lembrete-detalhe">{l.detalhe}</div>
              </div>
              <span className={`lembrete-quando ${isHoje ? "quando-hoje" : isAmanha ? "quando-amanha" : ""}`}>
                {quando}
              </span>
            </div>
          );
        })}

        {/* Lembretes extras da planilha */}
        {lembretes.map(l => (
          <div key={l.id} className="lembrete-card" style={{ "--lcor": "#a29bfe" }}>
            <span className="lembrete-icone">{l.emoji || "📌"}</span>
            <div className="lembrete-info">
              <div className="lembrete-titulo">{l.materia || "Lembrete"}</div>
              <div className="lembrete-detalhe">{l.desc}</div>
            </div>
            {l.date && (
              <span className="lembrete-quando">{l.date.split("-").reverse().slice(0,2).join("/")}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
