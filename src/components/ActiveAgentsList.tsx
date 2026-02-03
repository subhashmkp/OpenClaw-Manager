import { useState, useEffect } from 'react';
import { Bot, Cpu, Search } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface AgentConfig {
    name: string;
    model: string;
    specialty: string;
}

export default function ActiveAgentsList() {
    const [agents, setAgents] = useState<Record<string, AgentConfig>>({
        "architect": { name: "Architect", model: "Initializing...", specialty: "Coding & System Design" },
        "researcher": { name: "Scout", model: "Initializing...", specialty: "Search & Analysis" },
        "manager": { name: "Boss", model: "Initializing...", specialty: "Planning & Coordination" }
    });
    const [loading, setLoading] = useState(true);

    const getIcon = (key: string) => {
        switch (key) {
            case 'architect': return <Cpu size={20} className="text-neon-blue" />;
            case 'researcher': return <Search size={20} className="text-yellow-400" />;
            case 'manager': return <Bot size={20} className="text-neon-pink" />;
            default: return <Bot size={20} />;
        }
    };

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/agents');
                if (res.ok) {
                    const data = await res.json();
                    const models = data.models || [];
                    const primary = data.primary || (models.length > 0 ? models[0] : "Unknown");

                    // Logic to assign models to agents based on discovery
                    // We try to use available models. 
                    // Boss gets Primary.
                    // Others get what's available or fallback to Primary.
                    // Assuming we have at least one model.

                    // Simple distribution strategy for now:
                    const model1 = models.find((m: string) => m.includes('2.0')) || primary; // Give Architect the best/newest model
                    const model2 = models.find((m: string) => m.includes('flash') && m !== model1) || primary; // Scout gets fast model

                    setAgents({
                        "architect": {
                            name: "Architect",
                            model: model1,
                            specialty: "Coding & System Design"
                        },
                        "researcher": {
                            name: "Scout",
                            model: model2,
                            specialty: "Search & Analysis"
                        },
                        "manager": {
                            name: "Boss",
                            model: primary,
                            specialty: "Planning & Coordination"
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to fetch agent config", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return (
        <div className="w-full max-w-xs space-y-4 rounded-xl border border-neon-green/20 bg-black/50 p-4 backdrop-blur-md">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-gray-800 pb-2 mb-4">
                Active Neural Links
            </h3>

            <div className="space-y-3">
                {Object.entries(agents).map(([key, agent], index) => (
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
                                <span className={clsx(
                                    "block h-1.5 w-1.5 rounded-full shadow-[0_0_5px_#00ff41]",
                                    loading ? "bg-yellow-500 animate-pulse" : "bg-neon-green"
                                )} />
                            </div>
                            <div className="text-xs text-gray-500 truncate" title={agent.model}>
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
