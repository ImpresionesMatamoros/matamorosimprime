const searchForm = document.querySelector("#buscar");
const searchInput = document.querySelector("#buscar-producto");
const catalog = document.querySelector("#productos");
const catalogStatus = document.querySelector("#catalog-status");
const cards = [...document.querySelectorAll(".mx-product")];
const filters = [...document.querySelectorAll("[data-filter]")];

let category = "todos";

function searchable(text) {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function updateCatalog() {
  const query = searchable(searchInput.value.trim()).split(/\s+/);
  const count = cards.reduce((matches, card) => {
    const matchesCategory =
      category === "todos" || category === card.dataset.group;
    const matchesSearch = query.every((word) =>
      searchable(card.textContent).includes(word),
    );
    card.hidden = !matchesCategory || !matchesSearch;
    return matches + Number(!card.hidden);
  }, 0);

  for (const filter of filters) {
    filter.setAttribute(
      "aria-pressed",
      String(filter.dataset.filter === category),
    );
  }

  catalogStatus.textContent =
    count === 0
      ? "No encontramos productos. Prueba con otra búsqueda o selecciona Todos."
      : count === cards.length
        ? ""
        : count +
          (count === 1 ? " producto encontrado." : " productos encontrados.");
}

function openCatalog() {
  catalog.scrollIntoView();
  catalog.focus({ preventScroll: true });
}

catalog.setAttribute("tabindex", "-1");
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  category = "todos";
  updateCatalog();
  openCatalog();
});
searchInput.addEventListener("input", () => {
  if (searchInput.value === "") updateCatalog();
});

for (const filter of filters) {
  filter.addEventListener("click", () => {
    category = filter.dataset.filter;
    searchInput.value = "";
    updateCatalog();
  });
}

for (const link of document.querySelectorAll('a[href="#productos"]')) {
  link.addEventListener("click", () => {
    category = link.dataset.category ?? "todos";
    searchInput.value = "";
    updateCatalog();
  });
}

const product = document.querySelector("#product");
const form = document.querySelector("#quote");
const message = document.querySelector("#message");
const result = document.querySelector("#result");
const quoteStatus = document.querySelector("#status");

function clearRequest() {
  result.hidden = true;
  quoteStatus.textContent = "";
}

form.addEventListener("input", clearRequest);
for (const link of document.querySelectorAll("[data-product]")) {
  link.addEventListener("click", () => {
    product.value = link.dataset.product;
    clearRequest();
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const quantity = document.querySelector("#quantity").value;
  const details = document.querySelector("#details").value.trim();
  const lines = [
    "Hola, Matamoros Imprime. Quisiera pedir una cotización.",
    "Producto: " + product.value,
    "Cantidad: " + quantity,
  ];
  if (details) lines.push("Detalles: " + details);
  message.value = lines.join("\n");
  result.hidden = false;
  quoteStatus.textContent = "Solicitud lista para copiar.";
  message.focus();
});

document.querySelector("#copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(message.value);
    quoteStatus.textContent = "Solicitud copiada.";
  } catch {
    message.focus();
    message.select();
    quoteStatus.textContent = "El texto está seleccionado para que lo copies.";
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-catalog-all]")) return;
  category = "todos";
  searchInput.value = "";
  updateCatalog();
});

const requestedProduct = new URLSearchParams(location.search)
  .get("producto")
  ?.trim()
  .replace(/\s+/g, " ");
if (requestedProduct && requestedProduct.length <= 100) {
  const existing = [...product.options].find(
    (option) => searchable(option.value) === searchable(requestedProduct),
  );
  if (existing) {
    product.value = existing.value;
  } else {
    product.add(new Option(requestedProduct, requestedProduct, false, true));
  }
  if (location.hash === "#cotizar") {
    window.addEventListener(
      "load",
      () => document.querySelector("#cotizar").scrollIntoView(),
      { once: true },
    );
  }
}
