import { NextResponse } from 'next/server';

// OpenClaw Gateway configuration
const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '902fc284de45fc9cced21c65a6b6feaa621f6e8732c86813';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, task } = body;

        if (!id || !task) {
            return NextResponse.json({ error: 'Missing id or task' }, { status: 400 });
        }

        console.log(`[API] Received trigger for Task ${id}: ${task}`);

        // Persist the task initially as OPEN so polling picks it up
        const fs = require('fs');
        const path = require('path');
        const tasksPath = path.join(process.cwd(), 'src/data/tasks.json');
        if (fs.existsSync(tasksPath)) {
            const fileContent = fs.readFileSync(tasksPath, 'utf8');
            const tasksArr = JSON.parse(fileContent);
            const newTask = {
                id,
                title: task,
                status: 'OPEN',
                priority: 'LOW',
                timestamp: new Date().toISOString()
            };
            tasksArr.push(newTask);
            fs.writeFileSync(tasksPath, JSON.stringify(tasksArr, null, 2));
        }

        // Use OpenClaw's HTTP API instead of exec
        // Fire and forget - don't await the response since it can take a while
        triggerOpenClawAgent(id, task).catch(err => {
            console.error(`[OpenClaw] Error triggering agent:`, err);
        });

        return NextResponse.json({ success: true, message: 'Agent triggered successfully' });

    } catch (error) {
        console.error('[API] Error processing request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

async function triggerOpenClawAgent(taskId: string, task: string) {
    const message = `TASK_ID: ${taskId}. INSTRUCTION: ${task}. IMPORTANT: When finished, update the task status to COMPLETED.`;

    console.log(`[OpenClaw] Sending request to Gateway...`);

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
            stream: false
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenClaw API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`[OpenClaw] Response received:`, JSON.stringify(result, null, 2).substring(0, 500));

    // Extract output text (assuming OpenAI-compatible format from OpenClaw Gateway)
    // Adjust this path if the OpenClaw Gateway response structure differs
    const outputText = result.choices?.[0]?.message?.content || JSON.stringify(result, null, 2);

    // Update task status to COMPLETED after agent finishes
    const fs = require('fs');
    const path = require('path');
    const tasksPath = path.join(process.cwd(), 'src/data/tasks.json');

    if (fs.existsSync(tasksPath)) {
        const fileContent = fs.readFileSync(tasksPath, 'utf8');
        const tasksArr = JSON.parse(fileContent);
        const taskIndex = tasksArr.findIndex((t: { id: string }) => t.id === taskId);
        if (taskIndex !== -1) {
            tasksArr[taskIndex].status = 'DONE';
            tasksArr[taskIndex].completedAt = new Date().toISOString();
            tasksArr[taskIndex].output = outputText; // Save the output
            fs.writeFileSync(tasksPath, JSON.stringify(tasksArr, null, 2));
            console.log(`[OpenClaw] Task ${taskId} marked as DONE with output saved.`);
        }
    }

    return result;
}
