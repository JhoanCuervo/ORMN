/**
 * @module core/TableInjector
 * @description Inyecta métodos de consulta y datos sobre un objeto sheet.
 */

const injectMethods = (sheet, sheetName, driver, queryMethods, options) => {
    const { headers, data } = driver.readAllWrapped(sheetName);

    sheet._headers = headers;
    sheet._count = () => queryMethods.count(sheetName);
    sheet._create = (data) => driver.createRows(sheetName, data);
    sheet._createMany = (data) => driver.createManyRows(sheetName, data);
    sheet._all = () => ({ data });
    sheet._find = (id) => queryMethods.findById(sheetName, id);
    sheet._firstBy = (col, val, opts) => queryMethods.findFirstBy(sheetName, col, val, opts);
    sheet._findManyBy = (col, val, opts) => queryMethods.findManyBy(sheetName, col, val, opts);
    sheet._firstByQuery = (q) => queryMethods.queryFirst(sheetName, q);
    sheet._findManyByQuery = (q) => queryMethods.queryMany(sheetName, q);
    sheet._exist = (col, val, opts) => queryMethods.existRow(sheetName, col, val, opts);
    sheet._lastRow = () => queryMethods.lastRow(sheetName);
    if (options.enableDeleteAll) {
        sheet._deleteAll = () => driver.deleteAll(sheetName);
    }
};

export { injectMethods };
