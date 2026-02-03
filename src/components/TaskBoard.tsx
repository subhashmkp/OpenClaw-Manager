'use client';

import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Layers, Activity, CheckCircle, AlertCircle, X, Terminal } from 'lucide-react';
import { useState } from 'react';

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'HIGH' | 'LOW';

export interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    timestamp?: string; // Optional for compatibility
    output?: string;
}

interface TaskBoardProps {
    tasks: Task[];
    onDeleteTask: (id: string) => void;
}

export default function TaskBoard({ tasks, onDeleteTask }: TaskBoardProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const columns = [
        { id: 'OPEN', label: 'PENDING', icon: Layers, color: 'text-gray-400' },
        { id: 'IN_PROGRESS', label: 'EXECUTING', icon: Activity, color: 'text-neon-blue' },
        { id: 'DONE', label: 'COMPLETED', icon: CheckCircle, color: 'text-neon-green' }
    ] as const;

    return (
        <>
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
                                        onClick={() => setSelectedTask(task)}
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


                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteTask(task.id);
                                            }}
                                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors z-10"
                                        >
                                            <X size={14} />
                                        </button>

                                        <h4 className="font-bold text-gray-200 text-sm group-hover:text-neon-green transition-colors pr-6">
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

            {/* Task Output Modal */}
            <AnimatePresence>
                {selectedTask && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setSelectedTask(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-2xl bg-black border border-neon-green/50 rounded-lg shadow-[0_0_30px_rgba(0,255,65,0.2)] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-neon-green/30 px-6 py-4 bg-neon-green/5">
                                <div className="flex items-center gap-3">
                                    <Terminal className="text-neon-green" size={20} />
                                    <h2 className="font-mono text-lg font-bold text-neon-green uppercase tracking-wider">
                                        Mission Log: {selectedTask.id.slice(0, 6)}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Objective</h3>
                                    <p className="text-gray-200">{selectedTask.title}</p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            Agent Output
                                        </h3>
                                        <span className={clsx(
                                            "text-xs px-2 py-0.5 rounded font-mono uppercase",
                                            selectedTask.status === 'DONE' ? 'bg-neon-green/20 text-neon-green' :
                                                selectedTask.status === 'IN_PROGRESS' ? 'bg-neon-blue/20 text-neon-blue' : 'bg-gray-800 text-gray-400'
                                        )}>
                                            {selectedTask.status}
                                        </span>
                                    </div>
                                    <div className="w-full h-64 bg-gray-950 rounded-md border border-gray-800 p-4 overflow-y-auto font-mono text-sm text-gray-300 scrollbar-thin scrollbar-thumb-gray-700">
                                        {selectedTask.output ? (
                                            <pre className="whitespace-pre-wrap font-mono">{selectedTask.output}</pre>
                                        ) : (
                                            <span className="text-gray-600 italic">
                                                {selectedTask.status === 'DONE' ? "No output data recorded." : "Awaiting agent transmission..."}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
