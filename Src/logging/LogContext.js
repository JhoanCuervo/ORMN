/**
 * @module logging/LogContext
 * @description Contexto de log para trazabilidad (spreadsheetId, tableName, operation).
 */

class LogContext {
    constructor({ spreadsheetId = null, tableName = null, operation = null } = {}) {
        this.spreadsheetId = spreadsheetId;
        this.tableName = tableName;
        this.operation = operation;
    }

    set(key, value) {
        this[key] = value;
        return this;
    }

    toJSON() {
        return {
            spreadsheetId: this.spreadsheetId,
            tableName: this.tableName,
            operation: this.operation,
        };
    }
}

export default LogContext;
