/**
 * @module transformer/RowMapper
 * @description Conversión bidireccional entre arrays de Google Sheets y objetos JavaScript.
 */

const rowToObject = (headers, row) => Object.fromEntries(headers.map((h, i) => [h, row[i]]));

const objectToRow = (headers, obj) => headers.map(h => obj[h] ?? "");

export { rowToObject, objectToRow };
