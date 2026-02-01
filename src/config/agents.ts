export interface AgentConfig {
    name: string;
    model: string;
    specialty: string;
    icon?: string; // Optional icon override
}

export const AGENTS: Record<string, AgentConfig> = {
    "architect": {
        name: "Architect",
        model: "claude-3-5-sonnet",
        specialty: "Coding & System Design"
    },
    "researcher": {
        name: "Scout",
        model: "gemini-flash",
        specialty: "Search & Analysis"
    },
    "manager": {
        name: "Boss",
        model: "gpt-4o",
        specialty: "Planning & Coordination"
    }
};
