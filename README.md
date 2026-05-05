# ORMN

> ORM ligero para Google Apps Script. Usa Google Sheets como base de datos con una API estilo Active Record.

---

## Cómo agregarlo a tu proyecto

1. Abrí tu proyecto de Google Apps Script
2. Andá a **Editor** → **Bibliotecas** (ícono de `+` al lado de Servicios)
3. Pegá este ID:

```
1tmnbycR375XFxCF4KmC4VHSaQVOtb1aRlF0c-o2iTzuhenGyD5Ltd3tG
```

4. Seleccioná la última versión y asignale el identificador **`ORMN`**
5. Todos los métodos quedan disponibles como `ORMN.openDb(...)`

---

## Primeros pasos

```js
function miFuncion() {
  // Abrir tu spreadsheet
  const db = ORMN.openDb("ID_DE_TU_SPREADSHEET");

  // Obtener todas las pestañas como tablas
  const { Finanzas, Clientes } = db._getTables();

  // Leer todos los registros
  const todos = Finanzas._all();
  console.log(todos.data);  // [{ id: "...", Store: "Nomina", ... }, ...]
}
```

---

## API de Métodos

Cada pestaña de tu spreadsheet se convierte en un objeto con métodos prefijados con `_` (para no colisionar con tus columnas).

### Metadata

| Propiedad / Método | Retorna | Descripción |
|-------------------|---------|-------------|
| `tabla._headers` | `string[]` | Nombres de columna (primera fila) |
| `tabla._count()` | `number` | Total de filas de datos |
| `tabla._lastRow()` | `object \| undefined` | Última fila registrada |

```js
const { Bills } = db._getTables();

console.log(Bills._headers);     // ["id", "Date", "Hour", "Store", ...]
console.log(Bills._count());     // 150
console.log(Bills._lastRow());   // { id: "...", Store: "Ultimo", ... }
```

---

### Leer

| Método | Retorna | Descripción |
|--------|---------|-------------|
| `tabla._all()` | `{ data: [...] }` | Todos los registros |

```js
const todos = Bills._all();
todos.data.forEach(row => console.log(row.Store));
```

---

### Buscar por columna

| Método | Retorna | Descripción |
|--------|---------|-------------|
| `tabla._find(id)` | `object \| null` | Buscar por ID (columna `id`, sin importar mayúsculas) |
| `tabla._firstBy(col, val, opciones?)` | `object \| null` | Primera coincidencia por columna y valor |
| `tabla._findManyBy(col, val, opciones?)` | `{ data: [...], _delete() }` | Todas las coincidencias por columna y valor |
| `tabla._exist(col, val, opciones?)` | `boolean` | ¿Existe al menos un registro con ese valor? |

```js
// Buscar por ID
const registro = Bills._find("c8c8a084-7f70-4f6f-a378-7c833f105ca4");

// Primera coincidencia
const primero = Bills._firstBy("Store", "Nomina");

// Búsqueda sin importar mayúsculas/minúsculas
const ci = Bills._firstBy("store", "nomina", { caseInsensitive: true });

// Todas las coincidencias
const resultados = Bills._findManyBy("Status", "income");
console.log(resultados.data.length);

// Verificar existencia
if (Bills._exist("Store", "Nomina")) {
  console.log("Encontrado");
}
```

---

### Buscar por expresión (Query)

Escribí condiciones en JavaScript usando `{}` como placeholder de cada fila.

| Método | Retorna | Descripción |
|--------|---------|-------------|
| `tabla._firstByQuery(expresion)` | `object \| null` | Primera coincidencia |
| `tabla._findManyByQuery(expresion)` | `{ data: [...], _delete() }` | Todas las coincidencias |

```js
// Comparación numérica
Bills._firstByQuery(`{}.Value > 1000000`);

// Igualdad
Bills._findManyByQuery(`{}.Status === "income"`);

// AND y OR
Bills._findManyByQuery(`{}.Store === "Nomina" && {}.Value >= 5000000`);

// Negación
Bills._findManyByQuery(`{}.Method !== "QR"`);

// Métodos de string
Bills._findManyByQuery(`{}.Store.includes("Nomi")`);
Bills._findManyByQuery(`{}.Concept.startsWith("Test")`);

// Comparar con fechas (usando variable externa)
var fecha = new Date("2025-01-01");
Bills._findManyByQuery(`{}.Date > new Date("${fecha.toISOString()}")`);
```

---

### Crear

| Método | Retorna | Descripción |
|--------|---------|-------------|
| `tabla._create(datos)` | `object` | Insertar una fila |
| `tabla._createMany(arreglo)` | `{ data: [...], _delete() }` | Insertar varias filas a la vez |

