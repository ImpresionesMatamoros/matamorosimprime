import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function sameKeys(object, allowed, context) {
  assert.deepEqual(
    Object.keys(object).sort(),
    [...allowed].sort(),
    `Campos inesperados o faltantes en ${context}`,
  );
}

function uniqueIds(ids, context) {
  assert.ok(ids.every((id) => typeof id === "string" && idPattern.test(id)), `Identificador inválido en ${context}`);
  assert.equal(new Set(ids).size, ids.length, `Identificadores duplicados en ${context}`);
}

export function verifyStore(root, implementation, checkProduct, productRoute) {
  const contractText = readFileSync(join(root, "catalogo", "compartido.json"), "utf8");
  const contract = JSON.parse(contractText);
  const local = JSON.parse(readFileSync(join(root, "catalogo", "local.json"), "utf8"));
  sameKeys(contract, ["version", "productos", "menus"], "contrato compartido");
  assert.equal(contract.version, 1, "Versión de contrato no reconocida");
  uniqueIds(contract.productos, "productos");
  uniqueIds(contract.menus.map((menu) => menu.id), "menús");
  sameKeys(local.catalogo, contract.productos, "equivalencias de productos");
  sameKeys(local.menus, contract.menus.map((menu) => menu.id), "equivalencias de menús");
  for (const id of contract.productos) checkProduct(id, local.catalogo[id]);

  const keys = contract.menus.map(({ id }) => local.menus[id].clave);
  const sharedMenus = implementation.filter((menu) => keys.includes(menu.clave));
  assert.deepEqual(sharedMenus.map((menu) => menu.clave), keys, "Orden de los menús compartidos");

  for (const [index, menu] of contract.menus.entries()) {
    sameKeys(menu, ["id", "columnas"], menu.id);
    const expected = local.menus[menu.id].columnas;
    const current = sharedMenus[index];
    uniqueIds(menu.columnas.map((column) => column.id), menu.id);
    sameKeys(expected, menu.columnas.map((column) => column.id), menu.id);
    assert.equal(current.columnas.length, menu.columnas.length, `Columnas en ${menu.id}`);
    for (const [position, column] of menu.columnas.entries()) {
      sameKeys(column, ["id", "entradas"], column.id);
      const matched = expected[column.id];
      uniqueIds(column.entradas.map((entry) => entry.id), column.id);
      sameKeys(matched.enlaces, column.entradas.map((entry) => entry.id), column.id);
      const expectedLinks = column.entradas.map((entry) => {
        sameKeys(entry, entry.producto ? ["id", "producto"] : ["id"], entry.id);
        if (entry.producto) {
          assert.ok(contract.productos.includes(entry.producto), `Producto desconocido en ${entry.id}`);
          assert.equal(matched.enlaces[entry.id].ruta, productRoute(local.catalogo[entry.producto]), `Destino de producto distinto en ${entry.id}`);
        }
        return matched.enlaces[entry.id];
      });
      assert.deepEqual(current.columnas[position], {
        titulo: matched.titulo, enlaces: expectedLinks,
      }, `Orden, textos o destinos distintos en ${menu.id}/${column.id}`);
    }
  }

  const [flag, peer, ...extra] = process.argv.slice(2);
  if (flag !== undefined) {
    assert.ok(flag === "--par" && peer && extra.length === 0, "Uso: node scripts/verificar-catalogo.mjs [--par <ruta>]");
    const peerText = readFileSync(join(peer, "catalogo", "compartido.json"), "utf8");
    assert.equal(
      contractText.replaceAll("\r\n", "\n"),
      peerText.replaceAll("\r\n", "\n"),
      "Los archivos catalogo/compartido.json difieren. Replica la versión revisada del contrato.",
    );
  }
  const hash = createHash("sha256").update(contractText.replaceAll("\r\n", "\n")).digest("hex");
  console.log(`Catálogo verificado: ${contract.productos.length} productos y ${contract.menus.length} menús. Contrato SHA-256 ${hash}`);
}
