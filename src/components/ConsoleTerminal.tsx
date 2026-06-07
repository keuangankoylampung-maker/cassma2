/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ConsoleLog } from '../types';
import { Terminal, Trash2, ShieldCheck, RefreshCw, Layers } from 'lucide-react';

interface ConsoleTerminalProps {
  logs: ConsoleLog[];
  onClear: () => void;
}

export default function ConsoleTerminal({ logs, onClear }: ConsoleTerminalProps) {
  const [filter, setFilter] = useState<string>('all');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  const getLogColorClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400 font-medium';
      case 'warning':
        return 'text-amber-400';
      case 'error':
        return 'text-rose-500 font-bold';
      default:
        return 'text-slate-200';
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-lg shadow-lg border border-slate-800 overflow-hidden font-mono flex flex-col h-80" id="api-terminal-monitor">
      {/* Terminal Title Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between no-print select-none">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-semibold text-slate-300 font-mono">SIPES API CONSOLE TERMINAL MONITOR</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter badges */}
          <div className="flex bg-slate-950/80 rounded border border-slate-800 text-[10px] p-0.5 font-mono">
            {['all', 'info', 'success', 'warning', 'error'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-2 py-0.5 rounded transition ${
                  filter === t ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          
          <button
            onClick={onClear}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Bersihkan Log"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Logs Viewport */}
      <div className="p-4 overflow-y-auto flex-1 font-mono text-xs leading-relaxed space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 italic flex flex-col items-center justify-center h-full gap-2 py-8">
            <Layers className="h-6 w-6 opacity-30" />
            <span>Terminal kosong. Menunggu sinyal API dari transaksi ...</span>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex gap-2 items-start font-mono text-[11px] leading-relaxed">
              <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
              <span className="shrink-0 select-none">
                {log.type === 'success' && '🟢 [OK]'}
                {log.type === 'info' && '🔵 [INFO]'}
                {log.type === 'warning' && '🟡 [WARN]'}
                {log.type === 'error' && '🔴 [ERROR]'}
              </span>
              <span className={getLogColorClass(log.type)}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Footer Info */}
      <div className="bg-slate-900 border-t border-slate-850 px-4 py-1.5 text-[9px] text-slate-500 flex justify-between font-mono select-none">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-emerald-500" /> API Gateway Secure Connection (TLS 1.3)
        </span>
        <span className="flex items-center gap-1">
          <RefreshCw className="h-2.5 w-2.5 text-blue-400 animate-spin-slow" /> Listening Port: 3000
        </span>
      </div>
    </div>
  );
}
