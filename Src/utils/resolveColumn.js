/**
 * @module utils/resolveColumn
 * @description Busca una columna en los headers sin importar mayúsculas/minúsculas.
 */

const resolveColumn = (headers, columnName) => {
    return headers.find(h => h.toLowerCase() === columnName.toLowerCase());
};

export default resolveColumn;
