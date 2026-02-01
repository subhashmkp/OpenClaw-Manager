'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Layers, Activity, CheckCircle, AlertCircle } from 'lucide-react';

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'HIGH' | 'LOW';

export interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    timestamp?: string; // Optional for compatibility
}

interface TaskBoardProps {
    tasks: Task[];
}

export default function TaskBoard({ tasks }: TaskBoardProps) {
    const columns = [
        { id: 'OPEN', label: 'PENDING', icon: Layers, color: 'text-gray-400' },
        { id: 'IN_PROGRESS', label: 'EXECUTING', icon: Activity, color: 'text-neon-blue' },
        { id: 'DONE', label: 'COMPLETED', icon: CheckCircle, color: 'text-neon-green' }
    ] as const;

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col) => {
                const colTasks = tasks.filter(t => t.status === col.id);
                const Icon = col.icon;

                return (
                    <div key={col.id} className="flex flex-col gap-4">
                        {/* Column Header */}
                        <div className={`flex items-center gap-2 border-b border-gray-800 pb-2 ${col.color}`}>
                            <Icon size={16} />
                            <h3 className="font-mono text-sm font-bold tracking-widest uppercase">
                                &gt; STATUS: {col.label}
                            </h3>
                            <span className="ml-auto text-xs opacity-50">[{colTasks.length}]</span>
                        </div>

                        {/* Task List */}
                        <div className="flex flex-col gap-3 min-h-[150px]">
                            {colTasks.length === 0 && (
                                <div className="h-full flex items-center justify-center border border-dashed border-gray-800 rounded-lg p-4 text-xs text-gray-700 font-mono">
                                    NO_DATA_STREAM
                                </div>
                            )}

                            {colTasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{
                                        scale: 1.02,
                                        x: [0, -2, 2, 0], // Glitch effect on hover
                                        transition: { duration: 0.2 }
                                    }}
                                    className={clsx(
                                        "relative group p-4 rounded-lg border bg-black/40 backdrop-blur-md transition-all cursor-pointer",
                                        "border-neon-green/30 hover:border-neon-green hover:shadow-[0_0_15px_rgba(0,255,65,0.1)]",
                                        task.priority === 'HIGH' && "shadow-[0_0_10px_rgba(255,0,0,0.1)] border-l-4 border-l-red-500"
                                    )}
                                >
                                    {/* Priority Pulse */}
                                    {task.priority === 'HIGH' && (
                                        <span className="absolute top-2 right-2 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                    )}

                                    <h4 className="font-bold text-gray-200 text-sm group-hover:text-neon-green transition-colors">
                                        {task.title}
                                    </h4>

                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-[10px] font-mono uppercase text-gray-500 bg-gray-900/50 px-2 py-0.5 rounded">
                                            ID: {task.id.slice(0, 4)}
                                        </span>
                                        {task.priority === 'HIGH' && (
                                            <div className="flex items-center gap-1 text-[10px] text-red-400 font-bold uppercase tracking-wider">
                                                <AlertCircle size={10} /> CRITICAL
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
