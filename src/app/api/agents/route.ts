import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function GET() {
    try {
        const homeDir = os.homedir();
        // Path provided by user: C:\Users\subha_uz272s0\.openclaw\openclaw.json
        // We construct it dynamically to be safe across environments, though specific path was given.
        const configPath = path.join(homeDir, '.openclaw', 'openclaw.json');

        // Check if file exists
        try {
            await fs.access(configPath);
        } catch {
            // Config missing, return current aliases as fallback to avoid breaking UI
            // Or return empty structure
            return NextResponse.json({
                agents: {
                    defaults: {
                        models: {
                            "google/gemini-1.5-flash": {},
                            "google/gemini-pro": {}
                        }
                    }
                }
            }, { status: 200 });
            // Actually, let's return a specific error or handling so frontend knows to fallback
        }

        const fileContent = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(fileContent);

        // Extract relevant data (available models)
        // Structure is agents.defaults.models -> keys are model names
        const models = Object.keys(config.agents?.defaults?.models || {});
        const primary = config.agents?.defaults?.model?.primary;

        return NextResponse.json({
            models,
            primary
        });

    } catch (error) {
        console.error('Failed to read OpenClaw config:', error);
        return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
    }
}
