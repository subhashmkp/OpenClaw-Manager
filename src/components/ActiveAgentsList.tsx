'use client';

import { AGENTS } from '@/config/agents';
import { Bot, Cpu, Search } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function ActiveAgentsList() {
    const getIcon = (key: string) => {
        switch (key) {
            case 'architect': return <Cpu size={20} className="text-neon-blue" />;
            case 'researcher': return <Search size={20} className="text-yellow-400" />;
            case 'manager': return <Bot size={20} className="text-neon-pink" />;
            default: return <Bot size={20} />;
        }
    };

    return (
        <div className="w-full max-w-xs space-y-4 rounded-xl border border-neon-green/20 bg-black/50 p-4 backdrop-blur-md">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-gray-800 pb-2 mb-4">
                Active Neural Links
            </h3>

            <div className="space-y-3">
                {Object.entries(AGENTS).map(([key, agent], index) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="group flex items-center gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-neon-green/30 hover:bg-neon-green/5"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 shadow-inner group-hover:shadow-[0_0_10px_rgba(0,255,65,0.2)]">
                            {getIcon(key)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-200 group-hover:text-neon-green transition-colors">
                                    {agent.name}
                                </span>
                                <span className="block h-1.5 w-1.5 rounded-full bg-neon-green shadow-[0_0_5px_#00ff41]" />
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                {agent.model}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>System Status</span>
                    <span className="text-neon-green font-mono">ONLINE</span>
                </div>
            </div>
        </div>
    );
}