**Importante:** si la pestaña no tiene headers, `_create` los genera automáticamente usando las keys del objeto.

```js
// Una fila
const nuevo = Bills._create({
  id: Utilities.getUuid(),
  Date: new Date(),
  Store: "Mi Tienda",
  Value: 1500,
  Method: "Tarjeta",
  Status: "income",
  Category: 2,
  Concept: "Venta"
});
console.log(nuevo._rowIndex);  // posición de la fila en el sheet

// Varias filas a la vez
const lote = Bills._createMany([
  { id: Utilities.getUuid(), Date: new Date(), Store: "A", Value: 100, Method: "Efectivo", Status: "income", Category: 0, Concept: "" },
  { id: Utilities.getUuid(), Date: new Date(), Store: "B", Value: 200, Method: "Efectivo", Status: "income", Category: 0, Concept: "" },
]);
console.log(lote.data.length);  // 2
```

---

### Actualizar

| Método | Descripción |
|--------|-------------|
| `fila._save()` | Persiste los cambios de la fila en el sheet |

Modificá las propiedades directamente y llamá `_save()`:

```js
const fila = Bills._find("c8c8a084-7f70-4f6f-a378-7c833f105ca4");
fila.Store = "Tienda Editada";
fila.Value = 8888;
fila._save();
```

---

### Eliminar

| Método | Alcance | Descripción |
|--------|---------|-------------|
| `fila._delete()` | Una fila | Elimina una sola fila |
| `resultado._delete()` | Resultado de búsqueda | Elimina todas las filas de `_findManyBy`, `_findManyByQuery` o `_createMany` |
| `tabla._deleteAll()` | Toda la tabla | Elimina todos los registros (conserva los headers) |

```js
// Individual
const fila = Bills._find("abc-123...");
fila._delete();

// Masivo — eliminar todo lo que coincida con la búsqueda
const busqueda = Bills._findManyBy("Method", "Test");
busqueda._delete();

// Deshacer un createMany
const lote = Bills._createMany([...]);
lote._delete();

// Toda la tabla (¡CUIDADO!)
Bills._deleteAll();
```

---

## Configuración

Pasá opciones como segundo parámetro de `ORMN.openDb`. Por defecto todo está habilitado.

| Opción | Default | Controla |
|--------|---------|----------|
| `includeSpreadsheetMeta` | `true` | `db._name`, `db._id`, `db._url` |
| `includeSheetMeta` | `true` | `tabla._name`, `tabla._index`, `tabla._sheetId` |
| `includeRowIndex` | `true` | `fila._rowIndex` en cada registro |
| `enableDelete` | `true` | `fila._delete()` en registros individuales |
| `enableDeleteMany` | `true` | `_delete()` en resultados de `_findManyBy`, `_findManyByQuery` y `_createMany` |
| `enableDeleteAll` | `true` | `tabla._deleteAll()` |
| `enableSave` | `true` | `fila._save()` en registros individuales |

```js
// Sin eliminación
const db = ORMN.openDb("ID...", {
  enableDelete: false,
  enableDeleteMany: false
});

// Solo lectura
const db = ORMN.openDb("ID...", {
  enableSave: false,
  enableDelete: false
});

// Sin metadatos extra
const db = ORMN.openDb("ID...", {
  includeRowIndex: false,
  includeSheetMeta: false
});
```

---

## Resumen de métodos

| Método | Retorna | Uso |
|--------|---------|-----|
| `_headers` | `string[]` | Nombres de columnas |
| `_count()` | `number` | Total de registros |
| `_lastRow()` | `object \| undefined` | Último registro |
| `_all()` | `{ data: [...] }` | Todos los registros |
| `_find(id)` | `object \| null` | Buscar por ID |
| `_firstBy(col, val, opts?)` | `object \| null` | Primera coincidencia |
| `_findManyBy(col, val, opts?)` | `{ data: [...], _delete() }` | Todas las coincidencias |
| `_firstByQuery(exp)` | `object \| null` | Primera coincidencia por expresión JS |
| `_findManyByQuery(exp)` | `{ data: [...], _delete() }` | Todas por expresión JS |
| `_exist(col, val, opts?)` | `boolean` | ¿Existe? |
| `_create(datos)` | `object` | Insertar uno |
| `_createMany(arreglo)` | `{ data: [...], _delete() }` | Insertar varios |
| `fila._save()` | `void` | Guardar cambios |
| `fila._delete()` | `void` | Eliminar uno |
| `resultado._delete()` | `void` | Eliminar lote |
| `tabla._deleteAll()` | `void` | Vaciar tabla |

---

## Licencia

MIT
