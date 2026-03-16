"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

const PARTITION_COUNT = 3;
const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f43f5e"];

export default function KafkaVisualizer() {
  const [partitions, setPartitions] = useState<Message[][]>(new Array(PARTITION_COUNT).fill([]).map(() => []));
  const [groups, setGroups] = useState<Record<string, ConsumerGroup>>({
    "group-1": { id: "group-1", name: "Shipping Service", offsets: { 0: 0, 1: 0, 2: 0 }, color: "bg-accent-blue", label: "📦" },
    "group-2": { id: "group-2", name: "Billing Service", offsets: { 0: 0, 1: 0, 2: 0 }, color: "bg-accent-purple", label: "💳" }
  });
  
  const [flyingMessage, setFlyingMessage] = useState<Message | null>(null);
  const [autoProduce, setAutoProduce] = useState(false);
  const nextId = useRef(1);

  // Story states for UI captions
  const [storyLine, setStoryLine] = useState("Click 'Produce' to start the story.");

  const produce = useCallback(() => {
    if (flyingMessage) return;

    const pIdx = Math.floor(Math.random() * PARTITION_COUNT);
    const msg: Message = {
      id: `m-${nextId.current++}`,
      partition: pIdx,
      offset: partitions[pIdx].length,
      status: "producing",
      color: COLORS[pIdx % COLORS.length]
    };

    setFlyingMessage(msg);
    setStoryLine(`Producer sending ${msg.id} to Partition ${pIdx}...`);

    // Animation: Move to partition
    setTimeout(() => {
      setPartitions(prev => {
        const next = [...prev];
        const storedMsg: Message = { ...msg, status: "stored" };
        next[pIdx] = [...next[pIdx], storedMsg].slice(-6);
        return next;
      });
      setFlyingMessage(null);
      setStoryLine(`${msg.id} is now permanently stored and immutable in the log.`);
    }, 800);
  }, [flyingMessage, partitions]);

  const processGroupConsumption = useCallback((prevGroups: Record<string, ConsumerGroup>) => {
    const nextGroups = { ...prevGroups };
    let activity = false;

    Object.keys(nextGroups).forEach(gId => {
      const group = nextGroups[gId];
      for (let p = 0; p < PARTITION_COUNT; p++) {
        const currentOffset = group.offsets[p] || 0;
        const partitionMsgs = partitions[p];
        
        if (partitionMsgs.some(m => m.offset >= currentOffset)) {
          group.offsets[p] = currentOffset + 1;
          setStoryLine(`${group.name} just 'committed' offset ${currentOffset + 1} on Partition ${p}.`);
          activity = true;
          break;
        }
      }
    });

    return activity ? nextGroups : prevGroups;
  }, [partitions]);

  // Consumer Loop: One at a time for slow-mo "story" feel
  useEffect(() => {
    const interval = setInterval(() => {
      setGroups(processGroupConsumption);
    }, 2500);

    return () => clearInterval(interval);
  }, [processGroupConsumption]);

  useEffect(() => {
    if (!autoProduce) return;
    const interval = setInterval(produce, 2000);
    return () => clearInterval(interval);
  }, [autoProduce, produce]);

  const rewindStory = () => {
    setPartitions(new Array(PARTITION_COUNT).fill([]).map(() => [])); 
    setGroups(prev => {
      const res = { ...prev };
      Object.keys(res).forEach(k => {
        res[k] = { ...res[k], offsets: { 0: 0, 1: 0, 2: 0 } };
      });
      return res;
    });
    setStoryLine("Click 'Produce' to start the story.");
  };

  return (
    <div className="animate-in flex flex-col gap-6 tool-container">
      <div className="flex items-end justify-between tool-header">
        <div>
           <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-primary">Kafka Storyboard</h2>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">Educational Demo</span>
           </div>
           <p className="text-sm text-text-sub mt-1">Watch how data flows, sticks, and is shared across services.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={rewindStory}
            className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-surface border border-border rounded-xl cursor-pointer"
          >
            Rewind Story
          </button>
          <button 
            type="button" 
            onClick={() => setAutoProduce(!autoProduce)}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-all duration-500 shadow-card ${autoProduce ? 'bg-accent-red text-white' : 'bg-surface text-text'}`}
          >
            {autoProduce ? "Stop Auto-Play" : "Auto-Play Story"}
          </button>
          <button 
            type="button" 
            onClick={produce} 
            disabled={!!flyingMessage}
            className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-xl shadow-lg hover:bg-primary-hover disabled:opacity-50 transition-all active:scale-95"
          >
            Produce Event
          </button>
        </div>
      </div>

      <div className="bg-surface-raised/30 rounded-3xl border border-border p-12 min-h-[600px] flex flex-col gap-12 relative overflow-hidden tool-panel">
        
        {/* Narrative Overlay */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/80 dark:bg-surface/80 backdrop-blur-md rounded-full border border-primary/20 shadow-float text-xs font-bold text-primary flex items-center gap-3 z-50 animate-in translate-y-0">
           <span className="material-symbols-outlined text-[16px] animate-pulse">info</span>
           {storyLine}
        </div>

        {/* 1. THE SOURCE (Producers) */}
        <div className="flex flex-col items-center gap-2">
           <div className="size-20 rounded-3xl bg-white dark:bg-surface border-4 border-primary shadow-float flex items-center justify-center relative z-20 transition-all group hover:scale-105">
              <span className="material-symbols-outlined text-[40px] text-primary group-hover:rotate-12 transition-transform">sensors</span>
              
              {/* Flying Message Animation */}
              {flyingMessage && (
                <div 
                  className="absolute size-10 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-lg animate-fly-to-partition z-50"
                  style={{ backgroundColor: flyingMessage.color, "--dest-x": `${(flyingMessage.partition - 1) * 200}px` } as any}
                >
                  {flyingMessage.id}
                </div>
              )}

              <div className="absolute -bottom-8 text-[10px] font-black uppercase tracking-widest text-text-dim text-center w-32">App Producer</div>
           </div>
        </div>

        {/* 2. THE LOG (Kafka Cluster) */}
        <div className="flex-1 flex justify-center gap-16 items-center">
           {[0, 1, 2].map(pIdx => (
             <div key={`p-${pIdx}`} className="relative group">
                {/* Partition Container */}
                <div className="w-32 h-[300px] bg-white dark:bg-surface border-2 border-border rounded-2xl shadow-card p-2 flex flex-col-reverse gap-2 relative z-10 overflow-hidden">
                   {/* Background Labels */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none font-black text-4xl select-none">
                      P{pIdx}
                   </div>

                   {partitions[pIdx].map((m, idx) => (
                     <div 
                        key={m.id} 
                        className="h-10 w-full rounded-xl flex flex-col items-center justify-center text-[10px] font-black text-white shadow-sm border border-black/5 animate-in"
                        style={{ backgroundColor: m.color, opacity: 1 - (idx * 0.1) }}
                     >
                        {m.id}
                        <span className="text-[7px] opacity-60">Offset {m.offset}</span>
                     </div>
                   ))}

                   {/* Committed Offset Markers (The bookmarks) */}
                   {Object.values(groups).map((group) => {
                      const offset = group.offsets[pIdx] || 0;
                      // Calculate height based on how many messages the group has read
                      // In our visualizer, we map offset to total height
                      const visualY = Math.min(offset * 48, 280); 
                      return (
                        <div 
                          key={`${group.id}-marker-${pIdx}`}
                          className={`absolute left-0 right-0 h-0.5 ${group.color} transition-all duration-700 ease-out z-20 flex shadow-glow`}
                          style={{ bottom: `${visualY}px`, color: group.offsets[pIdx] ? 'inherit' : 'transparent' }}
                        >
                           <div className={`absolute -right-3 -top-2 size-5 rounded-full ${group.color} text-white flex items-center justify-center text-[10px] shadow-lg border-2 border-white`}>
                              {group.label}
                           </div>
                        </div>
                      );
                   })}
                </div>
                
                {/* Partition ID label */}
                <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-center text-text-dim group-hover:text-primary transition-colors">
                   Log Partition {pIdx}
                </div>
             </div>
           ))}
        </div>

        {/* 3. THE READERS (Consumer Groups) */}
        <div className="flex justify-center gap-24">
           {Object.values(groups).map(group => (
             <div key={group.id} className="flex flex-col items-center gap-4">
                <div className={`size-16 rounded-2xl ${group.color} text-white flex items-center justify-center shadow-float ring-4 ring-offset-4 ring-offset-surface ring-transparent active:scale-95 transition-all`}>
                   <span className="text-2xl">{group.label}</span>
                </div>
                <div className="text-center">
                   <h4 className="text-[11px] font-black text-text uppercase mb-0.5">{group.name}</h4>
                   <p className="text-[9px] font-bold text-text-dim tracking-tight">Independent Service</p>
                </div>
             </div>
           ))}
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10 opacity-30" />
      </div>

      <style jsx global>{`
        @keyframes fly-to-partition {
          0% { transform: translate(0, 0) scale(1.2); opacity: 1; }
          40% { transform: translate(var(--dest-x), 100px) scale(1); }
          100% { transform: translate(var(--dest-x), 220px) scale(0.8); opacity: 0; }
        }
        .animate-fly-to-partition {
          animation: fly-to-partition 0.8s ease-in-out forwards;
        }
        .shadow-glow {
          box-shadow: 0 0 15px currentColor;
        }
      `}</style>
    </div>
  );
}
