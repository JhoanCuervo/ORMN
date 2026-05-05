/**
 * @module config/resolveOptions
 * @description Combina defaults + opciones del usuario en un objeto final validado.
 */

import defaults from './defaults.js';

const resolveOptions = (userOptions = {}) => {
    return { ...defaults, ...userOptions };
};

export default resolveOptions;
