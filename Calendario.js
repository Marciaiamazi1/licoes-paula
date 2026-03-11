import React, { useState } from "react";
import { COR_MAP } from "../App";
import "./Calendario.css";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export default function Calendario({ tasks, onSelect }) {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  // Dias do mês
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  // Tarefas por dia
  const tarefasDia = {};
  tasks.forEach(t => {
    if (!t.date) return;
    const [ty, tm, td] = t.date.split("-").map(Number);
    if (ty === ano && tm - 1 === mes) {
      if (!tarefasDia[td]) tarefasDia[td] = [];
      tarefasDia[td].push(t);
    }
  });

  const navMes = (dir) => {
    let nm = mes + dir, na = ano;
    if (nm < 0) { nm = 11; na--; }
    if (nm > 11) { nm = 0; na++; }
    setMes(nm); setAno(na); setDiaSelecionado(null);
  };

  const tasksDiaSel = diaSelecionado ? (tarefasDia[diaSelecionado] || []) : [];

  return (
    <div className="calendario">
      {/* NAVEGAÇÃO */}
      <div className="cal-nav">
        <button onClick={() => navMes(-1)} className="cal-btn">‹</button>
        <span className="cal-mes">{MESES[mes]} {ano}</span>
        <button onClick={() => navMes(1)} className="cal-btn">›</button>
      </div>

      {/* DIAS DA SEMANA */}
      <div className="cal-grid">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="cal-head">{d}</div>
        ))}

        {/* ESPAÇOS EM BRANCO */}
        {Array.from({ length: primeiroDia }).map((_, i) => (
          <div key={`e${i}`} className="cal-vazio" />
        ))}

        {/* DIAS */}
        {Array.from({ length: totalDias }, (_, i) => i + 1).map(dia => {
          const isHoje = dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
          const temTarefas = tarefasDia[dia];
          const isSel = diaSelecionado === dia;

          return (
            <button
              key={dia}
              className={`cal-dia ${isHoje ? "cal-hoje" : ""} ${isSel ? "cal-selecionado" : ""} ${temTarefas ? "cal-tem-tarefa" : ""}`}
              onClick={() => setDiaSelecionado(isSel ? null : dia)}
            >
              <span>{dia}</span>
              {temTarefas && (
                <div className="cal-pontos">
                  {temTarefas.slice(0, 3).map((t, i) => (
                    <span key={i} className="cal-ponto"
                      style={{ background: COR_MAP[t.materia] || "#b2bec3" }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* TAREFAS DO DIA */}
      {diaSelecionado && (
        <div className="cal-detalhe">
          <div className="cal-detalhe-titulo">
            📅 {diaSelecionado} de {MESES[mes]}
          </div>
          {tasksDiaSel.length === 0 ? (
            <div className="cal-vazio-msg">Nenhum compromisso neste dia</div>
          ) : (
            tasksDiaSel.map(t => (
              <button key={t.id} className="cal-item" onClick={() => onSelect(t)}>
                <span className="cal-item-emoji">{t.emoji}</span>
                <div>
                  <div className="cal-item-mat" style={{ color: COR_MAP[t.materia] || "#888" }}>
                    {t.materia}
                    {t.tipo === "prova" && <span className="badge badge-prova" style={{marginLeft:6}}>PROVA</span>}
                  </div>
                  <div className="cal-item-desc">{t.desc}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
