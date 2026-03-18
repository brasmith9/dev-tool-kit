"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  partition: number;
  offset: number;
  status: "producing" | "stored" | "consumed";
  color: string;
}

interface ConsumerGroup {
  id: string;
  name: string;
  offsets: Record<number, number>;
  color: string;
  label: string;
}

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f43f5e", "#f59e0b"];

export default function KafkaVisualizer() {
  const [partitionsCount, setPartitionsCount] = useState(3);
  const [brokersCount, setBrokersCount] = useState(3);
  const [replicationFactor, setReplicationFactor] = useState(2);
  const [producerInterval, setProducerInterval] = useState(2);
  const [animationSpeed, setAnimationSpeed] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [showDocs, setShowDocs] = useState(false);
  const [showKafkaDoc, setShowKafkaDoc] = useState(false);
  const [showBrokerDoc, setShowBrokerDoc] = useState(false);
  const [showConsumerDoc, setShowConsumerDoc] = useState(false);

  const toggleAllDocs = () => {
    const nextValue = !showDocs;
    setShowDocs(nextValue);
    setShowKafkaDoc(nextValue);
    setShowBrokerDoc(nextValue);
    setShowConsumerDoc(nextValue);
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<ConsumerGroup[]>([
    { id: "A", name: "Billing Service", offsets: {}, color: "bg-accent-blue", label: "A" },
    { id: "B", name: "Shipping Service", offsets: {}, color: "bg-accent-purple", label: "B" }
  ]);
  
  const [nextId, setNextId] = useState(1);
  const [tick, setTick] = useState(0);
  const lastProcessedTick = useRef(0);

  // Simulation Tick
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Combined Simulation Logic
  useEffect(() => {
    if (isPaused || tick === 0 || tick === lastProcessedTick.current) return;
    lastProcessedTick.current = tick;

    // 1. PRODUCER LOGIC
    if (tick % producerInterval === 0) {
      const pIdx = Math.floor(Math.random() * partitionsCount);
      setMessages(prev => {
        const offset = prev.filter(m => m.partition === pIdx).length;
        const newMsg: Message = {
          id: nextId.toString(),
          partition: pIdx,
          offset: offset,
          status: "producing",
          color: COLORS[pIdx % COLORS.length]
        };
        setNextId(id => id + 1);
        setTimeout(() => {
          setMessages(msgs => msgs.map(m => m.id === newMsg.id ? { ...m, status: "stored" } : m));
        }, 1000);
        return [...prev].slice(-50).concat(newMsg);
      });
    }

    // 2. CONSUMER LOGIC
    setGroups(prev => prev.map(group => {
      const nextOffsets = { ...group.offsets };
      let changed = false;

      for (let p = 0; p < partitionsCount; p++) {
        const currentOffset = nextOffsets[p] ?? 0;
        const availableMsgs = messages.filter(m => m.partition === p && m.status === "stored");
        
        if (availableMsgs.some(m => m.offset >= currentOffset)) {
           nextOffsets[p] = currentOffset + 1;
           changed = true;
           break; // Consume one at a time per tick for realism
        }
      }
      return changed ? { ...group, offsets: nextOffsets } : group;
    }));
  }, [tick, isPaused, producerInterval, partitionsCount, messages, nextId]);

  const reset = () => {
    setMessages([]);
    setNextId(1);
    setTick(0);
    setGroups(g => g.map(group => ({ ...group, offsets: {} })));
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen lg:h-[calc(100vh-140px)] gap-0 overflow-hidden bg-background">
      {/* Sidebar Configuration */}
      {showConfig && (
        <aside className="w-full lg:w-[320px] border-b lg:border-r lg:border-b-0 border-border bg-surface overflow-y-auto animate-in slide-in-from-left duration-500 shadow-xl z-20">
           <div className="p-8 space-y-10">
              <div className="flex flex-col items-center text-center gap-4">
                 <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <span className="material-symbols-outlined text-[32px]">hub</span>
                 </div>
                 <div>
                    <h1 className="text-xl font-black tracking-tight text-text">Kafka Visualizer</h1>
                    <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em] mt-1">Experimental Lab</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="space-y-5">
                    <div className="flex justify-between items-end">
                       <label htmlFor="partitions-range" className="text-[11px] font-black uppercase tracking-widest text-text-dim">Partitions</label>
                       <span className="text-sm font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">{partitionsCount}</span>
                    </div>
                    <input id="partitions-range" type="range" min="1" max="5" value={partitionsCount} onChange={e => setPartitionsCount(Number(e.target.value))} className="w-full accent-primary h-1.5 bg-surface-raised rounded-lg appearance-none cursor-pointer" />
                 </div>

                 <div className="space-y-5">
                    <div className="flex justify-between items-end">
                       <label htmlFor="brokers-range" className="text-[11px] font-black uppercase tracking-widest text-text-dim">Brokers</label>
                       <span className="text-sm font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">{brokersCount}</span>
                    </div>
                    <input id="brokers-range" type="range" min="1" max="5" value={brokersCount} onChange={e => setBrokersCount(Number(e.target.value))} className="w-full accent-primary h-1.5 bg-surface-raised rounded-lg appearance-none cursor-pointer" />
                 </div>

                 <div className="space-y-5">
                    <div className="flex justify-between items-end">
                       <label htmlFor="replication-range" className="text-[11px] font-black uppercase tracking-widest text-text-dim">Replication Factor</label>
                       <span className="text-sm font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">{replicationFactor}</span>
                    </div>
                    <input id="replication-range" type="range" min="1" max="5" value={replicationFactor} onChange={e => setReplicationFactor(Number(e.target.value))} className="w-full accent-primary h-1.5 bg-surface-raised rounded-lg appearance-none cursor-pointer" />
                 </div>

                 <div className="pt-6 border-t border-border space-y-5">
                    <label htmlFor="producer-interval" className="text-[11px] font-black uppercase tracking-widest text-text-dim">Producer Interval</label>
                    <div className="flex items-center gap-3">
                       <input 
                         id="producer-interval"
                         type="number" 
                         value={producerInterval} 
                         onChange={e => setProducerInterval(Math.max(1, Number(e.target.value)))}
                         className="w-full p-3 bg-surface-raised border border-border rounded-xl font-black text-center text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-smooth"
                       />
                       <span className="text-[10px] font-black text-text-dim uppercase">Ticks</span>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-border">
                    <button onClick={reset} className="w-full py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary-hover hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                       <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                       Restart Simulation
                    </button>
                 </div>
              </div>
           </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface-raised/5 relative">
         {/* Top Control Bar */}
         <div className="h-20 border-b border-border bg-surface/80 backdrop-blur-xl px-8 flex items-center justify-between shrink-0 select-none z-10 shadow-sm">
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setShowConfig(!showConfig)}
                 className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${showConfig ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-raised text-text border border-border hover:bg-border/20'}`}
               >
                 <span className="material-symbols-outlined text-[18px]">{showConfig ? 'left_panel_close' : 'left_panel_open'}</span>
                 {showConfig ? 'Hide Config' : 'Show Config'}
               </button>
               <button 
                 onClick={toggleAllDocs}
                 className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${showDocs ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-raised text-text border border-border hover:bg-border/20'}`}
               >
                 <span className="material-symbols-outlined text-[18px]">{showDocs ? 'visibility_off' : 'visibility'}</span>
                 {showDocs ? 'Hide Info' : 'Show Info'}
               </button>
            </div>

            <div className="flex items-center gap-8">
               <div className="flex items-center gap-4 bg-surface-raised/50 p-1.5 rounded-2xl border border-border">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-dim ml-3 hidden sm:block">Flow Velocity</span>
                  <div className="flex bg-surface rounded-xl p-1 border border-border/50 shadow-inner">
                     {[5, 4, 3, 2, 1].map(s => (
                        <button 
                          key={s} 
                          onClick={() => setAnimationSpeed(s)}
                          className={`w-11 py-1.5 text-[11px] font-black rounded-lg transition-all duration-300 ${animationSpeed === s ? 'bg-primary text-white shadow-md' : 'text-text-dim hover:text-text hover:bg-surface-raised'}`}
                        >
                          {s}s
                        </button>
                     ))}
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsPaused(!isPaused)}
                    className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-500 border shadow-xl ${isPaused ? 'bg-accent-green text-white border-accent-green scale-110 shadow-accent-green/30' : 'bg-surface text-text border-border hover:border-primary/50'}`}
                  >
                    <span className="material-symbols-outlined text-[24px] font-black">{isPaused ? 'play_arrow' : 'pause'}</span>
                  </button>
               </div>
            </div>
         </div>

         {/* Animation Canvas */}
         <div className="flex-1 overflow-y-auto p-4 sm:p-12 lg:p-20 relative scroll-smooth no-scrollbar">
            <div className="max-w-6xl mx-auto space-y-32 pb-40">
               
               {/* 1. PRODUCER ROW */}
               <div className="space-y-8 group">
                  <div className={`transition-all duration-500 ${showKafkaDoc ? 'max-h-96 opacity-100 mb-8' : 'max-h-0 opacity-0 overflow-hidden invisible'}`}>
                    <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                          <span className="material-symbols-outlined text-[120px]">sensors</span>
                       </div>
                       <div className="flex justify-between items-start relative z-10">
                          <h2 className="text-xl font-black text-primary mb-3 flex items-center gap-3">
                             <span className="material-symbols-outlined">sensors</span>
                             Apache Kafka
                          </h2>
                          <button onClick={() => setShowKafkaDoc(false)} className="size-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-primary/60 transition-colors">
                             <span className="material-symbols-outlined text-[20px]">close</span>
                          </button>
                       </div>
                       <p className="text-sm text-text-sub leading-relaxed max-w-3xl">
                          Apache Kafka is a <strong>distributed event streaming platform</strong>. Think of it as a high-performance, fault-tolerant sequence of records. It allows you to publish and subscribe to streams of events, similar to a message queue or enterprise messaging system, but with massive scale and persistence.
                       </p>
                    </div>
                  </div>

                  {!showKafkaDoc && showDocs && (
                    <button onClick={() => setShowKafkaDoc(true)} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest mb-4">
                       <span className="material-symbols-outlined text-[18px]">info</span>
                       Explain Kafka
                    </button>
                  )}
                  
                  <div className="flex flex-col gap-6">
                     <div className="flex items-center gap-8">
                        <div className="w-32 flex flex-col items-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                           <span className="text-[11px] font-black uppercase tracking-widest text-text-dim leading-none">The Source</span>
                           <span className="text-[10px] font-bold text-primary/60 uppercase tracking-tighter">Producer</span>
                        </div>
                        <div className="flex-1 h-16 bg-surface border border-border rounded-3xl flex items-center px-5 gap-4 relative overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-500 ring-4 ring-transparent group-hover:ring-primary/5">
                           <div className="size-10 rounded-2xl bg-surface-raised border border-border-dim flex items-center justify-center text-[12px] font-black text-text-dim shadow-inner shrink-0 leading-none">P</div>
                           <div className="flex flex-1 gap-2 overflow-hidden justify-end h-full py-3">
                              {messages.filter(m => m.status === "producing").map((m) => (
                                 <div 
                                   key={m.id} 
                                   className="h-full px-4 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-xl animate-in slide-in-from-left-12 fade-in zoom-in-95 duration-700 hover:scale-110 transition-transform cursor-default"
                                   style={{ backgroundColor: m.color }}
                                 >
                                   {m.id}
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* 2. BROKERS ROW */}
               <div className="space-y-10 group/broker">
                  <div className={`transition-all duration-700 ${showBrokerDoc ? 'max-h-96 opacity-100 mb-8' : 'max-h-0 opacity-0 overflow-hidden invisible'}`}>
                    <div className="bg-accent-purple/5 border border-accent-purple/10 rounded-3xl p-10 relative overflow-hidden shadow-inner">
                       <div className="absolute -top-4 -right-4 p-8 opacity-5 pointer-events-none">
                          <span className="material-symbols-outlined text-[160px]">database</span>
                       </div>
                       <div className="flex justify-between items-start relative z-10">
                          <h2 className="text-2xl font-black text-accent-purple mb-4 flex items-center gap-3">
                             <span className="material-symbols-outlined text-[28px]">database</span>
                             Kafka Brokers
                          </h2>
                          <button onClick={() => setShowBrokerDoc(false)} className="size-8 rounded-lg hover:bg-accent-purple/10 flex items-center justify-center text-accent-purple/60 transition-colors">
                             <span className="material-symbols-outlined text-[20px]">close</span>
                          </button>
                       </div>
                       <p className="text-base text-text-sub leading-relaxed max-w-4xl opacity-80">
                          A Kafka <strong>Broker</strong> is a dedicated server within a cluster that handles the storage and retrieval of event streams. Every message produced is assigned an <strong>Offset</strong> — a unique identifier representing its position in the partition log. By using multiple brokers, Kafka achieves <strong>Horizontal Scaling</strong> and high availability through data replication.
                       </p>
                    </div>
                  </div>

                  {!showBrokerDoc && showDocs && (
                    <button onClick={() => setShowBrokerDoc(true)} className="flex items-center gap-2 text-accent-purple/60 hover:text-accent-purple transition-all font-black text-[10px] uppercase tracking-widest mb-4">
                       <span className="material-symbols-outlined text-[18px]">info</span>
                       Explain Brokers
                    </button>
                  )}

                  <div className="flex items-start gap-8">
                     <div className="w-32 flex flex-col items-end gap-1 mt-6 opacity-60 group-hover/broker:opacity-100 transition-opacity">
                        <span className="text-[11px] font-black uppercase tracking-widest text-text-dim leading-none">Distributed Log</span>
                        <span className="text-[10px] font-bold text-accent-purple/60 uppercase tracking-tighter">Brokers</span>
                     </div>
                     <div className="flex-1 space-y-4">
                        {[...Array(brokersCount)].map((_, bIdx) => (
                           <div key={`idx-broker-${bIdx}`} className="relative h-16 bg-surface border border-border rounded-3xl flex items-center px-5 gap-6 shadow-sm group hover:border-accent-purple/40 transition-all duration-500 ring-4 ring-transparent hover:ring-accent-purple/5">
                              <div className={`size-10 rounded-2xl ${bIdx === 0 ? 'bg-accent-purple text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'bg-surface-raised text-text-dim'} flex items-center justify-center text-[13px] font-black transition-all duration-700 shrink-0 leading-none shadow-sm`}>
                                {bIdx + 1}
                              </div>
                              <div className="flex-1 flex gap-3 h-full py-3 items-center overflow-x-auto no-scrollbar">
                                 {messages.filter(m => m.status === "stored" && m.partition % brokersCount === bIdx).map(m => (
                                    <div 
                                      key={`broker-${bIdx}-msg-${m.id}`} 
                                      className="h-full px-5 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-lg ring-1 ring-white/20 shrink-0 animate-in flip-in-x duration-700 hover:scale-110 transition-transform"
                                      style={{ backgroundColor: m.color }}
                                    >
                                      {m.id}
                                    </div>
                                 ))}
                              </div>
                              <button className="size-9 rounded-xl bg-surface-raised text-text-dim hover:bg-accent-red hover:text-white flex items-center justify-center opacity-0 lg:group-hover:opacity-100 transition-all cursor-pointer shadow-sm">
                                 <span className="material-symbols-outlined text-[20px]">power_settings_new</span>
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* 3. CONSUMERS ROW */}
               <div className="space-y-10 group/consumer">
                  <div className={`transition-all duration-700 ${showConsumerDoc ? 'max-h-96 opacity-100 mb-8' : 'max-h-0 opacity-0 overflow-hidden invisible'}`}>
                    <div className="bg-accent-blue/5 border border-accent-blue/10 rounded-3xl p-10 relative overflow-hidden shadow-inner">
                       <div className="absolute -top-4 -right-4 p-8 opacity-5 pointer-events-none">
                          <span className="material-symbols-outlined text-[160px]">smart_toy</span>
                       </div>
                       <div className="flex justify-between items-start relative z-10">
                          <h2 className="text-2xl font-black text-accent-blue mb-4 flex items-center gap-3">
                             <span className="material-symbols-outlined text-[28px]">smart_toy</span>
                             Kafka Consumers
                          </h2>
                          <button onClick={() => setShowConsumerDoc(false)} className="size-8 rounded-lg hover:bg-accent-blue/10 flex items-center justify-center text-accent-blue/60 transition-colors">
                             <span className="material-symbols-outlined text-[20px]">close</span>
                          </button>
                       </div>
                       <p className="text-base text-text-sub leading-relaxed max-w-4xl opacity-80">
                          <strong>Consumers</strong> are applications that subscribe to topics and process the message stream. To manage high-throughput data, multiple consumers can work together in a <strong>Consumer Group</strong>. Kafka manages the partition assignment to ensure each partition is processed by only one consumer in a group, ensuring strict ordering within a partition.
                       </p>
                    </div>
                  </div>

                  {!showConsumerDoc && showDocs && (
                    <button onClick={() => setShowConsumerDoc(true)} className="flex items-center gap-2 text-accent-blue/60 hover:text-accent-blue transition-all font-black text-[10px] uppercase tracking-widest mb-4">
                       <span className="material-symbols-outlined text-[18px]">info</span>
                       Explain Consumers
                    </button>
                  )}

                  <div className="flex items-start gap-8">
                     <div className="w-32 flex flex-col items-end gap-1 mt-6 opacity-60 group-hover/consumer:opacity-100 transition-opacity">
                        <span className="text-[11px] font-black uppercase tracking-widest text-text-dim leading-none">Subscribers</span>
                        <span className="text-[10px] font-bold text-accent-blue/60 uppercase tracking-tighter">Consumers</span>
                     </div>
                     <div className="flex-1 space-y-4">
                        {groups.map(group => (
                           <div key={`group-row-${group.id}`} className="relative h-16 bg-surface border border-border rounded-3xl flex items-center px-5 gap-6 shadow-sm group hover:border-accent-blue/40 transition-all duration-500 ring-4 ring-transparent hover:ring-accent-blue/5">
                              <div className={`size-10 rounded-2xl ${group.color} text-white flex items-center justify-center text-[13px] font-black shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0 leading-none`}>
                                {group.label}
                              </div>
                              <div className="flex-1 flex gap-3 h-full py-3 items-center overflow-x-auto no-scrollbar">
                                 {messages.filter(m => {
                                    const offset = group.offsets[m.partition] ?? 0;
                                    return m.status === "stored" && m.offset < offset;
                                 }).slice(-15).map(m => (
                                    <div 
                                      key={`${group.id}-log-${m.id}`} 
                                      className="h-full px-5 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-md opacity-20 grayscale-[70%] shrink-0 animate-in slide-in-from-top-4 duration-1000 transition-all hover:opacity-100 hover:grayscale-0 hover:scale-105"
                                      style={{ backgroundColor: m.color }}
                                    >
                                      {m.id}
                                    </div>
                                 ))}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

            </div>

            {/* Background Decor */}
            <div className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:48px_48px] -z-10 opacity-30" />
            
            {/* Smooth flow indicators */}
            <div className="fixed bottom-12 right-12 z-50 flex items-center gap-5 bg-surface/80 backdrop-blur-xl px-7 py-4 rounded-3xl border border-border shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 hover:scale-105 transition-transform">
               <div className="flex items-center gap-3">
                  <div className={`size-2.5 rounded-full ${isPaused ? 'bg-accent-red shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-accent-green shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse'}`} />
                  <span className="text-[11px] font-black uppercase tracking-[0.1em] text-text leading-none">{isPaused ? 'Simulation Paused' : 'Live Event Stream'}</span>
               </div>
               <div className="h-5 w-px bg-border/50" />
               <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-text-dim uppercase tracking-widest leading-none">System Tick</span>
                  <span className="text-[14px] font-black text-primary leading-none">#{tick.toString().padStart(4, '0')}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
