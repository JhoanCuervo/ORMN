/**
 * @module logging/Logger
 * @description Sistema de logging estructurado con niveles de severidad y contexto opcional.
 */

class Logger {
    static get levels() {
        return {
            DEBUG: "DEBUG",
            INFO: "INFO",
            WARN: "WARN",
            ERROR: "ERROR"
        };
    }

    static formatMessage(level, message, context = null) {
        const timestamp = new Date().toISOString();
        const ctxStr = context ? ` [${JSON.stringify(context)}]` : '';
        return `[${timestamp}] [${level}]${ctxStr} ${message}`;
    }

    static debug(message, data = null, context = null) {
        const log = this.formatMessage(this.levels.DEBUG, message, context);
        console.log(log);
        if (data !== null) console.log(data);
    }

    static info(message, data = null, context = null) {
        const log = this.formatMessage(this.levels.INFO, message, context);
        console.log(log);
        if (data !== null) console.log(data);
    }

    static warn(message, data = null, context = null) {
        const log = this.formatMessage(this.levels.WARN, message, context);
        console.log(log);
        if (data !== null) console.log(data);
    }

    static error(message, data = null, context = null) {
        const log = this.formatMessage(this.levels.ERROR, message, context);
        console.log(log);
        if (data !== null) console.log(data);
    }
}

export default Logger;
