function test_metadata() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  console.log("Headers:", Bills._headers);
  console.log("Total filas:", Bills._count());
  console.log("Ultima fila:", Bills._lastRow());
}

function test_all() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  const todos = Bills._all();
  console.log("Cantidad:", todos.data.length);
  console.log("Primera:", todos.data[0]);
}

function test_find() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  const id = "c8c8a084-7f70-4f6f-a378-7c833f105ca4";
  console.log("Buscando ID:", id);
  console.log("Resultado:", Bills._find(id));
}

function test_firstBy() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  console.log("_firstBy:", Bills._firstBy("Method", "QR"));
}

function test_firstBy_caseInsensitive() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  console.log("_firstBy CI:", Bills._firstBy("method", "qr", { caseInsensitive: true }));
}

function test_findManyBy() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  const multi = Bills._findManyBy("Status", "income");
  console.log("Cantidad:", multi.data.length);
  console.log("Dos primeras:", multi.data.slice(0, 2));
}

function test_exist() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  console.log("Existe income:", Bills._exist("Status", "income"));
  console.log("Existe NOEXISTE:", Bills._exist("Status", "NOEXISTE"));
}

function test_firstByQuery() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  console.log(Bills._firstByQuery(`{}.Store === "Nomina" && {}.Value > 1000`));
}

function test_findManyByQuery() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  const multi = Bills._findManyByQuery(`{}.Method !== "QR"`);
  console.log("Cantidad:", multi.data.length);
}

function test_create() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  const nuevo = Bills._create({
    id: Utilities.getUuid(),
    Date: new Date(),
    Hour: new Date(),
    Store: "Test Store",
    Value: 1234,
    Method: "Test",
    Status: "income",
    Category: 0,
    Concept: "Creado desde test"
  });
  console.log("Creado:", nuevo);
}

function test_save() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  const nuevo = Bills._create({
    id: Utilities.getUuid(),
    Date: new Date(),
    Hour: new Date(),
    Store: "Antes de guardar",
    Value: 1,
    Method: "Test",
    Status: "income",
    Category: 0,
    Concept: ""
  });
  nuevo.Store = "Editado con _save";
  nuevo.Value = 9999;
  nuevo._save();
  console.log("Guardado:", Bills._find(nuevo.id));
}

function test_delete() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  const nuevo = Bills._create({
    id: Utilities.getUuid(),
    Date: new Date(),
    Hour: new Date(),
    Store: "Para borrar",
    Value: 1,
    Method: "Test",
    Status: "outcome",
    Category: 0,
    Concept: ""
  });
  nuevo._delete();
  console.log("Borrado:", Bills._find(nuevo.id));
}

function test_createMany() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  const varios = Bills._createMany([
    { id: Utilities.getUuid(), Date: new Date(), Hour: new Date(), Store: "Lote A", Value: 100, Method: "Test", Status: "income", Category: 0, Concept: "" },
    { id: Utilities.getUuid(), Date: new Date(), Hour: new Date(), Store: "Lote B", Value: 200, Method: "Test", Status: "income", Category: 0, Concept: "" },
  ]);
  console.log("Creados:", varios.data.length);
  console.log("IDs:", varios.data.map(r => r.id));
}

function test_deleteMany() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  const antes = Bills._findManyBy("Method", "Test");
  console.log("Antes de borrar:", antes.data.length);
  antes._delete();
  const despues = Bills._findManyBy("Method", "Test");
  console.log("Despues de borrar:", despues.data.length);
}

function test_deleteManyByQuery() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  const antes = Bills._findManyByQuery(`{}.Store.includes("Lote")`);
  console.log("Antes:", antes.data.length);
  if (antes.data.length > 0) {
    antes._delete();
    console.log("Borrados por query.");
  }
}

function test_deleteAll() {
  const db = ORMN.openDb("1ATktBwD62U8Dylb6osE2WsJs7JFy3klJK6rvoV9H1vo");
  const { Bills } = db._getTables();
  console.log("CUIDADO: esto borra TODAS las filas de Bills.");
  console.log("Filas antes:", Bills._count());
  // Bills._deleteAll();
  // console.log("Filas despues:", Bills._count());
}
