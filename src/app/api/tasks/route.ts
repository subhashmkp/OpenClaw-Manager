import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const tasksPath = path.join(process.cwd(), 'src/data/tasks.json');

        if (!fs.existsSync(tasksPath)) {
            return NextResponse.json([]);
        }

        const fileContent = fs.readFileSync(tasksPath, 'utf8');
        const tasks = JSON.parse(fileContent);

        return NextResponse.json(tasks.reverse()); // Newest first
    } catch (error) {
        console.error('[API] Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}
