export interface Logger {
    info(message: string, meta?: Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    error(message: string, meta?: Record<string, any>): void;
}

export const consoleLogger: Logger = {
    info: (message: string, meta: Record<string, any> = {}) => {
        console.log(JSON.stringify({ level: 'info', message, ...meta }));
    },
    warn: (message: string, meta: Record<string, any> = {}) => {
        console.warn(JSON.stringify({ level: 'warn', message, ...meta }));
    },
    error: (message: string, meta: Record<string, any> = {}) => {
        console.error(JSON.stringify({ level: 'error', message, ...meta }));
    },
};
