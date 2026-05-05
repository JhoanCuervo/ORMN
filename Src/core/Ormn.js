/**
 * @module core/Ormn
 * @description API pública del ORM. Expone openDb(ssId, options) para abrir
 *              un Google Spreadsheet como base de datos.
 *
 *              Uso:
 *                const db = openDb("1ABC123...", { enableDelete: false });
 *                const { Finanzas } = db._getTables();
 *                const data = Finanzas._all();
 *
 *              Dependencias: core/TableRegistry, config/resolveOptions.
 */

import { openTables } from './TableRegistry.js';
import resolveOptions from '../config/resolveOptions.js';

const attachSpreadsheetMeta = (spreadsheet) => {
    spreadsheet._name = spreadsheet.getName();
    spreadsheet._id = spreadsheet.getId();
    spreadsheet._url = spreadsheet.getUrl();
};

const openDb = (ssId, userOptions = {}) => {
    const spreadsheet = SpreadsheetApp.openById(ssId);
    const options = resolveOptions(userOptions);

    if (options.includeSpreadsheetMeta) attachSpreadsheetMeta(spreadsheet);

    spreadsheet._getTables = () => openTables(spreadsheet, options);
    return spreadsheet;
};

export { openDb };
