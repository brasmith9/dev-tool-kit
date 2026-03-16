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
    // Weighted RR (simplified)
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

    setTimeout(() => {
      setRequests(current => current.map(r => (r.id === reqId ? { ...r, status: "routing" } : r)));
    }, 400);

    setTimeout(() => {
      setRequests(current => current.map(r => (r.id === reqId ? { ...r, status: "processing" } : r)));
    }, 800);

    setTimeout(() => {
      removeRequest(reqId, target.id);
    }, 2000);
  }, [selectTarget, servers, removeRequest]);

  useEffect(() => {
    if (autoRate === 0) return;
    const interval = setInterval(routeRequest, autoRate === 1 ? 2000 : 800);
    return () => clearInterval(interval);
  }, [autoRate, routeRequest]);

  const toggleHealth = (id: number) => {
    setServers(prev => prev.map(s => (s.id === id ? { ...s, healthy: !s.healthy } : s)));
  };

  return (
    <div className="animate-in flex flex-col gap-6 tool-container">
      <div className="flex items-end justify-between tool-header">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Load Balancer Viz</h2>
          <p className="text-sm text-text-sub mt-1">Simulate traffic distribution algorithms and high-availability failover.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={algo}
            onChange={(e) => setAlgo(e.target.value as Algorithm)}
            className="px-4 py-2 text-sm font-bold bg-surface border-2 border-primary/20 rounded-xl cursor-pointer text-text hover:border-primary transition-smooth focus:ring-4 focus:ring-primary/10"
          >
            <option value="round-robin">Round Robin</option>
            <option value="least-connections">Least Connections</option>
            <option value="weighted-rr">Weighted Random</option>
          </select>
          <div className="flex bg-surface-raised p-1 rounded-xl border border-border">
             {[0, 1, 2].map(r => {
               let label = "Off";
               if (r === 1) label = "Slow";
               if (r === 2) label = "Fast";
               return (
                 <button 
                   key={`rate-${r}`}
                   type="button"
                   onClick={() => setAutoRate(r)}
                   className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-smooth cursor-pointer ${autoRate === r ? 'bg-primary text-white shadow-sm' : 'text-text-dim hover:text-text'}`}
                 >
                   {label}
                 </button>
               );
             })}
          </div>
          <button 
            type="button"
            onClick={routeRequest}
            className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-xl shadow-lg hover:bg-primary-hover active:scale-95 transition-smooth flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Add Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-210px)]">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <section className="bg-surface rounded-2xl border border-border shadow-card p-5">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-text-dim mb-4">Traffic Lab</h3>
             <div className="space-y-4">
                <div className={`p-3 rounded-xl border-2 transition-smooth ${algo === 'round-robin' ? 'bg-primary/5 border-primary shadow-sm' : 'bg-surface-raised/30 border-border opacity-70'}`}>
                   <h4 className="text-[11px] font-black text-text mb-1">Round Robin</h4>
                   <p className="text-[10px] text-text-sub leading-relaxed">Simply distributes requests to each server in order, ignoring load or capacity.</p>
                </div>
                <div className={`p-3 rounded-xl border-2 transition-smooth ${algo === 'least-connections' ? 'bg-primary/5 border-primary shadow-sm' : 'bg-surface-raised/30 border-border opacity-70'}`}>
                   <h4 className="text-[11px] font-black text-text mb-1">Least Connections</h4>
                   <p className="text-[10px] text-text-sub leading-relaxed">Sends requests to the server with the fewest active tasks. Best for long-lived tasks.</p>
                </div>
                <div className={`p-3 rounded-xl border-2 transition-smooth ${algo === 'weighted-rr' ? 'bg-primary/5 border-primary shadow-sm' : 'bg-surface-raised/30 border-border opacity-70'}`}>
                   <h4 className="text-[11px] font-black text-text mb-1">Weighted Distribution</h4>
                   <p className="text-[10px] text-text-sub leading-relaxed">Servers with more CPU/RAM (higher weight) get a larger share of the traffic.</p>
                </div>
             </div>
          </section>

          <section className="bg-primary/5 rounded-2xl border border-primary/10 p-5 mt-auto">
             <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
                Failover Simulation
             </h4>
             <p className="text-[11px] text-primary/70 font-medium leading-relaxed">Try turning a server "Offline" while traffic is flowing to see the load balancer instantly redirect new requests.</p>
          </section>
        </div>

        <div className="lg:col-span-9 bg-surface-raised/30 rounded-3xl border border-border border-dashed relative overflow-hidden flex flex-col tool-panel">
          <div className="h-20 flex justify-center items-center pt-8">
             <div className="size-16 rounded-2xl bg-white dark:bg-surface border-4 border-primary shadow-float flex items-center justify-center text-primary z-20">
                <span className="material-symbols-outlined text-[32px]">public</span>
             </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative">
             <div className="size-24 rounded-[2rem] bg-primary text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] flex flex-col items-center justify-center z-20 relative ring-4 ring-primary/20">
                <span className="material-symbols-outlined text-[40px]">architecture</span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] mt-1">LB Node</span>
                
                {requests.map((r) => {
                   const offset = (r.serverId || 2) - 2;
                   const xPos = offset * 260;
                   const isEntering = r.status === 'entering';
                   const isRouting = r.status === 'routing';
                   const isProcessing = r.status === 'processing';
                   
                   const reqStyle = { 
                      transform: isProcessing ? `translate(${xPos}px, 260px)` : 'none'
                   } as React.CSSProperties;

                   return (
                      <div 
                       key={r.id} 
                       className={`absolute size-10 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] flex items-center justify-center text-[10px] font-black text-white transition-all duration-1000 bg-primary border-2 border-white dark:border-surface-raised z-30
                         ${isEntering ? 'top-[-110px] opacity-100 scale-125' : ''}
                         ${isRouting ? 'scale-110 opacity-100' : ''}
                         ${isProcessing ? 'top-[220px] opacity-0' : ''}
                       `}
                       style={reqStyle}
                      >
                        {r.id.split('-')[1]}
                      </div>
                   );
                })}
             </div>
             
             <svg className="absolute inset-x-0 h-full w-full opacity-20 pointer-events-none" style={{ top: '10%' }}>
                <line x1="50%" y1="20%" x2="20%" y2="80%" stroke="var(--color-primary)" strokeWidth="3" strokeDasharray="8,8" />
                <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="var(--color-primary)" strokeWidth="3" strokeDasharray="8,8" />
                <line x1="50%" y1="20%" x2="80%" y2="80%" stroke="var(--color-primary)" strokeWidth="3" strokeDasharray="8,8" />
             </svg>
          </div>

          <div className="h-48 flex justify-center gap-16 pb-12">
             {servers.map((s) => {
                const isOffline = !s.healthy;
                const borderClass = isOffline ? 'border-accent-red opacity-60 grayscale scale-95' : 'border-border-strong bg-white dark:bg-surface';
                const statusLabel = isOffline ? 'Offline' : 'Healthy';
                const statusBg = isOffline ? 'bg-accent-red/10 text-accent-red' : 'bg-accent-green/10 text-accent-green';
                const iconColor = (s.healthy && s.connections > 0) ? 'animate-spin text-primary' : (isOffline ? 'text-accent-red' : 'text-text-dim');
                const btnClass = s.healthy ? 'bg-white text-accent-red border-accent-red/20 shadow-sm' : 'bg-accent-green text-white border-accent-green shadow-lg';

                return (
                  <div key={s.id} className="flex flex-col items-center gap-3 w-40">
                     <div className={`w-full p-4 rounded-2xl border-2 flex flex-col items-center gap-2 shadow-card transition-all duration-300 relative ${borderClass}`}>
                        <div className="flex items-center justify-between w-full">
                           <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${statusBg}`}>
                              {statusLabel}
                           </div>
                           <div className="text-[10px] font-black text-primary">W:{s.weight}</div>
                        </div>
                        
                        <div className="size-12 rounded-xl bg-surface-raised flex items-center justify-center transition-smooth">
                           <span className={`material-symbols-outlined text-[28px] ${iconColor}`}>
                              {s.healthy ? 'dns' : 'error'}
                           </span>
                        </div>
                        
                        <div className="w-full">
                           <div className="flex justify-between text-[9px] font-bold text-text-dim mb-1">
                              <span>Active Conns</span>
                              <span>{s.connections}</span>
                           </div>
                           <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
                             <div className="h-full transition-all duration-500 bg-primary shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${Math.min(100, (s.connections / 10) * 100)}%` }} />
                           </div>
                        </div>

                        <button 
                          type="button"
                          onClick={() => toggleHealth(s.id)}
                          className={`absolute -bottom-4 right-4 size-8 rounded-full border flex items-center justify-center transition-smooth cursor-pointer active:scale-90 ${btnClass}`}
                        >
                           <span className="material-symbols-outlined text-[16px]">{s.healthy ? 'power_settings_new' : 'bolt'}</span>
                        </button>
                     </div>
                     <div className="text-center">
                        <p className="text-[11px] font-black text-text">{s.name}</p>
                        <p className="text-[9px] font-bold text-text-dim uppercase tracking-tighter">{s.processedCount} Reqs Handled</p>
                     </div>
                  </div>
                );
             })}
          </div>
        </div>
      </div>
    </div>
  );
}
