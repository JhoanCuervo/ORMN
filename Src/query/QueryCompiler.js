/**
 * @module query/QueryCompiler
 * @description Compila una expresión de consulta de {} → row en una función evaluable.
 */

const compileQuery = (expression) => {
    const jsExpression = expression.replace(/\{\}/g, 'row');
    return new Function('row', `return ${jsExpression};`);
};

export default compileQuery;
