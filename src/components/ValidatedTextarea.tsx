"use client";

import { useEffect, useRef, useState } from "react";
import { ValidationError } from "@/utils/validation";

interface Props {
  readonly value: string;
  readonly onChange: (val: string) => void;
  readonly placeholder?: string;
  readonly error: ValidationError | null;
  readonly className?: string;
  readonly onPaste?: (e: React.ClipboardEvent) => void;
}

export function ValidatedTextarea({ 
  value, 
  onChange, 
  placeholder, 
  error, 
  className = "", 
  onPaste 
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ top: 0, left: 0 });

  // Sync scroll
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    setScroll({
      top: e.currentTarget.scrollTop,
      left: e.currentTarget.scrollLeft
    });
  };

  useEffect(() => {
    if (mirrorRef.current) {
      mirrorRef.current.scrollTop = scroll.top;
      mirrorRef.current.scrollLeft = scroll.left;
    }
  }, [scroll]);

  // To highlight the exact character, we need to split the text into chunks
  // 1. All text before error line
  // 2. All text on error line before error column
  // 3. The error character (the one with underline)
  // 4. Everything else
  const lines = value.split("\n");
  const errorLineIdx = error ? Math.min(error.line - 1, lines.length - 1) : -1;
  const errorColIdx = error ? Math.min(error.column - 1, lines[errorLineIdx]?.length || 0) : -1;

  return (
    <div className={`relative w-full h-full overflow-hidden font-code text-[13px] ${className}`}>
      {/* Mirror Layer (Background) */}
      <div 
        ref={mirrorRef}
        aria-hidden="true"
        className="absolute inset-0 p-5 whitespace-pre-wrap break-all pointer-events-none select-none text-transparent leading-relaxed"
      >
        {lines.map((line, lIdx) => (
          <div key={lIdx} className="relative min-h-[1.5em]">
            {lIdx === errorLineIdx ? (
              <>
                {line.substring(0, errorColIdx)}
                <span className="relative group/err inline-block">
                  <span className="text-transparent border-b-2 border-dashed border-accent-red animate-pulse">
                    {line[errorColIdx] || ' '}
                  </span>
                  {/* Tooltip on hover of the underline */}
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover/err:block z-[100] bg-accent-red text-white text-[10px] p-2 rounded shadow-lg whitespace-nowrap pointer-events-auto">
                    {error?.message}
                    <div className="absolute top-full left-2 border-4 border-transparent border-t-accent-red" />
                  </div>
                </span>
                {line.substring(errorColIdx + 1)}
              </>
            ) : line}
            <br />
          </div>
        ))}
      </div>

      {/* Actual Input Layer */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onPaste={onPaste}
        placeholder={placeholder}
        className="relative z-10 w-full h-full p-5 bg-transparent text-text resize-none focus:outline-none leading-relaxed whitespace-pre-wrap break-all caret-primary"
        spellCheck={false}
      />
    </div>
  );
}
