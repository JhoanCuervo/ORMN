/**
 * @module core/TableRegistry
 * @description Descubre todas las pestañas del spreadsheet, les inyecta métodos
 *              de consulta y retorna un mapa { nombrePestana → sheet }.
 */

import { createSheetDriver } from '../driver/SheetDriver.js';
import { createQueryMethods } from '../driver/QueryMethods.js';
import { injectMethods } from './TableInjector.js';

const openTables = (spreadsheet, options) => {
    const driver = createSheetDriver(spreadsheet, options);
    const queryMethods = createQueryMethods(driver, options);
    const sheets = spreadsheet.getSheets();
    const tables = {};

    for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];
        const sheetName = sheet.getName();

        if (options.includeSheetMeta) {
            sheet._name = sheet.getName();
            sheet._index = sheet.getIndex();
            sheet._sheetId = sheet.getSheetId();
        }

        injectMethods(sheet, sheetName, driver, queryMethods, options);
        tables[sheetName] = { ...sheet };
    }

    return tables;
};

export { openTables };
