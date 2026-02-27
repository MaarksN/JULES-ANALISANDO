const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const levels = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40
};

const shouldLog = (level) => levels[level] >= (levels[LOG_LEVEL] || levels.info);

const write = (level, message, context = {}) => {
    if (!shouldLog(level)) return;

    const entry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...context
    };

    const payload = JSON.stringify(entry);
    if (level === 'error') {
        console.error(payload);
        return;
    }

    if (level === 'warn') {
        console.warn(payload);
        return;
    }

    console.log(payload);
};

export const logger = {
    debug: (message, context) => write('debug', message, context),
    info: (message, context) => write('info', message, context),
    warn: (message, context) => write('warn', message, context),
    error: (message, context) => write('error', message, context)
};
