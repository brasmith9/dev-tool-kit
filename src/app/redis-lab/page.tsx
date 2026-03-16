"use client";

import { useState, useEffect, useCallback } from "react";

interface CacheItem {
  key: string;
  value: string;
  ttl: number; // seconds
  lastAccessed: number;
  isNew?: boolean;
}

const MAX_CACHE_SIZE = 8;
const DEFAULT_TTL = 30;
const DB_ITEMS = [
  { key: "user:1", value: "{ id: 1, name: 'Isaac' }" },
  { key: "user:2", value: "{ id: 2, name: 'Sarah' }" },
  { key: "post:44", value: "{ id: 44, title: 'Redis is fast' }" },
  { key: "config:app", value: "{ theme: 'dark', lang: 'en' }" },
];

export default function RedisLabPage() {
  const [cache, setCache] = useState<Record<string, CacheItem>>({});
  const [logs, setLogs] = useState<string[]>(["System initialized. Use 'Fetch from DB' to see cache-aside logic."]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [dbLoading, setDbLoading] = useState<string | null>(null);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  }, []);

  const applyLRU = useCallback((currentCache: Record<string, CacheItem>, newKey: string) => {
    const next = { ...currentCache };
    const keys = Object.keys(next);
    
    if (keys.length >= MAX_CACHE_SIZE && !next[newKey]) {
      const sortedKeys = keys.toSorted((a, b) => next[a].lastAccessed - next[b].lastAccessed);
      const oldestKey = sortedKeys[0];
      const message = `Evicted ${oldestKey} (LRU policy applied)`;
      setLogs(prev => [message, ...prev].slice(0, 5));
      delete next[oldestKey];
    }
    return next;
  }, []);

  const setCacheItem = useCallback((key: string, value: string) => {
    setCache(prev => {
      const next = applyLRU(prev, key);
      next[key] = {
        key,
        value,
        ttl: DEFAULT_TTL,
        lastAccessed: Date.now(),
        isNew: true
      };
      return next;
    });

    setTimeout(() => {
      setCache(prev => {
        if (!prev[key]) return prev;
        return { ...prev, [key]: { ...prev[key], isNew: false } };
      });
    }, 500);
  }, [applyLRU]);

  const handleFetch = async (key: string, dbValue: string) => {
    if (cache[key]) {
      addLog(`CACHE HIT: Found ${key} in memory (0ms)`);
      setCache(prev => ({
        ...prev,
        [key]: { ...prev[key], lastAccessed: Date.now() }
      }));
      setActiveKey(key);
      setTimeout(() => setActiveKey(null), 1000);
    } else {
      addLog(`CACHE MISS: ${key} not in cache. Fetching from Database...`);
      setDbLoading(key);
      
      await new Promise(resolve => {
        setTimeout(resolve, 1500);
      });
      
      addLog(`Fetched ${key} from DB. Writing to cache (Cache-Aside pattern).`);
      setCacheItem(key, dbValue);
      setDbLoading(null);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCache(prev => {
        const next = { ...prev };
        let expired = false;
        Object.keys(next).forEach(k => {
          if (next[k].ttl <= 1) {
            delete next[k];
            expired = true;
          } else {
            next[k].ttl -= 1;
          }
        });
        if (expired) {
          const msg = "Items expired based on TTL (Time-To-Live).";
          setLogs(p => [msg, ...p].slice(0, 5));
        }
        return expired ? { ...next } : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="animate-in flex flex-col gap-6 tool-container">
      <div className="flex items-end justify-between tool-header">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Redis Cache Lab</h2>
          <p className="text-sm text-text-sub mt-1">Experiment with high-speed memory, eviction, and TTL.</p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setCache({})}
            className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-surface border border-border rounded-xl cursor-pointer"
          >
            FLUSHALL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-210px)]">
        <div className="lg:col-span-8 flex flex-col gap-6 p-10 bg-surface-raised/30 rounded-3xl border border-border border-dashed relative overflow-hidden tool-panel">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-accent-red animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-text">Memory Clusters (Max 8)</span>
             </div>
             <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">LRU Policy Active</span>
          </div>

          <div className="flex-1 grid grid-cols-4 gap-4">
             {Object.keys(new Array(MAX_CACHE_SIZE).fill(0)).map((_, i) => {
               const itemKey = Object.keys(cache)[i];
               const item = itemKey ? cache[itemKey] : null;
               const isActive = itemKey === activeKey;
               
               let borderClass = 'border-border/50 border-dashed opacity-40';
               if (item) borderClass = 'border-primary';
               if (item?.isNew) borderClass = 'animate-bounce border-accent-green';

               return (
                 <div 
                   key={`slot-${i}`} 
                   className={`rounded-2xl border-2 transition-all duration-300 flex flex-col p-4 relative overflow-hidden bg-surface shadow-card
                     ${borderClass}
                     ${isActive ? 'ring-4 ring-primary/20 scale-105 shadow-lg' : ''}
                   `}
                 >
                   {item ? (
                     <>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-primary truncate max-w-[80px]">{item.key}</span>
                          <span className="text-[9px] font-black text-accent-amber">{item.ttl}s</span>
                        </div>
                        <div className="text-[9px] font-medium text-text-dim break-all leading-relaxed line-clamp-2">
                          {item.value}
                        </div>
                        <div className="mt-auto pt-2 flex items-center justify-between">
                           <div className="h-1 flex-1 bg-surface-raised rounded-full overflow-hidden mr-3">
                              <div 
                                className="h-full bg-primary transition-all duration-1000" 
                                style={{ width: `${(item.ttl / 30) * 100}%` }}
                              />
                           </div>
                           <span className="material-symbols-outlined text-[14px] text-text-dim">memory</span>
                        </div>
                     </>
                   ) : (
                     <div className="h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-text-dim text-[24px] opacity-20">add</span>
                     </div>
                   )}
                 </div>
               );
             })}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-surface rounded-2xl border border-border shadow-card p-5 flex flex-col gap-4">
             <h3 className="text-xs font-black uppercase tracking-widest text-text-dim">Source Database</h3>
             <div className="space-y-2">
               {DB_ITEMS.map((dbItem) => {
                 const isLoading = dbLoading === dbItem.key;
                 let bgClass = 'bg-surface hover:bg-surface-raised hover:shadow-card hover:border-primary/30';
                 if (isLoading) bgClass = 'bg-primary/5 border-primary animate-pulse';
                 
                 let iconClass = 'bg-surface-raised text-text-dim group-hover:text-primary';
                 if (isLoading) iconClass = 'bg-primary text-white';

                 return (
                   <button
                     key={dbItem.key}
                     type="button"
                     onClick={() => handleFetch(dbItem.key, dbItem.value)}
                     disabled={!!dbLoading}
                     className={`w-full p-4 rounded-xl border border-border text-left transition-smooth flex items-center justify-between group cursor-pointer ${bgClass}`}
                   >
                     <div>
                       <p className="text-[11px] font-black text-text mb-0.5">{dbItem.key}</p>
                       <p className="text-[9px] font-bold text-text-dim uppercase tracking-tighter">Slow Storage</p>
                     </div>
                     <div className={`size-8 rounded-lg flex items-center justify-center transition-smooth ${iconClass}`}>
                        <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>
                          {isLoading ? 'sync' : 'database'}
                        </span>
                     </div>
                   </button>
                 );
               })}
             </div>
          </section>

          <section className="bg-surface rounded-2xl border border-border shadow-card flex-1 flex flex-col overflow-hidden">
             <div className="px-5 py-3 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-text-dim">Protocol Logs</h3>
                <span className="px-1.5 py-0.5 rounded bg-accent-blue/10 text-accent-blue text-[8px] font-black uppercase">LIVE</span>
             </div>
             <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {logs.map((log, i) => (
                  <div key={`log-${logs.length - i}`} className="flex gap-3 animate-in">
                     <span className="text-[9px] font-black text-text-dim pt-0.5 select-none">{logs.length - i}</span>
                     <p className={`text-[11px] font-medium leading-relaxed ${log.includes('HIT') ? 'text-accent-green' : (log.includes('MISS') ? 'text-accent-amber' : 'text-text-sub')}`}>
                        {log}
                     </p>
                  </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
