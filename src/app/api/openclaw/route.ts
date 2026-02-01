import { NextResponse } from 'next/server';

// OpenClaw Gateway configuration
const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '902fc284de45fc9cced21c65a6b6feaa621f6e8732c86813';

export async function GET() {
    try {
        // Check if OpenClaw Gateway is reachable by hitting the health endpoint
        const response = await fetch(`${OPENCLAW_GATEWAY_URL}/health`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
            },
            // Short timeout for health check
            signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
            const data = await response.json().catch(() => ({}));
            return NextResponse.json({
                connected: true,
                gatewayUrl: OPENCLAW_GATEWAY_URL,
                status: 'online',
                details: data
            });
        } else {
            return NextResponse.json({
                connected: false,
                gatewayUrl: OPENCLAW_GATEWAY_URL,
                status: 'error',
                error: `HTTP ${response.status}`
            });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            connected: false,
            gatewayUrl: OPENCLAW_GATEWAY_URL,
            status: 'offline',
            error: errorMessage
        });
    }
}
