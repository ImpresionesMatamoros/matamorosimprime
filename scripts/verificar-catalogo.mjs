import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import menuData from "../catalogo/menu-matamoros.js";
import { verifyStore } from "./validar-contrato.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const menu = menuData.map((group) => ({
  clave: group.id,
  columnas: group.columns.map((column) => ({
    titulo: column.label,
    enlaces: column.entries.map((entry) => ({ texto: entry.label, ruta: entry.href })),
  })),
}));

verifyStore(root, menu, (id, route) => {
  assert.match(route, /^productos\/[a-z0-9-]+\/$/, `Ruta local inválida para ${id}`);
  assert.ok(existsSync(join(root, route, "index.html")), `Falta la ficha de ${id}: ${route}`);
}, (route) => route);
