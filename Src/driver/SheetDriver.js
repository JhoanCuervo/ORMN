/**
 * @module driver/SheetDriver
 * @description Capa de abstracción sobre la API nativa de Google Sheets (SpreadsheetApp).
 *              Solo operaciones de I/O raw: leer, insertar, actualizar, eliminar.
 *
 *              Se instancia via factory createSheetDriver(spreadsheet, options).
 */

import Logger from '../logging/Logger.js';
import CONSTANTS from '../config/constants.js';
import { rowToObject, objectToRow } from '../transformer/RowMapper.js';
import wrapResults from './ResultWrapper.js';

const createSheetDriver = (spreadsheet, options) => {

    // ===================================================================
    // HELPERS PRIVADOS
    // ===================================================================

    const getSheet = (sheetName) => {
        const sheet = spreadsheet.getSheetByName(sheetName);
        if (!sheet) throw new Error(`Sheet "${sheetName}" no encontrada`);
        return sheet;
    };

    // ===================================================================
    // LECTURA (CORE)
    // ===================================================================

    const readAll = (sheetName) => {
        const sheet = getSheet(sheetName);
        const range = sheet.getDataRange().getValues();

        if (range.length <= CONSTANTS.DATA_START_ROW_INDEX) {
            const headers = range.length > CONSTANTS.HEADERS_ROW_INDEX ? range[CONSTANTS.HEADERS_ROW_INDEX] : [];
            return { headers, rows: [] };
        }

        const headers = range[CONSTANTS.HEADERS_ROW_INDEX];
        const rows = [];
        const { includeRowIndex, enableDelete, enableSave } = options;

        for (let i = CONSTANTS.DATA_START_ROW_INDEX; i < range.length; i++) {
            const obj = rowToObject(headers, range[i]);

            if (includeRowIndex) obj._rowIndex = i;
            if (enableDelete) obj._delete = () => deleteRow(sheetName, i);
            if (enableSave) obj._save = () => updateRow(sheetName, i, objectToRow(headers, obj));

            rows.push(obj);
        }

        return { headers, rows };
    };

    const readAllWrapped = (sheetName) => {
        const result = readAll(sheetName);
        return { headers: result.headers, data: result.rows };
    };

    const deleteAll = (sheetName) => {
        const { rows } = readAll(sheetName);
        if (rows.length === 0) return;
        const indices = rows.map(r => r._rowIndex).filter(i => i != null);
        indices.sort((a, b) => b - a);
        const sheet = getSheet(sheetName);
        for (const rowIndex of indices) {
            sheet.deleteRow(rowIndex + 1);
        }
        Logger.info(`Eliminadas todas las filas de "${sheetName}": ${indices.length}`);
    };

    // ===================================================================
    // ESCRITURA
    // ===================================================================

    const deleteRow = (sheetName, rowIndex) => {
        const sheet = getSheet(sheetName);
        sheet.deleteRow(rowIndex + 1);
    };

    const updateRow = (sheetName, rowIndex, data) => {
        const sheet = getSheet(sheetName);
        const range = sheet.getRange(rowIndex + 1, 1, 1, data.length);
        range.setValues([data]);
    };

    const insertRow = (sheetName, data) => {
        const sheet = getSheet(sheetName);
        sheet.appendRow(data);
        return sheet.getLastRow() - 1;
    };

    const createRows = (sheetName, data) => {
        let { headers } = readAll(sheetName);

        if (headers.length === 0) {
            headers = Object.keys(data);
            spreadsheet.getSheetByName(sheetName).getRange(1, 1, 1, headers.length).setValues([headers]);
            Logger.info(`Headers creados en "${sheetName}": ${headers.join(", ")}`);
        }

        const row = objectToRow(headers, data);
        const rowIndex = insertRow(sheetName, row);
        const obj = { ...data };
        if (options.includeRowIndex) obj._rowIndex = rowIndex;
        if (options.enableDelete) obj._delete = () => deleteRow(sheetName, rowIndex);
        if (options.enableSave) obj._save = () => updateRow(sheetName, rowIndex, objectToRow(headers, obj));

        return obj;
    };

    const createManyRows = (sheetName, dataArray) => {
        let { headers } = readAll(sheetName);

        if (headers.length === 0) {
            headers = Object.keys(dataArray[0] || {});
            spreadsheet.getSheetByName(sheetName).getRange(1, 1, 1, headers.length).setValues([headers]);
            Logger.info(`Headers creados en "${sheetName}": ${headers.join(", ")}`);
        }

        const rows = [];
        for (const data of dataArray) {
            const row = objectToRow(headers, data);
            const rowIndex = insertRow(sheetName, row);
            const obj = { ...data };
            if (options.includeRowIndex) obj._rowIndex = rowIndex;
            if (options.enableDelete) obj._delete = () => deleteRow(sheetName, rowIndex);
            if (options.enableSave) obj._save = () => updateRow(sheetName, rowIndex, objectToRow(headers, obj));
            rows.push(obj);
        }

        return wrapResults(rows, sheetName, getSheet, options);
    };

    // ===================================================================
    // API PÚBLICA DEL DRIVER
    // ===================================================================

    return {
        readAll,
        readAllWrapped,
        deleteAll,
        deleteRow,
        updateRow,
        insertRow,
        createRows,
        createManyRows,
    };
};

export { createSheetDriver };
