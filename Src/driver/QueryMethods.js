/**
 * @module driver/QueryMethods
 * @description Métodos de búsqueda y consulta sobre un spreadsheet.
 *              Depende de SheetDriver para lectura raw.
 */

import resolveColumn from '../utils/resolveColumn.js';
import compileQuery from '../query/QueryCompiler.js';
import wrapResults from './ResultWrapper.js';
import CONSTANTS from '../config/constants.js';

const createQueryMethods = (driver, options) => {

    const matchValue = (a, b, caseInsensitive = false) => {
        const sa = String(a);
        const sb = String(b);
        return caseInsensitive ? sa.toLowerCase() === sb.toLowerCase() : sa === sb;
    };

    const count = (sheetName) => {
        const { rows } = driver.readAll(sheetName);
        return rows.length;
    };

    const findById = (sheetName, id) => {
        const { headers, rows } = driver.readAll(sheetName);
        const idKey = resolveColumn(headers, CONSTANTS.ID_COLUMN);
        if (!idKey) return null;
        return rows.find(r => matchValue(r[idKey], id)) || null;
    };

    const findFirstBy = (sheetName, columnName, value, opts = {}) => {
        const { headers, rows } = driver.readAll(sheetName);
        const key = resolveColumn(headers, columnName);
        if (!key) return null;
        return rows.find(r => matchValue(r[key], value, opts.caseInsensitive)) || null;
    };

    const findManyBy = (sheetName, columnName, value, opts = {}) => {
        const { headers, rows } = driver.readAll(sheetName);
        const key = resolveColumn(headers, columnName);
        if (!key) return wrapResults([], sheetName, driver.getSheet, options);
        return wrapResults(rows.filter(r => matchValue(r[key], value, opts.caseInsensitive)), sheetName, driver.getSheet, options);
    };

    const queryFirst = (sheetName, expression) => {
        const { rows } = driver.readAll(sheetName);
        const fn = compileQuery(expression);
        return rows.find(fn) || null;
    };

    const queryMany = (sheetName, expression) => {
        const { rows } = driver.readAll(sheetName);
        const fn = compileQuery(expression);
        return wrapResults(rows.filter(fn), sheetName, driver.getSheet, options);
    };

    const existRow = (sheetName, columnName, value, opts = {}) => !!findFirstBy(sheetName, columnName, value, opts);

    const lastRow = (sheetName) => {
        const { rows } = driver.readAll(sheetName);
        return rows[rows.length - 1]
    }

    return {
        count,
        findById,
        findFirstBy,
        findManyBy,
        queryFirst,
        queryMany,
        existRow,
        lastRow
    };
};

export { createQueryMethods };
