import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// OpenClaw Gateway configuration (copied for safety)
const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '902fc284de45fc9cced21c65a6b6feaa621f6e8732c86813';

// Reusing the trigger logic
async function triggerOpenClawAgent(taskId: string, task: string) {
    let workspacePath = '';
    try {
        const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            workspacePath = config.agents?.defaults?.workspace || '';
        }
    } catch (e) {
        // Ignore config read errors
    }

    const contextMsg = workspacePath ? ` WORKING_DIRECTORY: "${workspacePath}".` : '';
    const message = `TASK_ID: ${taskId}. INSTRUCTION: ${task}.${contextMsg} IMPORTANT: Use the specified working directory for all file operations. When finished, update the task status to COMPLETED.`;

    console.log(`[Process-All] Sending request to Gateway for Task ${taskId}... Context: ${workspacePath}`);

    // Fire and forget mechanism for bulk processing to avoid timeout? 
    // Or await? If we have many tasks, awaiting might timeout the Vercel/Next endpoint (usually 10s-60s).
    // Better to fire and forget here, or await with a timeout. 
    // Since we are running locally, let's just await to ensure order, but catch errors.

    // Inject tools
    let tools = [];
    try {
        const skillPath = path.join(process.cwd(), 'openclaw-skill.json');
        if (fs.existsSync(skillPath)) {
            const skillConfig = JSON.parse(fs.readFileSync(skillPath, 'utf8'));
            tools = skillConfig.tools || [];
        }
    } catch (e) {
        console.error('[Process-All] Failed to load tools:', e);
    }

    try {
        const response = await fetch(`${OPENCLAW_GATEWAY_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
                'Content-Type': 'application/json',
                'x-openclaw-agent-id': 'main'
            },
            body: JSON.stringify({
                model: 'openclaw',
                messages: [{ role: 'user', content: message }],
                tools: tools,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenClaw API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();

        // Extract output text
        const outputText = result.choices?.[0]?.message?.content || JSON.stringify(result, null, 2);

        // Update task status
        const tasksPath = path.join(process.cwd(), 'src/data/tasks.json');
        if (fs.existsSync(tasksPath)) {
            const fileContent = fs.readFileSync(tasksPath, 'utf8');
            const tasksArr = JSON.parse(fileContent);
            const taskIndex = tasksArr.findIndex((t: { id: string }) => t.id === taskId);
            if (taskIndex !== -1) {
                tasksArr[taskIndex].status = 'DONE';
                tasksArr[taskIndex].completedAt = new Date().toISOString();
                tasksArr[taskIndex].output = outputText;
                fs.writeFileSync(tasksPath, JSON.stringify(tasksArr, null, 2));
                console.log(`[Process-All] Task ${taskId} marked as DONE.`);
            }
        }
    } catch (err) {
        console.error(`[Process-All] Failed to process task ${taskId}:`, err);
    }
}

export async function POST() {
    try {
        const tasksPath = path.join(process.cwd(), 'src/data/tasks.json');
        if (!fs.existsSync(tasksPath)) {
            return NextResponse.json({ message: 'No tasks found' });
        }

        const fileContent = fs.readFileSync(tasksPath, 'utf8');
        const tasks = JSON.parse(fileContent);

        // Find OPEN tasks
        const openTasks = tasks.filter((t: any) => t.status === 'OPEN');

        if (openTasks.length === 0) {
            return NextResponse.json({ message: 'No pending tasks to process', count: 0 });
        }

        console.log(`[Process-All] Found ${openTasks.length} pending tasks. Starting execution...`);

        // Process sequentially to avoid overwhelming the single-agent gateway
        let processedCount = 0;
        for (const task of openTasks) {
            // Update status to IN_PROGRESS first
            task.status = 'IN_PROGRESS';
            fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));

            await triggerOpenClawAgent(task.id, task.title);
            processedCount++;

            // Re-read tasks to ensure we have latest state if needed, but here we just updated one.
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${processedCount} tasks`,
            count: processedCount
        });

    } catch (error) {
        console.error('[API] Error processing all tasks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
