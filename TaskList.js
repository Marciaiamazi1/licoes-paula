import React from "react";
import { COR_MAP, fmtDate, PLATAFORMA_ICON } from "../App";
import "./TaskList.css";

function TaskCard({ task, onToggle, onDel, onSelect, isLocal }) {
  const cor = COR_MAP[task.materia] || "#b2bec3";

  // Etiqueta de data
  const dataLabel = fmtDate(task.date);
  const isUrgente = task.status === "urgente";
  const isAtrasada = task.status === "atrasada";
  const isProva = task.tipo === "prova";

  // Plataforma — nunca mostra "undefined"
  const plat = task.platform && task.platform !== "undefined" ? task.platform : null;
  const platIcon = plat ? (PLATAFORMA_ICON[plat] || "📍") : null;

  return (
    <div
      className={`task-card ${task.done ? "task-done" : ""} ${isAtrasada ? "task-atrasada" : ""} ${isUrgente && !isAtrasada ? "task-urgente" : ""}`}
      style={{ "--cor": cor }}
    >
      {/* BARRA LATERAL COLORIDA */}
      <div className="task-barra" />

      {/* CHECKBOX */}
      <button
        className={`task-check ${task.done ? "task-check-on" : ""}`}
        onClick={e => { e.stopPropagation(); onToggle(task.id); }}
        title={task.done ? "Marcar pendente" : "Marcar concluída"}
      >
        {task.done ? "✓" : ""}
      </button>

      {/* CONTEÚDO */}
      <div className="task-body" onClick={() => onSelect(task)}>
        <div className="task-top">
          <span className="task-emoji">{task.emoji || "📝"}</span>
          <span className="task-materia" style={{ color: cor }}>{task.materia}</span>
          {isProva && <span className="badge badge-prova">PROVA</span>}
          {isAtrasada && <span className="badge badge-atrasada">ATRASADA</span>}
          {isUrgente && !isAtrasada && <span className="badge badge-urgente">HOJE/AMANHÃ</span>}
          {isLocal && <span className="badge" style={{background:"rgba(100,100,200,0.1)",color:"#6464c8"}}>Local</span>}
        </div>

        <div className="task-desc">{task.desc || "—"}</div>

        <div className="task-bottom">
          {platIcon && plat && (
            <span className="task-plat">{platIcon} {plat}</span>
          )}
          {dataLabel && (
            <span className={`task-data ${isAtrasada ? "data-atrasada" : isUrgente ? "data-urgente" : ""}`}>
              📅 {dataLabel}
            </span>
          )}
        </div>
      </div>

      {/* DELETE (só tarefas locais) */}
      {isLocal && (
        <button
          className="task-del"
          onClick={e => { e.stopPropagation(); onDel(task.id); }}
          title="Remover"
        >✕</button>
      )}
    </div>
  );
}

export default function TaskList({ tasks, loading, filtroStatus, onToggle, onDel, onSelect, tasksLocal }) {
  const localIds = tasksLocal.map(t => t.id);

  if (loading) return (
    <div className="loading-wrap">
      <div className="loading-spinner" />
      <span>Carregando lições...</span>
    </div>
  );

  if (tasks.length === 0) return (
    <div className="empty-wrap">
      <span className="empty-icon">🎉</span>
      <span className="empty-msg">
        {filtroStatus === "concluida" ? "Nenhuma lição concluída ainda." :
         filtroStatus !== "todos" ? "Nenhuma lição neste filtro!" :
         "Nenhuma lição cadastrada."}
      </span>
    </div>
  );

  // Separar provas no topo
  const provas = tasks.filter(t => t.tipo === "prova" && !t.done);
  const demais = tasks.filter(t => !(t.tipo === "prova" && !t.done));

  return (
    <div className="task-list">
      {/* PROVAS EM DESTAQUE */}
      {provas.length > 0 && (
        <>
          <div className="secao-titulo">🎯 Avaliações Agendadas ({provas.length})</div>
          {provas.map(t => (
            <TaskCard key={t.id} task={t} onToggle={onToggle} onDel={onDel}
              onSelect={onSelect} isLocal={localIds.includes(t.id)} />
          ))}
          {demais.length > 0 && <div className="secao-titulo" style={{marginTop:14}}>📝 Lições</div>}
        </>
      )}

      {/* DEMAIS */}
      {demais.map(t => (
        <TaskCard key={t.id} task={t} onToggle={onToggle} onDel={onDel}
          onSelect={onSelect} isLocal={localIds.includes(t.id)} />
      ))}
    </div>
  );
}
