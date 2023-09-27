// Logger configuration
export interface Logger {
    active?: boolean;
    level?: "error" | "warning" | "info" | "debug" | "dev";
    name?: string;
}
