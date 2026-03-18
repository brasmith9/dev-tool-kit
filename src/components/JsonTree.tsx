"use client";

import { useState } from "react";

interface JsonTreeProps {
  readonly data: any;
  readonly label?: string;
  readonly isLast?: boolean;
  readonly depth?: number;
}

export function JsonTree({ data, label, isLast = true, depth = 0 }: JsonTreeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels

  const type = typeof data;
  const isObject = data !== null && type === "object";
  const isArray = Array.isArray(data);

  const toggle = () => setIsExpanded(!isExpanded);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  const renderValue = () => {
    if (data === null) return <span className="text-accent-red font-bold">null</span>;
    if (type === "string") return <span className="text-accent-green">"{data}"</span>;
    if (type === "number") return <span className="text-accent-amber">{data}</span>;
    if (type === "boolean") return <span className="text-accent-purple font-bold">{data ? "true" : "false"}</span>;
    return null;
  };

  if (!isObject) {
    return (
      <div className="flex items-start gap-2 py-0.5 px-1 hover:bg-primary-light/10 rounded transition-smooth group">
        {label && <span className="text-text font-bold opacity-80">{label}:</span>}
        <span className="font-code text-[12px] break-all">{renderValue()}</span>
        {!isLast && <span className="text-text-dim">,</span>}
      </div>
    );
  }

  const keys = isArray ? data : Object.keys(data);
  const isEmpty = keys.length === 0;

  return (
    <div className="flex flex-col select-none">
      <button 
        onClick={toggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        className="flex items-center gap-1.5 py-0.5 px-1 hover:bg-primary-light/20 rounded transition-smooth cursor-pointer group outline-none focus-visible:bg-primary-light/30 border-none bg-transparent w-full text-left font-inherit select-none"
      >
        <span 
          className={`material-symbols-outlined text-[16px] text-text-dim transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
        >
          chevron_right
        </span>
        {label && <span className="text-text font-bold opacity-80">{label}:</span>}
        <span className="text-text-dim font-code text-[12px]">
          {isArray ? "[" : "{"}
          {!isExpanded && !isEmpty && <span className="mx-1 opacity-50 text-[10px]">...</span>}
          {isEmpty && (isArray ? "]" : "}")}
        </span>
        {!isExpanded && !isEmpty && (
          <span className="text-[10px] bg-surface-raised border border-border px-1.5 py-0.5 rounded text-text-dim group-hover:text-primary transition-smooth">
            {keys.length} items
          </span>
        )}
        {!isExpanded && !isLast && <span className="text-text-dim">,</span>}
      </button>

      {isExpanded && !isEmpty && (
        <div className="ml-4 pl-3 border-l border-border hover:border-primary/30 transition-smooth">
          {isArray ? (
            data.map((item, i) => (
              <JsonTree 
                key={`${depth}-item-${i}`} 
                data={item} 
                isLast={i === data.length - 1} 
                depth={depth + 1} 
              />
            ))
          ) : (
            Object.entries(data).map(([key, val], i, arr) => (
              <JsonTree 
                key={`${depth}-${key}`} 
                label={key} 
                data={val} 
                isLast={i === arr.length - 1} 
                depth={depth + 1} 
              />
            ))
          )}
        </div>
      )}

      {isExpanded && !isEmpty && (
        <div className="flex items-center gap-1 py-0.5 px-1">
          <span className="invisible material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-text-dim font-code text-[12px]">
            {isArray ? "]" : "}"}
            {!isLast && <span>,</span>}
          </span>
        </div>
      )}
    </div>
  );
}
