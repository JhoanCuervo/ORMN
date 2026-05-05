/**
 * @module driver/ResultWrapper
 * @description Envuelve resultados de query con metadata y operaciones bulk (_delete).
 */

import Logger from '../logging/Logger.js';

const wrapResults = (rows, sheetName, getSheet, options) => {
    const wrapper = { data: rows };

    if (options.enableDeleteMany) {
        wrapper._delete = () => {
            const indices = rows.map(r => r._rowIndex).filter(i => i != null);
            if (indices.length === 0) return;
            indices.sort((a, b) => b - a);
            const sheet = getSheet(sheetName);
            for (const rowIndex of indices) {
                sheet.deleteRow(rowIndex + 1);
            }
        };
    }

    return wrapper;
};

export default wrapResults;
