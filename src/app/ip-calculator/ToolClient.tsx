"use client";

import { useState, useCallback, useEffect } from "react";

interface IpResult {
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  wildcardMask: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  cidr: number;
  binaryMask: string;
}

function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number.parseInt(octet, 10), 0) >>> 0;
}

function longToIp(long: number): string {
  return [(long >>> 24) & 255, (long >>> 16) & 255, (long >>> 8) & 255, long & 255].join('.');
}

function getMask(cidr: number): number {
  return cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
}

export default function IpCalculatorPage() {
  const [ip, setIp] = useState("192.168.1.1");
  const [cidr, setCidr] = useState(24);
  const [result, setResult] = useState<IpResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(() => {
    try {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(ip)) throw new Error("Invalid IP address format");
      
      const octets = ip.split('.').map(o => Number.parseInt(o, 10));
      if (octets.some(o => o > 255)) throw new Error("Octets must be 0-255");
      if (cidr < 0 || cidr > 32) throw new Error("CIDR must be 0-32");

      const ipLong = ipToLong(ip);
      const maskLong = getMask(cidr);
      const wildcardLong = ~maskLong >>> 0;
      const networkLong = (ipLong & maskLong) >>> 0;
      const broadcastLong = (networkLong | wildcardLong) >>> 0;

      const totalHosts = Math.pow(2, 32 - cidr);
      let usableHosts = totalHosts - 2;
      if (cidr === 31) usableHosts = 2;
      else if (cidr === 32) usableHosts = 1;

      const firstHostLong = cidr <= 30 ? networkLong + 1 : networkLong;
      const lastHostLong = cidr <= 30 ? broadcastLong - 1 : broadcastLong;

      setResult({
        networkAddress: longToIp(networkLong),
        broadcastAddress: longToIp(broadcastLong),
        subnetMask: longToIp(maskLong),
        wildcardMask: longToIp(wildcardLong),
        firstHost: longToIp(firstHostLong),
        lastHost: longToIp(lastHostLong),
        totalHosts,
        usableHosts,
        cidr,
        binaryMask: maskLong.toString(2).padStart(32, '0').match(/.{8}/g)?.join('.') || ""
      });
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    }
  }, [ip, cidr]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">IP / CIDR Calculator</h2>
          <p className="text-sm text-text-sub mt-1">Setup networks and calculate subnet masks with precision.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface rounded-xl border border-border shadow-card p-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-dim">Network Config</h3>
            
            <div className="space-y-2">
              <label htmlFor="ip-address" className="text-[11px] font-bold text-text-sub uppercase">IP Address</label>
              <input 
                id="ip-address"
                type="text" 
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full px-4 py-3 bg-surface-raised border border-border rounded-xl text-[14px] font-code focus:outline-none focus:border-primary transition-smooth"
                placeholder="e.g. 192.168.1.1"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-text-sub uppercase">CIDR (/{cidr})</label>
                <span className="text-[11px] font-code text-primary">{result?.subnetMask}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="32" 
                value={cidr}
                onChange={(e) => setCidr(Number.parseInt(e.target.value, 10))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-bold text-text-dim px-1">
                <span>/0</span>
                <span>/8</span>
                <span>/16</span>
                <span>/24</span>
                <span>/32</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-accent-red/5 border border-accent-red/10 rounded-lg flex gap-3">
                <span className="material-symbols-outlined text-accent-red text-[18px] shrink-0">error</span>
                <p className="text-[11px] font-medium text-accent-red leading-normal">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-primary/5 rounded-xl border border-primary/10 p-5">
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Pro Tip</h4>
            <p className="text-[12px] text-primary/70 leading-relaxed font-medium">
              CIDR notation is a compact way to represent an IP address and its associated routing prefix.
            </p>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8">
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { label: "Network Address", value: result.networkAddress, icon: "lan" },
                 { label: "Broadcast Address", value: result.broadcastAddress, icon: "podcasts" },
                 { label: "Subnet Mask", value: result.subnetMask, icon: "grid_on" },
                 { label: "Wildcard Mask", value: result.wildcardMask, icon: "border_inner" },
                 { label: "First Host", value: result.firstHost, icon: "start" },
                 { label: "Last Host", value: result.lastHost, icon: "last_page" },
               ].map((item) => (
                 <div key={item.label} className="bg-surface p-5 rounded-xl border border-border shadow-card flex items-center gap-4 group hover:border-primary/20 transition-smooth">
                   <div className="size-10 rounded-lg bg-surface-raised flex items-center justify-center text-text-dim group-hover:text-primary transition-smooth">
                     <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-text-dim uppercase tracking-tighter">{item.label}</p>
                     <p className="text-[15px] font-code font-bold text-text tracking-tight">{item.value}</p>
                   </div>
                 </div>
               ))}

               <div className="md:col-span-2 bg-surface p-6 rounded-xl border border-border shadow-card space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-text-dim">Host Information</h3>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-text-dim uppercase">Total Hosts</p>
                        <p className="text-[14px] font-bold text-text">{result.totalHosts.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-primary uppercase">Usable Hosts</p>
                        <p className="text-[14px] font-bold text-primary">{result.usableHosts.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-text-dim uppercase">Binary Subnet Mask</p>
                    <div className="p-3 bg-surface-raised rounded-lg text-[13px] font-code text-text-sub tracking-widest break-all">
                      {result.binaryMask}
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
