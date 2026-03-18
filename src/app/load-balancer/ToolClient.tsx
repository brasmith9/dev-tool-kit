"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Server {
  id: number;
  name: string;
  weight: number;
  connections: number;
  healthy: boolean;
  color: string;
  processedCount: number;
}

interface Request {
  id: string;
  serverId: number | null;
  status: "entering" | "routing" | "processing" | "done";
  color: string;
}

type Algorithm = "round-robin" | "least-connections" | "weighted-rr";

const SERVERS_INIT: Server[] = [
  { id: 1, name: "Node-Alpha", weight: 1, connections: 0, healthy: true, color: "text-accent-blue", processedCount: 0 },
  { id: 2, name: "Node-Beta", weight: 2, connections: 0, healthy: true, color: "text-accent-green", processedCount: 0 },
  { id: 3, name: "Node-Gamma", weight: 3, connections: 0, healthy: true, color: "text-accent-purple", processedCount: 0 },
];

export default function LoadBalancerPage() {
  const [servers, setServers] = useState<Server[]>(SERVERS_INIT);
  const [algo, setAlgo] = useState<Algorithm>("round-robin");
  const [requests, setRequests] = useState<Request[]>([]);
  const [autoRate, setAutoRate] = useState(0); // 0=off, 1=slow, 2=fast
  const rrIndex = useRef(0);
  const nextReqId = useRef(1);

  const [showDocs, setShowDocs] = useState(false);
  const [showAlgoDoc, setShowAlgoDoc] = useState(false);
  const [showHealthDoc, setShowHealthDoc] = useState(false);

  const toggleAllDocs = () => {
    const nextValue = !showDocs;
    setShowDocs(nextValue);
    setShowAlgoDoc(nextValue);
    setShowHealthDoc(nextValue);
  };

  const selectTarget = useCallback((activeServers: Server[]) => {
    if (algo === "round-robin") {
      const target = activeServers[rrIndex.current % activeServers.length];
      rrIndex.current++;
      return target;
    } 
    if (algo === "least-connections") {
      const sorted = [...activeServers].sort((a, b) => a.connections - b.connections);
      return sorted[0];
    } 
    const totalWeight = activeServers.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    let target = activeServers[0];
    for (const s of activeServers) {
      if (random < s.weight) {
        target = s;
        break;
      }
      random -= s.weight;
    }
    return target;
  }, [algo]);

  const removeRequest = useCallback((reqId: string, targetId: number) => {
    setServers(prev => prev.map(s => {
      if (s.id === targetId) {
        return { ...s, connections: Math.max(0, s.connections - 1), processedCount: s.processedCount + 1 };
      }
      return s;
    }));
    setRequests(prev => prev.filter(r => r.id !== reqId));
  }, []);

  const updateRequestStatus = useCallback((reqId: string, status: Request["status"]) => {
    setRequests(current => current.map(r => (r.id === reqId ? { ...r, status } : r)));
  }, []);

  const routeRequest = useCallback(() => {
    const activeServers = servers.filter(s => s.healthy);
    if (activeServers.length === 0) return;

    const target = selectTarget(activeServers);
    const reqId = `REQ-${nextReqId.current++}`;
    const newReq: Request = { id: reqId, serverId: target.id, status: "entering", color: target.color };
    
    setRequests(prev => [...prev, newReq]);
    
    setServers(prev => prev.map(s => {
      if (s.id === target.id) return { ...s, connections: s.connections + 1 };
      return s;
    }));

    setTimeout(() => updateRequestStatus(reqId, "routing"), 400);
    setTimeout(() => updateRequestStatus(reqId, "processing"), 800);
    setTimeout(() => removeRequest(reqId, target.id), 2000);
  }, [selectTarget, servers, removeRequest, updateRequestStatus]);

  useEffect(() => {
    if (autoRate === 0) return;
    const interval = setInterval(routeRequest, autoRate === 1 ? 2000 : 800);
    return () => clearInterval(interval);
  }, [autoRate, routeRequest]);

  const toggleHealth = (id: number) => {
    setServers(prev => prev.map(s => (s.id === id ? { ...s, healthy: !s.healthy } : s)));
  };

  const renderRequest = (r: Request) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const offset = (r.serverId || 2) - 2;
    // On mobile, servers are stacked vertically or horizontally in a smaller area.
    // For now, let's just make the animation work better relative to the container.
    const xPos = isMobile ? offset * 80 : offset * 260;
    const isProcessing = r.status === 'processing';
    
    const reqStyle = { 
       transform: isProcessing ? `translate(${xPos}px, ${isMobile ? '160px' : '260px'})` : 'none'
    } as React.CSSProperties;

    let animClass = "";
    if (r.status === 'entering') animClass = "top-[-60px] opacity-100 scale-125";
    else if (r.status === 'routing') animClass = "scale-110 opacity-100";
    else if (isProcessing) animClass = "top-[180px] opacity-0";

    return (
       <div 
        key={r.id} 
        className={`absolute size-8 sm:size-10 rounded-full shadow-lg flex items-center justify-center text-[10px] font-black text-white transition-all duration-1000 bg-primary border-2 border-white z-30 ${animClass}`}
        style={reqStyle}
       >
         {r.id.split('-')[1]}
       </div>
    );
  };

  const renderServer = (s: Server) => {
    const isOffline = !s.healthy;
    const borderClass = isOffline ? 'border-accent-red opacity-60 grayscale scale-95' : 'border-border bg-surface';
    
    return (
      <div key={s.id} className="flex flex-col items-center gap-2 w-28 sm:w-40 shrink-0">
         <div className={`w-full p-3 sm:p-4 rounded-2xl border-2 flex flex-col items-center gap-2 shadow-sm transition-all relative ${borderClass}`}>
            <div className="flex items-center justify-between w-full">
               <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${isOffline ? 'bg-accent-red/10 text-accent-red' : 'bg-accent-green/10 text-accent-green'}`}>
                  {isOffline ? 'OFF' : 'ALIVE'}
               </div>
               <div className="text-[9px] font-black text-primary">W:{s.weight}</div>
            </div>
            
            <div className="size-10 sm:size-12 rounded-xl bg-surface-raised flex items-center justify-center">
               <span className={`material-symbols-outlined text-[24px] sm:text-[28px] ${isOffline ? 'text-accent-red' : (s.connections > 0 ? 'animate-spin text-primary' : 'text-text-dim')}`}>
                  {s.healthy ? 'dns' : 'error'}
               </span>
            </div>
            
            <div className="w-full">
               <div className="h-1 bg-surface-raised rounded-full overflow-hidden">
                 <div className="h-full bg-primary" style={{ width: `${Math.min(100, (s.connections / 5) * 100)}%` }} />
               </div>
            </div>

            <button 
              type="button"
              onClick={() => toggleHealth(s.id)}
              className={`absolute -bottom-3 -right-1 size-7 rounded-full border flex items-center justify-center transition-smooth cursor-pointer ${s.healthy ? 'bg-surface text-accent-red border-accent-red/20' : 'bg-accent-green text-white'}`}
            >
               <span className="material-symbols-outlined text-[14px]">{s.healthy ? 'power_settings_new' : 'bolt'}</span>
            </button>
         </div>
         <div className="text-center">
            <p className="text-[10px] sm:text-[11px] font-black text-text">{s.name}</p>
            <p className="text-[8px] sm:text-[9px] font-medium text-text-dim uppercase">{s.processedCount} processed</p>
         </div>
      </div>
    );
  };

  return (
    <div className="animate-in flex flex-col gap-6 tool-container">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 tool-header">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Load Balancer</h2>
          <p className="text-sm text-text-sub mt-1">Simulate traffic distribution algorithms.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <button 
             onClick={toggleAllDocs}
             className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${showDocs ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-raised text-text border border-border hover:bg-border/20'}`}
           >
             <span className="material-symbols-outlined text-[18px]">{showDocs ? 'visibility_off' : 'visibility'}</span>
             {showDocs ? 'Hide Info' : 'Show Info'}
           </button>
          <select 
            value={algo}
            onChange={(e) => setAlgo(e.target.value as Algorithm)}
            className="flex-1 sm:flex-none px-3 py-2 text-sm font-bold bg-surface border-2 border-primary/20 rounded-xl cursor-pointer"
          >
            <option value="round-robin">Round Robin</option>
            <option value="least-connections">Least Connections</option>
            <option value="weighted-rr">Weighted Random</option>
          </select>
          <button 
            type="button"
            onClick={routeRequest}
            className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-white bg-primary rounded-xl shadow-lg hover:bg-primary-hover active:scale-95 transition-smooth flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Add Request
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
         {/* Educational Sections */}
         <div className={`transition-all duration-700 ${showAlgoDoc ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden invisible'}`}>
           <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                 <span className="material-symbols-outlined text-[120px]">architecture</span>
              </div>
              <div className="flex justify-between items-start relative z-10">
                 <h2 className="text-xl font-black text-primary mb-3 flex items-center gap-3">
                    <span className="material-symbols-outlined">architecture</span>
                    Load Balancing Algorithms
                 </h2>
                 <button onClick={() => setShowAlgoDoc(false)} className="size-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-primary/60 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                 </button>
              </div>
              <p className="text-sm text-text-sub leading-relaxed max-w-4xl">
                 Load balancers use different strategies to distribute traffic. <strong>Round Robin</strong> cycles through servers sequentially. <strong>Least Connections</strong> targets the server with the lowest active load. <strong>Weighted Random</strong> distributes traffic based on server capacity, ensuring powerful nodes handle more requests.
              </p>
           </div>
         </div>

         {!showAlgoDoc && showDocs && (
           <button onClick={() => setShowAlgoDoc(true)} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Explain Algorithms
           </button>
         )}

         <div className={`transition-all duration-700 ${showHealthDoc ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden invisible'}`}>
           <div className="bg-accent-red/5 border border-accent-red/10 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                 <span className="material-symbols-outlined text-[120px]">health_and_safety</span>
              </div>
              <div className="flex justify-between items-start relative z-10">
                 <h2 className="text-xl font-black text-accent-red mb-3 flex items-center gap-3">
                    <span className="material-symbols-outlined">health_and_safety</span>
                    Health Checks & Failover
                 </h2>
                 <button onClick={() => setShowHealthDoc(false)} className="size-8 rounded-lg hover:bg-accent-red/10 flex items-center justify-center text-accent-red/60 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                 </button>
              </div>
              <p className="text-sm text-text-sub leading-relaxed max-w-4xl">
                 A critical job of the load balancer is to monitor server health. If a node goes <strong>Offline</strong> (simulated by the power button), the balancer immediately stops routing traffic to it. This <strong>Failover</strong> mechanism ensures high availability and a seamless experience for end-users even when hardware fails.
              </p>
           </div>
         </div>

         {!showHealthDoc && showDocs && (
           <button onClick={() => setShowHealthDoc(true)} className="flex items-center gap-2 text-accent-red/60 hover:text-accent-red transition-all font-black text-[10px] uppercase tracking-widest">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Explain Health Checks
           </button>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[calc(100vh-210px)]">
        <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1">
          <section className="bg-surface rounded-2xl border border-border p-5">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-text-dim mb-4">Algorithms</h3>
             <div className="space-y-3">
                {["round-robin", "least-connections", "weighted-rr"].map(a => (
                   <button 
                    key={a}
                    type="button"
                    onClick={() => setAlgo(a as Algorithm)}
                    className={`w-full text-left p-2.5 rounded-xl border-2 transition-smooth cursor-pointer ${algo === a ? 'bg-primary/5 border-primary' : 'bg-surface-raised/30 border-transparent opacity-60'}`}
                   >
                      <h4 className="text-[11px] font-black text-text capitalize">{a.replace('-', ' ')}</h4>
                   </button>
                ))}
             </div>
          </section>

          <div className="flex bg-surface-raised p-1 rounded-xl border border-border shrink-0">
             {[0, 1, 2].map(r => (
               <button 
                 key={`rate-${r}`}
                 type="button"
                 onClick={() => setAutoRate(r)}
                 className={`flex-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-smooth cursor-pointer ${autoRate === r ? 'bg-primary text-white shadow-sm' : 'text-text-dim hover:text-text'}`}
               >
                 {r === 0 ? 'Off' : r === 1 ? 'Slow' : 'Fast'}
               </button>
             ))}
          </div>
        </div>

        <div className="lg:col-span-9 bg-surface-raised/30 rounded-3xl border border-border border-dashed relative overflow-hidden flex flex-col tool-panel min-h-[500px] lg:h-full order-1 lg:order-2">
          {/* Incoming */}
          <div className="h-20 flex justify-center items-center pt-8">
             <div className="size-14 sm:size-16 rounded-2xl bg-surface border-4 border-primary shadow-lg flex items-center justify-center text-primary z-20">
                <span className="material-symbols-outlined text-[28px] sm:text-[32px]">public</span>
             </div>
          </div>

          {/* LB Node */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
             <div className="size-20 sm:size-24 rounded-[2rem] bg-primary text-white shadow-xl flex flex-col items-center justify-center z-20 relative ring-4 ring-primary/20">
                <span className="material-symbols-outlined text-[32px] sm:text-[40px]">architecture</span>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1">LB</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  {requests.map(renderRequest)}
                </div>
             </div>
             
             {/* Lines */}
             <svg className="absolute inset-0 h-full w-full opacity-10 pointer-events-none hidden sm:block">
                <line x1="50%" y1="50%" x2="20%" y2="85%" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="50%" y1="50%" x2="80%" y2="85%" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
             </svg>
          </div>

          {/* Servers */}
          <div className="h-auto py-6 sm:h-48 flex justify-center items-end gap-4 sm:gap-16 px-4 overflow-x-auto sm:overflow-visible no-scrollbar shrink-0">
             {servers.map(renderServer)}
          </div>
        </div>
      </div>
    </div>
  );
}
