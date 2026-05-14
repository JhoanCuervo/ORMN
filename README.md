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

## Extensión para VS Code

Instalá [ORMN Snippets](https://marketplace.visualstudio.com/items?itemName=JhoanNicolasCuervoLozada.ormn-snippets) desde el marketplace de VS Code para autocompletar todos los métodos de ORMN con snippets.

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-ORMN%20Snippets-blue?logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=JhoanNicolasCuervoLozada.ormn-snippets)

Repositorio: [github.com/JhoanCuervo/vscode-ormn](https://github.com/JhoanCuervo/vscode-ormn)

---

## Primeros pasos

```js
function miFuncion() {
  const db = ORMN.openDb("ID_DE_TU_SPREADSHEET");

  const { Usuarios } = db._getTables();

  const todos = Usuarios._all();
  console.log(todos.data);  // [{ id: 1, nombre: "Nico", email: "nico@mail.com", ... }, ...]
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
| `tabla._incrementId()` | `number` | Siguiente ID disponible (cantidad de filas + 1) |
| `tabla._uuid()` | `string` | Genera un UUID (vía `Utilities.getUuid()`) |

```js
const { Usuarios } = db._getTables();

console.log(Usuarios._headers);      // ["id", "nombre", "email", "edad", "activo"]
console.log(Usuarios._count());      // 150
console.log(Usuarios._lastRow());    // { id: 150, nombre: "Ultimo", ... }
console.log(Usuarios._incrementId());// 151
console.log(Usuarios._uuid());       // "a1b2c3d4-..."
```

---

### Leer

| Método | Retorna | Descripción |
|--------|---------|-------------|
| `tabla._all()` | `{ data: [...] }` | Todos los registros |

```js
const todos = Usuarios._all();
todos.data.forEach(u => console.log(u.nombre));
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
const user = Usuarios._find(42);

// Primera coincidencia
const primero = Usuarios._firstBy("nombre", "Nico");

// Búsqueda sin importar mayúsculas/minúsculas
const ci = Usuarios._firstBy("nombre", "nico", { caseInsensitive: true });

// Todas las coincidencias
const activos = Usuarios._findManyBy("activo", true);
console.log(activos.data.length);

// Verificar existencia
if (Usuarios._exist("email", "nico@mail.com")) {
  console.log("El usuario ya existe");
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
Usuarios._firstByQuery(`{}.edad > 30`);

// Igualdad
Usuarios._findManyByQuery(`{}.activo === true`);

// AND y OR
Usuarios._findManyByQuery(`{}.edad >= 18 && {}.activo === true`);

// Negación
Usuarios._findManyByQuery(`{}.email !== ""`);

// Métodos de string
Usuarios._findManyByQuery(`{}.nombre.includes("Nic")`);
Usuarios._findManyByQuery(`{}.email.endsWith("@gmail.com")`);

// Comparar con fechas
var fecha = new Date("2025-01-01");
Usuarios._findManyByQuery(`{}.creado > new Date("${fecha.toISOString()}")`);
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
const nuevo = Usuarios._create({
  id: Usuarios._uuid(),
  nombre: "Nico",
  email: "nico@mail.com",
  edad: 28,
  activo: true
});
console.log(nuevo._rowIndex);  // posición de la fila en el sheet

// Varias filas a la vez
const lote = Usuarios._createMany([
  { id: Usuarios._uuid(), nombre: "Ana", email: "ana@mail.com", edad: 32, activo: true },
  { id: Usuarios._uuid(), nombre: "Luis", email: "luis@mail.com", edad: 25, activo: false },
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
const user = Usuarios._find(42);
user.nombre = "Nicolas";
user.edad = 29;
user._save();
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
const user = Usuarios._find(42);
user._delete();

// Masivo — eliminar todo lo que coincida con la búsqueda
const inactivos = Usuarios._findManyBy("activo", false);
inactivos._delete();

// Deshacer un createMany
const lote = Usuarios._createMany([...]);
lote._delete();

// Toda la tabla (¡CUIDADO!)
Usuarios._deleteAll();
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
| `_incrementId()` | `number` | Siguiente ID disponible |
| `_uuid()` | `string` | Genera un UUID |
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
