'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import clsx from 'clsx';

export interface LogEntry {
    id: string;
    timestamp: string;
    sender: string;
    message: string;
    type: 'info' | 'error' | 'success' | 'warning';
}

interface LiveLogTerminalProps {
    logs: LogEntry[];
    className?: string;
}

export default function LiveLogTerminal({ logs, className }: LiveLogTerminalProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className={clsx("flex flex-col overflow-hidden rounded-lg border border-neon-green/30 bg-black/90 font-mono text-sm", className)}>
            {/* Terminal Header */}
            <div className="flex items-center gap-2 border-b border-neon-green/20 bg-neon-green/5 px-4 py-2 text-neon-green">
                <Terminal size={16} />
                <span className="font-bold tracking-widest uppercase text-xs">Live Log Feed</span>
                <div className="ml-auto flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                </div>
            </div>

            {/* Terminal Body */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-neon-green/20 scrollbar-track-transparent"
                style={{ minHeight: '300px', maxHeight: '500px' }}
            >
                {logs.length === 0 && (
                    <div className="text-gray-500 italic text-center py-10 opacity-50">
                        Awaiting input... System ready.
                    </div>
                )}

                {logs.map((log) => (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3"
                    >
                        <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                        <span className={clsx(
                            "font-bold shrink-0 w-24",
                            log.sender === 'System' ? 'text-neon-blue' : 'text-neon-pink'
                        )}>
                            {log.sender}:
                        </span>
                        <span className={clsx(
                            "break-all",
                            log.type === 'error' && 'text-red-400',
                            log.type === 'success' && 'text-neon-green',
                            log.type === 'warning' && 'text-yellow-400',
                            log.type === 'info' && 'text-gray-300'
                        )}>
                            {log.message}
                        </span>
                    </motion.div>
                ))}
                {/* Blinking Cursor at the end */}
                <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="h-4 w-2 bg-neon-green mt-1"
                />
            </div>
        </div>
    );
}
