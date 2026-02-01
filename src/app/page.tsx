'use client';

import { useState, useRef } from 'react';
import AgentAvatar from '@/components/AgentAvatar';
import ActiveAgentsList from '@/components/ActiveAgentsList';
import LiveLogTerminal, { LogEntry } from '@/components/LiveLogTerminal';
import TaskBoard, { Task } from '@/components/TaskBoard';
import { motion } from 'framer-motion';
import { Send, Command } from 'lucide-react';

export default function Dashboard() {
  const [input, setInput] = useState('');
  const [agentStatus, setAgentStatus] = useState<'IDLE' | 'THINKING' | 'WORKING' | 'SUCCESS'>('IDLE');
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '10:00:01', sender: 'System', message: 'OpenClaw Manager initialized.', type: 'success' },
    { id: '2', timestamp: '10:00:02', sender: 'System', message: 'Neural link established.', type: 'info' }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: 'T-1001', title: 'Analyze ServiceNow API documentation', status: 'OPEN', priority: 'LOW' },
    { id: 'T-1002', title: 'Scaffold Next.js Dashboard', status: 'IN_PROGRESS', priority: 'HIGH' },
    { id: 'T-1003', title: 'Initialize OpenClaw Neural Link', status: 'DONE', priority: 'LOW' }
  ]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user command to logs
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      sender: 'Commander',
      message: input,
      type: 'info'
    };

    setLogs(prev => [...prev, newLog]);
    setInput('');

    // Simulate Agent Response
    setAgentStatus('THINKING');
    setTimeout(() => {
      setAgentStatus('WORKING');
      setLogs(prev => [...prev, {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        sender: 'System',
        message: 'Processing command...',
        type: 'warning'
      }]);

      setTimeout(() => {
        setAgentStatus('SUCCESS');
        setLogs(prev => [...prev, {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          sender: 'Architect',
          message: 'Task executed successfully.',
          type: 'success'
        }]);

        setTimeout(() => setAgentStatus('IDLE'), 2000);
      }, 2000);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-black/90 text-foreground flex flex-col p-6 gap-6 relative overflow-x-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-neon-green/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-neon-green shadow-[0_0_10px_#00ff41]" />
          <h1 className="text-2xl font-bold tracking-tighter uppercase font-mono glow-text">
            OpenClaw <span className="text-neon-green">Manager</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-neon-green/70">
          <span>v1.0.0</span>
          <span>SECURE_CONN_ESTABLISHED</span>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Avatar & Status */}
        <div className="lg:col-span-3 flex flex-col items-center justify-start py-10 gap-8">
          <AgentAvatar status={agentStatus} size={200} />

          <div className="w-full space-y-2 p-4 rounded-lg border border-neon-green/10 bg-black/40 backdrop-blur-sm">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">CPU Usage</span>
              <span className="text-neon-green">34%</span>
            </div>
            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neon-green"
                initial={{ width: "30%" }}
                animate={{ width: ["30%", "45%", "34%"] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-400">Memory</span>
              <span className="text-neon-blue">12GB / 64GB</span>
            </div>
            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
              <div className="h-full bg-neon-blue w-[20%]" />
            </div>
          </div>
        </div>

        {/* Center Column: Input & Terminal */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Input Bar */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500" />
            <form onSubmit={handleCommand} className="relative flex items-center gap-3 bg-black p-4 rounded-lg border border-neon-green/30">
              <Command className="text-neon-green animate-pulse" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What is your command, Commander?"
                className="flex-1 bg-transparent border-none outline-none text-lg font-mono text-neon-green placeholder:text-gray-600 focus:ring-0"
                autoFocus
              />
              <button
                type="submit"
                className="p-2 rounded-md bg-neon-green/10 hover:bg-neon-green/20 text-neon-green transition-colors"
              >
                <Send size={20} />
              </button>
            </form>
          </div>

          {/* Live Log Terminal */}
          <LiveLogTerminal logs={logs} className="flex-1 min-h-[400px]" />
        </div>

        {/* Right Column: Active Agents */}
        <div className="lg:col-span-3">
          <ActiveAgentsList />
        </div>
      </div>

      {/* Mission Objectives Section */}
      <section className="relative z-10 mt-6 md:mt-0">
        <div className="mb-4 flex items-center gap-2 border-b border-neon-green/30 pb-2">
          <div className="h-2 w-2 bg-neon-green"></div>
          <h2 className="font-mono text-lg font-bold tracking-[0.2em] text-neon-green">MISSION OBJECTIVES</h2>
        </div>
        <TaskBoard tasks={tasks} />
      </section>
    </main>
  );
}
