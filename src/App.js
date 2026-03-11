import React, { useState, useEffect, useCallback } from "react";

const SHEET_ID = "1efGIrzxE_5vHvbEW6KLLlj06-c8JfpDU9I_fieGqZmE";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=tarefas`;

const uid = () => Math.random().toString(36).slice(2, 9);

const getPrio = (date, done) => {
  if (done) return "done";
  if (!date) return "normal";
  const diff = Math.ceil((new Date(date + "T00:00:00") - new Date().setHours(0,0,0,0)) / 86400000);
  if (diff <= 1) return "urgente";
  if (diff <= 4) return "semana";
  return "normal";
};

const fmtDate = (date) => {
  if (!date) return null;
  const [,m,d] = date.split("-");
  const diff = Math.ceil((new Date(date + "T00:00:00") - new Date().setHours(0,0,0,0)) / 86400000);
  if (diff < 0) return `⚠️ Atrasou ${Math.abs(diff)}d`;
  if (diff === 0) return "🔴 Hoje!";
  if (diff === 1) return "🟠 Amanhã";
  if (diff <= 4) return `🟡 ${diff} dias`;
  return `🟢 ${d}/${m}`;
};

const COR_MAP = {
  "Matemática":"#4cc9f0","Português":"#f72585","Ciências":"#06d6a0",
  "História":"#ffd60a","Geografia":"#7bed9f","Inglês":"#a29bfe",
  "Artes":"#fd79a8","Ed. Física":"#fdcb6e","Filosofia":"#e17055","Outra":"#b2bec3"
};
const EMOJI_MAP = {
  "Matemática":"📐","Português":"📖","Ciências":"🔬","História":"🏛️",
  "Geografia":"🌍","Inglês":"🇺🇸","Artes":"🎨","Ed. Física":"⚽","Filosofia":"🧠","Outra":"📝"
};
const MATERIAS = ["Todas","Matemática","Português","Ciências","História","Geografia","Inglês","Artes","Ed. Física","Filosofia"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export default function App() {
  const [tasksSheet, setTasksSheet] = useState([]);
  const [tasksLocal, setTasksLocal] = useState(() => {
    try { return JSON.parse(localStorage.getItem("licoes_local") || "[]"); } catch { return []; }
  });
  const [doneIds, setDoneIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("licoes_done") || "[]"); } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [ultimaSync, setUltimaSync] = useState("");
  const [view, setView] = useState("lista");
  const [tab, setTab] = useState("pendentes");
  const [filtro, setFiltro] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({materia:"Matemática",desc:"",date:"",platform:"",obs:"",tipo:"licao"});
  const [toast, setToast] = useState("");
  const [notifPerm, setNotifPerm] = useState(typeof Notification !== "undefined" ? Notification.permission : "denied");
  const hoje = new Date();
  const [calMes, setCalMes] = useState(hoje.getMonth());
  const [calAno, setCalAno] = useState(hoje.getFullYear());
  const [diaSel, setDiaSel] = useState(null);

  const buscarPlanilha = useCallback(async () => {
    setLoading(true); setErro("");
    try {
      const res = await fetch(SHEET_URL);
      const text = await res.text();
      const json = JSON.parse(text.replace(/^[^(]+\(|\);?\s*$/g, ""));
      const rows = json.table?.rows || [];
      const tarefas = rows.slice(1).filter(r => r.c[3]?.v).map(row => ({
        id: row.c[0]?.v || uid(),
        materia: row.c[1]?.v || "Outra",
        emoji: row.c[2]?.v || "📝",
        desc: row.c[3]?.v || "",
        date: row.c[4]?.v || "",
        platform: row.c[5]?.v || "",
        obs: row.c[6]?.v || "",
        tipo: row.c[7]?.v || "licao",
        done: false,
      }));
      setTasksSheet(tarefas);
      setUltimaSync(new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}));
    } catch(e) {
      setErro("⚠️ Não foi possível carregar. A planilha precisa ser pública.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    buscarPlanilha();
    const t = setInterval(buscarPlanilha, 5*60*1000);
    return () => clearInterval(t);
  }, [buscarPlanilha]);

  useEffect(() => { try { localStorage.setItem("licoes_local", JSON.stringify(tasksLocal)); } catch{} }, [tasksLocal]);
  useEffect(() => { try { localStorage.setItem("licoes_done", JSON.stringify(doneIds)); } catch{} }, [doneIds]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),2500); };

  const pedirPermissao = async () => {
    if (typeof Notification === "undefined") { showToast("⚠️ Navegador não suporta notificações"); return; }
    const p = await Notification.requestPermission();
    setNotifPerm(p);
    if (p === "granted") showToast("🔔 Notificações ativadas!");
  };

  const toggle = (id) => {
    const wasDone = doneIds.includes(id);
    setDoneIds(prev => wasDone ? prev.filter(x=>x!==id) : [...prev, id]);
    showToast(wasDone ? "↩️ Marcada como pendente" : "✅ Lição concluída! 🎉");
  };

  const del = (id) => { setTasksLocal(prev=>prev.filter(x=>x.id!==id)); setDoneIds(prev=>prev.filter(x=>x!==id)); showToast("🗑️ Removida"); };

  const addTask = () => {
    if (!form.desc.trim()) { showToast("⚠️ Escreva a descrição"); return; }
    setTasksLocal(prev => [{id:uid(),...form,emoji:EMOJI_MAP[form.materia]||"📝",done:false},...prev]);
    setModal(false);
    setForm({materia:"Matemática",desc:"",date:"",platform:"",obs:"",tipo:"licao"});
    showToast("📚 Adicionada!");
  };

  const tasks = [...tasksSheet, ...tasksLocal].map(t => ({...t, done: doneIds.includes(t.id)}));

  const visible = tasks.filter(t => {
    if (tab==="pendentes" && t.done) return false;
    if (tab==="concluidas" && !t.done) return false;
    if (filtro!=="Todas" && t.materia!==filtro) return false;
    if (busca && !t.desc.toLowerCase().includes(busca.toLowerCase()) && !t.materia.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  }).sort((a,b) => {
    if (a.tipo==="prova" && b.tipo!=="prova") return -1;
    if (b.tipo==="prova" && a.tipo!=="prova") return 1;
    if (a.done!==b.done) return a.done?1:-1;
    if (!a.date&&!b.date) return 0; if(!a.date) return 1; if(!b.date) return -1;
    return a.date.localeCompare(b.date);
  });

  const pendentes  = tasks.filter(t=>!t.done).length;
  const urgentes   = tasks.filter(t=>!t.done && getPrio(t.date,false)==="urgente").length;
  const provas     = tasks.filter(t=>!t.done && t.tipo==="prova").length;
  const concluidas = tasks.filter(t=>t.done).length;

  const diasNoMes = new Date(calAno,calMes+1,0).getDate();
  const primeiroDia = new Date(calAno,calMes,1).getDay();
  const grade = [];
  for(let i=0;i<primeiroDia;i++) grade.push(null);
  for(let d=1;d<=diasNoMes;d++) grade.push(d);

  const tasksPorDia = (dia) => {
    const ds = `${calAno}-${String(calMes+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
    return tasks.filter(t=>t.date===ds && !t.done);
  };

  const prioStyle = {
    urgente:{border:"1.5px solid #ff4757",background:"rgba(255,71,87,0.08)"},
    semana:{border:"1.5px solid #ffa502",background:"rgba(255,165,2,0.07)"},
    normal:{border:"1.5px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.03)"},
    done:{border:"1.5px solid rgba(255,255,255,0.04)",background:"rgba(255,255,255,0.02)"},
  };

  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#0d0d1a",minHeight:"100vh",color:"#f0f0ff",maxWidth:430,margin:"0 auto"}}>
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"radial-gradient(ellipse at 15% 15%,rgba(114,9,183,0.18) 0%,transparent 55%),radial-gradient(ellipse at 85% 85%,rgba(247,37,133,0.12) 0%,transparent 55%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(13,13,26,0.95)",backdropFilter:"blur(16px)",padding:"16px 20px 12px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{fontSize:22,fontWeight:900,background:"linear-gradient(135deg,#4cc9f0,#f72585)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>📚 Lições da Paula</div>
            <div style={{fontSize:11,color:"#606080",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>
              {new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"short"})}
              {ultimaSync && <span style={{marginLeft:8,color:"#06d6a0"}}>· sync {ultimaSync}</span>}
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={buscarPlanilha} title="Atualizar" style={{width:40,height:40,borderRadius:12,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"#a0a0c0",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🔄</button>
            <button onClick={pedirPermissao} style={{width:40,height:40,borderRadius:12,background:notifPerm==="granted"?"rgba(6,214,160,0.2)":"rgba(255,255,255,0.07)",border:notifPerm==="granted"?"1px solid #06d6a0":"1px solid rgba(255,255,255,0.1)",color:notifPerm==="granted"?"#06d6a0":"#a0a0c0",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {notifPerm==="granted"?"🔔":"🔕"}
            </button>
            <button onClick={()=>setModal(true)} style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#7209b7,#f72585)",border:"none",color:"#fff",fontSize:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 18px rgba(247,37,133,0.4)"}}>＋</button>
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          {[["Pendentes",pendentes,"#ffd60a"],["Urgentes",urgentes,"#ff4757"],["Provas",provas,"#f72585"],["Concluídas",concluidas,"#06d6a0"]].map(([l,n,c])=>(
            <div key={l} style={{flex:1,background:"rgba(255,255,255,0.05)",borderRadius:12,padding:"10px 4px",textAlign:"center",border:"1px solid rgba(255,255,255,0.06)"}}>
              <div style={{fontSize:20,fontWeight:900,color:c,lineHeight:1}}>{n}</div>
              <div style={{fontSize:9,color:"#606080",fontWeight:700,textTransform:"uppercase",marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          {[["lista","📋 Lista"],["calendario","📅 Calendário"]].map(([v,label])=>(
            <button key={v} onClick={()=>setView(v)} style={{flex:1,padding:"8px 4px",borderRadius:20,border:view===v?"none":"1px solid rgba(255,255,255,0.1)",background:view===v?"linear-gradient(135deg,#4361ee,#4cc9f0)":"transparent",color:view===v?"#fff":"#a0a0c0",fontSize:13,fontWeight:800,cursor:"pointer"}}>{label}</button>
          ))}
        </div>
        {view==="lista" && (
          <>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {[["pendentes","Pendentes"],["concluidas","Concluídas"],["todas","Todas"]].map(([t,l])=>(
                <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"7px 4px",borderRadius:20,border:tab===t?"none":"1px solid rgba(255,255,255,0.1)",background:tab===t?"linear-gradient(135deg,#7209b7,#f72585)":"transparent",color:tab===t?"#fff":"#a0a0c0",fontSize:12,fontWeight:800,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
            <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="🔍  Buscar..." style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:30,padding:"9px 16px",color:"#f0f0ff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:6,overflowX:"auto",marginTop:10,paddingBottom:2,scrollbarWidth:"none"}}>
              {MATERIAS.map(m=>(
                <button key={m} onClick={()=>setFiltro(m)} style={{flexShrink:0,padding:"5px 12px",borderRadius:20,border:filtro===m?`1px solid ${COR_MAP[m]||"#4cc9f0"}`:"1px solid rgba(255,255,255,0.08)",background:filtro===m?`${COR_MAP[m]||"#4cc9f0"}22`:"transparent",color:filtro===m?(COR_MAP[m]||"#4cc9f0"):"#a0a0c0",fontSize:11,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>
                  {m==="Todas"?"Todas":`${EMOJI_MAP[m]||"📝"} ${m}`}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div style={{padding:"12px 14px 80px",position:"relative",zIndex:1}}>
        {loading && <div style={{textAlign:"center",padding:"40px 20px",color:"#606080"}}><div style={{fontSize:36,marginBottom:12}}>⏳</div><div style={{fontSize:14,fontWeight:700}}>Carregando...</div></div>}
        {erro && !loading && (
          <div style={{background:"rgba(255,71,87,0.12)",border:"1px solid rgba(255,71,87,0.35)",borderRadius:14,padding:"14px 16px",marginBottom:12,fontSize:13,color:"#ff6b7a",fontWeight:700}}>
            {erro}
            <div style={{fontSize:12,color:"#a0a0c0",marginTop:8}}>👉 Planilha → Compartilhar → "Qualquer pessoa com o link pode visualizar"</div>
            <button onClick={buscarPlanilha} style={{display:"block",marginTop:10,padding:"6px 14px",borderRadius:20,background:"rgba(255,71,87,0.2)",border:"none",color:"#ff6b7a",fontSize:12,cursor:"pointer"}}>🔄 Tentar novamente</button>
          </div>
        )}
        {!loading && view==="lista" && (
          <>
            {urgentes>0 && tab!=="concluidas" && <div style={{background:"rgba(255,71,87,0.12)",border:"1px solid rgba(255,71,87,0.35)",borderRadius:14,padding:"11px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>🚨</span><span style={{fontSize:13,fontWeight:700,color:"#ff6b7a"}}>{urgentes} lição{urgentes>1?"ões":""} urgente hoje ou amanhã!</span></div>}
            {provas>0 && tab!=="concluidas" && <div style={{background:"rgba(247,37,133,0.1)",border:"1px solid rgba(247,37,133,0.3)",borderRadius:14,padding:"11px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>🎯</span><span style={{fontSize:13,fontWeight:700,color:"#f72585"}}>{provas} prova{provas>1?"s":""} agendada{provas>1?"s":""}!</span></div>}
            {visible.length===0
              ? <div style={{textAlign:"center",padding:"60px 20px",color:"#606080"}}><div style={{fontSize:52,marginBottom:16}}>{tab==="concluidas"?"🎉":"📭"}</div><div style={{fontSize:17,fontWeight:800,color:"#a0a0c0"}}>{tab==="concluidas"?"Nenhuma concluída":"Tudo em dia!"}</div></div>
              : visible.map(task=>{
                const prio=getPrio(task.date,task.done); const prazo=fmtDate(task.date);
                const isProva=task.tipo==="prova"; const isLembrete=task.tipo==="lembrete";
                return (
                  <div key={task.id} style={{...prioStyle[prio],borderRadius:16,padding:"14px 14px 12px",marginBottom:10,opacity:task.done?0.6:1,...(isProva?{border:"1.5px solid rgba(247,37,133,0.5)",background:"rgba(247,37,133,0.07)"}:{}),...(isLembrete?{border:"1.5px solid rgba(76,201,240,0.4)",background:"rgba(76,201,240,0.06)"}:{})}}>
                    <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                      <button onClick={()=>toggle(task.id)} style={{width:28,height:28,borderRadius:8,border:task.done?"none":"2px solid rgba(255,255,255,0.2)",background:task.done?"#06d6a0":"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:"#fff",marginTop:2}}>{task.done?"✓":""}</button>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,fontWeight:900,color:isProva?"#f72585":"#f0f0ff",marginBottom:3,textDecoration:task.done?"line-through":"none"}}>
                          {task.emoji} {task.materia}
                          {isProva && <span style={{marginLeft:6,fontSize:10,background:"rgba(247,37,133,0.2)",color:"#f72585",padding:"2px 7px",borderRadius:20,fontWeight:800}}>PROVA</span>}
                          {isLembrete && <span style={{marginLeft:6,fontSize:10,background:"rgba(76,201,240,0.2)",color:"#4cc9f0",padding:"2px 7px",borderRadius:20,fontWeight:800}}>LEMBRETE</span>}
                        </div>
                        <div style={{fontSize:13,color:"#a0a0c0",lineHeight:1.4,marginBottom:8,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{task.desc}</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                          {prazo && <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,background:"rgba(255,255,255,0.07)",color:"#e0e0ff"}}>{prazo}</span>}
                          {task.platform && <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,background:"rgba(244,162,97,0.12)",color:"#f4a261"}}>{task.platform}</span>}
                        </div>
                        {task.obs && <div style={{fontSize:11,color:"#606080",marginTop:6,fontStyle:"italic"}}>💬 {task.obs}</div>}
                      </div>
                      {tasksLocal.find(x=>x.id===task.id) && <button onClick={()=>del(task.id)} style={{width:28,height:28,borderRadius:8,border:"none",background:"rgba(255,255,255,0.06)",color:"#606080",fontSize:13,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>🗑️</button>}
                    </div>
                  </div>
                );
              })
            }
          </>
        )}
        {!loading && view==="calendario" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <button onClick={()=>{if(calMes===0){setCalMes(11);setCalAno(y=>y-1);}else setCalMes(m=>m-1);}} style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.07)",border:"none",color:"#f0f0ff",fontSize:18,cursor:"pointer"}}>‹</button>
              <div style={{fontWeight:900,fontSize:17}}>{MESES[calMes]} {calAno}</div>
              <button onClick={()=>{if(calMes===11){setCalMes(0);setCalAno(y=>y+1);}else setCalMes(m=>m+1);}} style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.07)",border:"none",color:"#f0f0ff",fontSize:18,cursor:"pointer"}}>›</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>
              {DIAS_SEMANA.map(d=><div key={d} style={{textAlign:"center",fontSize:10,fontWeight:800,color:"#606080",textTransform:"uppercase"}}>{d}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:16}}>
              {grade.map((dia,i)=>{
                if(!dia) return <div key={`e${i}`}/>;
                const tf=tasksPorDia(dia);
                const ds=`${calAno}-${String(calMes+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
                const isHoje=ds===new Date().toISOString().split("T")[0];
                const isSel=diaSel===dia; const temProva=tf.some(t=>t.tipo==="prova");
                return (
                  <button key={dia} onClick={()=>setDiaSel(isSel?null:dia)} style={{aspectRatio:"1",borderRadius:12,border:isSel?"2px solid #4cc9f0":isHoje?"2px solid #f72585":temProva?"1.5px solid rgba(247,37,133,0.5)":"1px solid rgba(255,255,255,0.07)",background:isSel?"rgba(76,201,240,0.15)":isHoje?"rgba(247,37,133,0.1)":tf.length>0?"rgba(255,255,255,0.05)":"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"4px 2px"}}>
                    <span style={{fontSize:13,fontWeight:isHoje||isSel?900:600,color:isHoje?"#f72585":isSel?"#4cc9f0":"#f0f0ff"}}>{dia}</span>
                    {tf.length>0 && <div style={{display:"flex",gap:2,marginTop:2,justifyContent:"center"}}>{tf.slice(0,3).map(t=><div key={t.id} style={{width:5,height:5,borderRadius:"50%",background:t.tipo==="prova"?"#f72585":(COR_MAP[t.materia]||"#a0a0c0")}}/>)}</div>}
                  </button>
                );
              })}
            </div>
            {diaSel && (
              <div>
                <div style={{fontSize:14,fontWeight:900,marginBottom:10,color:"#4cc9f0"}}>📅 {diaSel}/{calMes+1}/{calAno}</div>
                {tasksPorDia(diaSel).length===0
                  ? <div style={{textAlign:"center",padding:"24px",color:"#606080",fontSize:13}}>Nenhuma lição neste dia 🎉</div>
                  : tasksPorDia(diaSel).map(task=>(
                    <div key={task.id} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${task.tipo==="prova"?"#f72585":(COR_MAP[task.materia]||"#4cc9f0")}44`,borderRadius:14,padding:"12px 14px",marginBottom:8}}>
                      <div style={{fontWeight:900,fontSize:13,color:task.tipo==="prova"?"#f72585":(COR_MAP[task.materia]||"#f0f0ff"),marginBottom:4}}>{task.emoji} {task.materia}{task.tipo==="prova"&&<span style={{marginLeft:6,fontSize:10,background:"rgba(247,37,133,0.2)",color:"#f72585",padding:"2px 7px",borderRadius:20}}>PROVA</span>}</div>
                      <div style={{fontSize:12,color:"#a0a0c0"}}>{task.desc}</div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}
      </div>
      {toast && <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:"rgba(30,30,50,0.97)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:30,padding:"11px 22px",fontSize:13,fontWeight:700,whiteSpace:"nowrap",zIndex:200}}>{toast}</div>}
      {modal && (
        <div onClick={e=>{if(e.target===e.currentTarget)setModal(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",zIndex:100,display:"flex",alignItems:"flex-end"}}>
          <div style={{width:"100%",background:"#1a1a2e",borderRadius:"24px 24px 0 0",padding:"8px 20px 32px",maxHeight:"90vh",overflowY:"auto",border:"1px solid rgba(255,255,255,0.1)"}}>
            <div style={{width:40,height:4,background:"rgba(255,255,255,0.15)",borderRadius:2,margin:"10px auto 20px"}}/>
            <div style={{fontSize:20,fontWeight:900,textAlign:"center",marginBottom:16}}>✏️ Nova Lição</div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {[["licao","📚 Lição"],["prova","🎯 Prova"],["lembrete","🔔 Lembrete"]].map(([v,l])=>(
                <button key={v} onClick={()=>setForm(f=>({...f,tipo:v}))} style={{flex:1,padding:"8px 4px",borderRadius:12,border:form.tipo===v?"none":"1px solid rgba(255,255,255,0.1)",background:form.tipo===v?"linear-gradient(135deg,#7209b7,#f72585)":"transparent",color:form.tipo===v?"#fff":"#a0a0c0",fontSize:12,fontWeight:800,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:"#606080",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Matéria</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {Object.entries(EMOJI_MAP).map(([m,e])=>(
                  <button key={m} onClick={()=>setForm(f=>({...f,materia:m}))} style={{padding:"10px 6px",borderRadius:10,border:form.materia===m?`1px solid ${COR_MAP[m]||"#f72585"}`:"1px solid rgba(255,255,255,0.08)",background:form.materia===m?`${COR_MAP[m]||"#f72585"}22`:"rgba(255,255,255,0.04)",color:form.materia===m?(COR_MAP[m]||"#f72585"):"#a0a0c0",fontSize:12,fontWeight:800,cursor:"pointer"}}>{e} {m}</button>
                ))}
              </div>
            </div>
            {[
              {label:"Descrição *",key:"desc",type:"textarea",placeholder:"Ex: Exercícios pág. 45..."},
              {label:"Data de entrega",key:"date",type:"date"},
              {label:"Plataforma / Local",key:"platform",type:"text",placeholder:"Ex: 📚 Livro, 💻 Classroom..."},
              {label:"Observações",key:"obs",type:"text",placeholder:"Ex: Professora pediu capricho"},
            ].map(({label,key,type,placeholder})=>(
              <div key={key} style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:800,color:"#606080",textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>{label}</div>
                {type==="textarea"
                  ? <textarea value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder} rows={3} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"12px 14px",color:"#f0f0ff",fontSize:14,fontFamily:"inherit",outline:"none",resize:"none",boxSizing:"border-box"}}/>
                  : <input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"12px 14px",color:"#f0f0ff",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",colorScheme:"dark"}}/>
                }
              </div>
            ))}
            <button onClick={addTask} style={{width:"100%",padding:15,background:"linear-gradient(135deg,#7209b7,#f72585)",border:"none",borderRadius:14,color:"#fff",fontSize:15,fontWeight:900,cursor:"pointer",marginBottom:10}}>💾 Salvar</button>
            <button onClick={()=>setModal(false)} style={{width:"100%",padding:13,background:"rgba(255,255,255,0.06)",border:"none",borderRadius:14,color:"#a0a0c0",fontSize:14,fontWeight:800,cursor:"pointer"}}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
