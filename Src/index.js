/**
 * @module ORMN
 * @description Punto de entrada de la libreria ORMN.
 *              Expone el namespace ORMN como API publica global para Google Apps Script.
 */

import { openDb } from "./core/Ormn";
global.ORMN = { openDb };
