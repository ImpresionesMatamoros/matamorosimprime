const navigationScript = new URL(document.currentScript.src);
const siteRoot = new URL(".", navigationScript);
const menuUrl = new URL("catalogo/menu-matamoros.js", siteRoot);
menuUrl.search = navigationScript.search;

import(menuUrl)
  .then(({ default: menu }) => installNavigation(menu))
  .catch((error) => console.error("El menú completo no está disponible.", error));

function installNavigation(groups) {
  const navigation = document.querySelector("#menu-principal");


  function menuLink(label, href, className, hint) {
    const link = document.createElement("a");
    link.href = new URL(href, siteRoot).href;
    link.className = className;
    link.textContent = label;
    if (hint) {
      const description = document.createElement("span");
      description.className = "mx-menu-hint";
      description.textContent = hint;
      link.append(description);
    }
    return link;
  }

  const row = document.createElement("div");
  row.className = "container-site mx-menu-row";
  const catalogHome = menuLink("Catálogo", "#productos", "mx-menu-root");
  catalogHome.dataset.catalogAll = "";
  row.append(catalogHome);

  for (const group of groups) {
    const disclosure = document.createElement("details");
    disclosure.className = "mx-menu-item";
    const summary = document.createElement("summary");
    summary.textContent = group.label;
    const panel = document.createElement("div");
    panel.className = "mx-menu-panel";
    const panelGrid = document.createElement("div");
    panelGrid.className = "container-site mx-menu-columns";
    for (const column of group.columns) {
      const section = document.createElement("div");
      const heading = document.createElement("p");
      heading.className = "mx-menu-heading";
      heading.textContent = column.label;
      const items = document.createElement("ul");
      for (const entry of column.entries) {
        const item = document.createElement("li");
        item.append(
          menuLink(entry.label, entry.href, "mx-menu-link", entry.hint),
        );
        items.append(item);
      }
      section.append(heading, items);
      panelGrid.append(section);
    }
    panelGrid.append(
      menuLink(
        "Ver sección de " + group.label.toLowerCase(),
        "categorias/" + group.id + "/",
        "mx-menu-section-link",
      ),
    );
    panel.append(panelGrid);
    disclosure.append(summary, panel);
    row.append(disclosure);
  }

  navigation.classList.add("mx-mega");
  navigation.replaceChildren(row);

  const disclosures = [...navigation.querySelectorAll("details")];
  const desktop = matchMedia("(min-width: 1000px) and (hover: hover)");
  let closeTimer;
  let active = null;
  let openedByHover = false;

  function setOpen(disclosure, hover = false) {
    clearTimeout(closeTimer);
    for (const item of disclosures) item.open = item === disclosure;
    active = disclosure;
    openedByHover = hover;
  }

  for (const disclosure of disclosures) {
    const summary = disclosure.querySelector("summary");
    summary.addEventListener("click", (event) => {
      event.preventDefault();
      setOpen(disclosure.open && !openedByHover ? null : disclosure);
    });
    disclosure.addEventListener("pointerenter", (event) => {
      if (
        desktop.matches &&
        event.pointerType === "mouse" &&
        active !== disclosure
      )
        setOpen(disclosure, true);
    });
    disclosure.addEventListener("pointerleave", (event) => {
      if (desktop.matches && event.pointerType === "mouse") {
        closeTimer = setTimeout(() => {
          if (
            active === disclosure &&
            !disclosure.contains(document.activeElement)
          )
            setOpen(null);
        }, 160);
      }
    });
  }

  navigation.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && active) {
      const summary = active.querySelector("summary");
      setOpen(null);
      summary.focus();
    }
  });
  navigation.addEventListener("focusout", (event) => {
    if (!navigation.contains(event.relatedTarget)) setOpen(null);
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(null);
  });
  document.addEventListener("pointerdown", (event) => {
    if (!navigation.contains(event.target)) setOpen(null);
  });
}
