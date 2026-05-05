/**
 * @module query/operators
 * @description Registry de operadores de consulta (preparación para QueryBuilder futuro).
 */

const operators = {};

export const registerOperator = (name, fn) => {
    operators[name] = fn;
};

export const getOperator = (name) => operators[name];

export default operators;
