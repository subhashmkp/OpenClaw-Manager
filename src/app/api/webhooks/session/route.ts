import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, role, content } = body;

        if (!sessionId || !role || !content) {
            return NextResponse.json({ error: 'Missing required fields: sessionId, role, content' }, { status: 400 });
        }

        const tasksPath = path.join(process.cwd(), 'src/data/tasks.json');

        // Ensure data directory exists
        if (!fs.existsSync(tasksPath)) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const fileContent = fs.readFileSync(tasksPath, 'utf8');
        const tasks = JSON.parse(fileContent);

        // Check if task exists for this session
        const existingTaskIndex = tasks.findIndex((t: any) => t.id === sessionId);

        if (role === 'user') {
            if (existingTaskIndex === -1) {
                // New Session -> Create New Task
                const newTask = {
                    id: sessionId,
                    title: content, // Use first message as title
                    status: 'IN_PROGRESS', // Assume if user is talking, it's active
                    priority: 'LOW',
                    timestamp: new Date().toISOString(),
                    source: 'External' // Optional, for debugging
                };
                tasks.push(newTask);
                console.log(`[Webhook] Created new task for session ${sessionId}`);
            } else {
                // Existing Session -> Ignore or Append?
                // User request: "If there are multiple conversation in new session, consider that as a one task."
                // We will keep the original title (first output).
                console.log(`[Webhook] Received additional user message for session ${sessionId}. Ignoring for task title.`);
            }
        } else if (role === 'assistant') {
            if (existingTaskIndex !== -1) {
                // Agent responding -> Mark as DONE and save output
                // If there are multiple agent messages, this might overwrite previous ones.
                // For now, we assume the final "complete" message or just the latest one is what we want.
                // Or we could append. Let's append if output exists to capture full chain.

                const currentOutput = tasks[existingTaskIndex].output || '';
                const newOutput = currentOutput ? `${currentOutput}\n\n---\n\n${content}` : content;

                tasks[existingTaskIndex].output = newOutput;
                tasks[existingTaskIndex].status = 'DONE';
                tasks[existingTaskIndex].completedAt = new Date().toISOString();
                console.log(`[Webhook] Updated task ${sessionId} with agent output.`);
            } else {
                console.warn(`[Webhook] Received assistant message for unknown session ${sessionId}`);
                // Optional: Create a task if we missed the user message? 
                // Better to act safe and not create ghost tasks without titles.
            }
        }

        fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Webhook] Error processing request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
