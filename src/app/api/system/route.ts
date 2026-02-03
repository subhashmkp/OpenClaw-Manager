import { NextResponse } from 'next/server';
import os from 'os';

function getCpuUsage() {
    const cpus = os.cpus();
    return cpus.map(cpu => {
        const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
        return { idle: cpu.times.idle, total };
    });
}

export async function GET() {
    try {
        // Measure initial CPU times
        const startCpus = getCpuUsage();

        // Wait for 200ms to calculate difference
        await new Promise(resolve => setTimeout(resolve, 200));

        // Measure final CPU times
        const endCpus = getCpuUsage();

        // Calculate usage per core and average it
        let totalPercentage = 0;
        for (let i = 0; i < startCpus.length; i++) {
            const start = startCpus[i];
            const end = endCpus[i];

            const idleDiff = end.idle - start.idle;
            const totalDiff = end.total - start.total;

            if (totalDiff > 0) {
                const percentage = 100 - (100 * idleDiff / totalDiff);
                totalPercentage += percentage;
            }
        }

        const avgCpu = Math.round(totalPercentage / startCpus.length);

        // Memory logic
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memPercentage = Math.round((usedMem / totalMem) * 100);

        return NextResponse.json({
            cpu: avgCpu,
            memory: {
                used: usedMem,
                total: totalMem,
                percentage: memPercentage
            }
        });
    } catch (error) {
        console.error('[API] Error getting system stats:', error);
        return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
    }
}
