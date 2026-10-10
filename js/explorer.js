// =========================
// EXPLORADOR DE ARCHIVOS
// =========================
// Los datos (carpetas, videos, proyectos, enlaces) viven en js/explorer-data.js.
// Este archivo contiene la lógica: tipos de elemento, navegación (pestañas, historial,
// migas de pan, búsqueda), dibujo de cada carpeta y reproductor de video.
// Los estilos están en css/explorer.css.

document.getElementById('openExplorer')
  .addEventListener('dblclick', openExplorerApp);

document.getElementById('openExplorerStart')
  .addEventListener('click', openExplorerApp);

// false → un clic selecciona y doble clic (o Enter) abre, como en Windows.
// true  → un solo clic abre directamente.
const SINGLE_CLICK_OPENS = false;


// =========================
// TIPOS DE ELEMENTO
// =========================
// Qué icono y qué texto usa cada tipo, y qué pasa al abrirlo.
// Para agregar un tipo nuevo (por ejemplo "image"):
//   1. Añade una entrada aquí con su `label`, su `iconClass` y su función `open`.
//   2. Crea el icono en assets/icon/explorer/ y enlázalo en css/explorer.css (.fx-icon.icon-...).
//   3. Úsalo en explorer-data.js con `type: "image"`.
//
// `open(item, explorer)` recibe el elemento de los datos y el explorador
// (que expone `openFolder(item)`).
const FILE_TYPES = {
  folder: {
    label: "File folder",
    iconClass: "icon-folder",
    open: (item, explorer) => explorer.openFolder(item)
  },
  video: {
    label: "Video file",
    iconClass: "icon-video",
    open: (item) => openVideoApp(item)
  },
  project: {
    label: "Web project",
    iconClass: "icon-project",
    open: (item) => openProject(item)          // js/projects.js: Notepad + navegador
  },
  link: {
    label: "Web link",
    iconClass: "icon-link",
    open: (item) => openExternalLink(item.href)
  }
};

// Iconos propios que se pueden pedir con `icon: "..."` en los datos (ver css/explorer.css).
const CUSTOM_ICONS = ["web", "edit", "anim", "hobbies", "music", "draw", "photo"];

// Menús de la barra superior. `command` se ejecuta con runCommand() dentro de setupExplorer().
// "Favourites" se genera solo a partir de los elementos con `favourite: true`.
const EXPLORER_MENUS = {
  File: [
    { label: "Home", command: "home" },
    { label: "Close", command: "close" }
  ],
  Edit: [
    { label: "Clear search", command: "clear-search" }
  ],
  View: [
    { label: "Refresh", command: "refresh" },
    { label: "Go up one level", command: "up" }
  ],
  Favourites: null,
  Tools: [
    { label: "Collapse / expand side panels", command: "toggle-panels" }
  ],
  Help: [
    { label: "About Explorer", command: "about" }
  ]
};

const EXPLORER_ABOUT_TEXT = `ABOUT EXPLORER
==============

Everything you see in this window is generated from one data file:

    js/explorer-data.js

To add, rename, move or remove folders and files, edit that file only.
Each item has an id, a name and a type (folder, video, project or link).
The instructions and examples are written at the top of the file.

How the pieces fit together
---------------------------
  js/explorer-data.js   the folders and files
  js/explorer.js        navigation, tabs, search and file types
  css/explorer.css      the look of this window
  js/projects.js        opens a web project (README + browser)

To support a new kind of file, add it to FILE_TYPES in js/explorer.js.
`;


// =========================
// ABRIR / CREAR LA VENTANA DEL EXPLORADOR
// =========================
function openExplorerApp() {
  const isNew = !findWindow("explorer");

  // Si ya existe, createWindow() la muestra, la trae al frente y la activa.
  const explorerWindow = createWindow(
    "Explorer",
    "",
    "explorer",
    "./assets/icon/explorerbig.png"
  );

  if (!isNew) return;

  explorerWindow.style.left = "200px";
  explorerWindow.style.top  = Math.max(10, window.innerHeight - explorerWindow.offsetHeight - 120) + "px";

  setupExplorer(explorerWindow);
}


// =========================
// NAVEGACIÓN Y DIBUJO
// =========================
function setupExplorer(win) {
  const content   = win.querySelector(".window-content");
  const titleLeft = win.querySelector(".title-left");
  const index = indexExplorerData(explorerData);

  // --- Estado ---------------------------------------------------------------
  // Cada pestaña tiene su propia carpeta actual, historial y búsqueda.
  //   path → carpetas abiertas desde la raíz ([] = Home).
  let nextTabId = 1;
  const newTab = () => ({ id: nextTabId++, path: [], back: [], forward: [], query: "", selectedId: null });
  const tabs = [newTab()];
  let activeTab = tabs[0];
  const collapsed = new Set();   // secciones y paneles plegados
  const PANEL_KEYS = ["panel:tasks", "panel:places", "panel:details"];

  const explorer = {
    // Abre una carpeta desde cualquier lugar (también desde resultados o favoritos).
    openFolder(folder) {
      navigate(index.get(folder.id).parents.concat(folder));
    }
  };

  // --- Estructura fija (no contiene datos) -----------------------------------
  content.innerHTML = `
    <div class="fx">
      <div class="fx-menubar" data-part="menubar"></div>
      <div class="fx-toolbar">
        <button class="fx-nav" data-action="back" title="Back">
          <i class="fx-ico ico-back"></i><span>Back</span>
        </button>
        <button class="fx-nav" data-action="forward" title="Forward">
          <i class="fx-ico ico-forward"></i>
        </button>
        <button class="fx-nav" data-action="up" title="Up one level">
          <i class="fx-ico ico-up"></i>
        </button>
        <div class="fx-address" data-part="address"></div>
        <div class="fx-search">
          <input type="text" data-part="search" spellcheck="false" autocomplete="off">
          <button data-action="search-go" title="Go"><i class="fx-ico ico-go"></i></button>
        </div>
      </div>
      <div class="fx-body">
        <aside class="fx-side" data-part="side"></aside>
        <main class="fx-main" data-part="main"></main>
      </div>
    </div>`;

  const part = (name) => content.querySelector(`[data-part="${name}"]`);
  const menubar = part("menubar");
  const address = part("address");
  const search  = part("search");
  const side    = part("side");
  const main    = part("main");

  for (const name of Object.keys(EXPLORER_MENUS)) {
    menubar.append(createEl("span", "fx-menu", name, { action: "menu", menu: name }));
  }
  const flag = createEl("img", "fx-flag");
  flag.src = "./assets/images/logo-windows-xp.png";
  flag.alt = "";
  menubar.append(flag);

  // --- Navegación ------------------------------------------------------------
  function navigate(path) {
    if (path.length === activeTab.path.length && path.every((f, i) => f === activeTab.path[i])) return;
    activeTab.back.push(activeTab.path);
    activeTab.forward = [];
    resetView(path);
  }

  function resetView(path) {
    activeTab.path = path;
    activeTab.query = "";
    activeTab.selectedId = null;
    render();
  }

  function goBack() {
    if (!activeTab.back.length) return;
    activeTab.forward.push(activeTab.path);
    resetView(activeTab.back.pop());
  }

  function goForward() {
    if (!activeTab.forward.length) return;
    activeTab.back.push(activeTab.path);
    resetView(activeTab.forward.pop());
  }

  function goUp() {
    if (activeTab.path.length) navigate(activeTab.path.slice(0, -1));
  }

  const currentFolder = () => activeTab.path[activeTab.path.length - 1] || null;
  const currentItems  = () => (currentFolder() ? currentFolder().children || [] : explorerData);
  const visible = (item) => index.get(item.id) && index.get(item.id).item === item; // sin id o repetido → se omite

  // --- Pestañas (viven en la barra de título) --------------------------------
  function renderTabs() {
    titleLeft.className = "title-left fx-tabs";
    titleLeft.replaceChildren();

    for (const tab of tabs) {
      const folder = tab.path[tab.path.length - 1];
      const el = createEl("div", "fx-tab" + (tab === activeTab ? " active" : ""), null, { action: "select-tab", tab: tab.id });
      el.append(createEl("i", "fx-icon small " + (folder ? iconClassOf(folder) : "icon-home")));
      el.append(createEl("span", "fx-tab-name", folder ? folder.name : "Home"));
      el.append(createEl("span", "fx-tab-close", "×", { action: "close-tab", tab: tab.id }));
      titleLeft.append(el);
    }
    titleLeft.append(createEl("div", "fx-tab-new", "+", { action: "new-tab" }));
  }

  // --- Barra de herramientas: botones, direcciones y búsqueda ----------------
  function renderToolbar() {
    content.querySelector('[data-action="back"]').disabled    = activeTab.back.length === 0;
    content.querySelector('[data-action="forward"]').disabled = activeTab.forward.length === 0;
    content.querySelector('[data-action="up"]').disabled      = activeTab.path.length === 0;

    address.replaceChildren();
    address.append(createEl("i", "fx-ico ico-home small", null, { action: "crumb", depth: 0 }));
    const crumbs = [{ name: "Home", depth: 0 }].concat(
      activeTab.path.map((folder, i) => ({ name: folder.name, depth: i + 1 }))
    );
    for (const crumb of crumbs) {
      address.append(createEl("span", "fx-sep", "›"));
      address.append(createEl("span", "fx-crumb", crumb.name, { action: "crumb", depth: crumb.depth }));
    }

    const folder = currentFolder();
    search.placeholder = "Search " + (folder ? folder.name : "Home");
    if (search.value !== activeTab.query) search.value = activeTab.query;
  }

  // --- Panel lateral ---------------------------------------------------------
  function renderSide() {
    const selected = activeTab.selectedId && index.get(activeTab.selectedId);

    const tasks = [];
    if (selected) {
      tasks.push({ icon: "ico-open", text: "Open “" + selected.item.name + "”", command: "open-selected" });
      if (selected.item.type === "folder") {
        tasks.push({ icon: "ico-newtab", text: "Open in a new tab", command: "open-new-tab" });
      }
    }
    if (activeTab.path.length) {
      tasks.push({ icon: "ico-up small", text: "Go up one level", command: "up" });
      tasks.push({ icon: "ico-home small", text: "Go to Home", command: "home" });
    }
    if (tasks.length === 0) {
      tasks.push({ icon: "ico-refresh", text: "Refresh", command: "refresh" });
    }

    const places = [
      { icon: "ico-home small",  text: "Home",         command: "home" },
      { icon: "ico-paint",       text: "Paint",        command: "paint" },
      { icon: "ico-notepad",     text: "Notepad",      command: "notepad" },
      { icon: "ico-videoplayer", text: "Video Player", command: "video" }
    ];

    side.replaceChildren(
      sidePanel("panel:tasks",  "File and Folder Tasks", linkList(tasks)),
      sidePanel("panel:places", "Other Places",          linkList(places)),
      sidePanel("panel:details", "Details",              detailsBox(selected))
    );
  }

  function linkList(links) {
    const list = createEl("div", "fx-links");
    for (const link of links) {
      const el = createEl("div", "fx-link", null, { action: "command", command: link.command });
      el.tabIndex = 0;
      el.append(createEl("i", "fx-ico " + link.icon), createEl("span", "", link.text));
      list.append(el);
    }
    return list;
  }

  function detailsBox(selected) {
    const box = createEl("div", "fx-details");
    const entry = selected || (currentFolder() ? index.get(currentFolder().id) : null);
    const item = entry ? entry.item : null;

    box.append(createEl("div", "fx-details-name", item ? item.name : "Home"));
    box.append(createEl("div", "", item ? typeLabel(item) : "Portfolio"));

    const detail = item ? describeItem(item) : countText(explorerData.filter(visible).length);
    if (detail) box.append(createEl("div", "", detail));
    return box;
  }

  function sidePanel(key, title, body) {
    const isCollapsed = collapsed.has(key);
    const panel = createEl("section", "fx-panel" + (isCollapsed ? " collapsed" : ""));
    const head = createEl("div", "fx-panel-head", null, { action: "toggle", key });
    head.append(createEl("span", "", title), createEl("i", "fx-chevron"));
    panel.append(head, body);
    return panel;
  }

  // --- Zona principal: secciones con elementos -------------------------------
  function renderMain() {
    const query = activeTab.query.trim();
    const sections = [];

    if (query) {
      const results = searchItems(query);
      sections.push({
        key: "section:search", title: "Search results (" + results.length + ")",
        entries: results, emptyText: "No items match your search.", showLocation: true
      });
    } else if (activeTab.path.length === 0) {
      sections.push({
        key: "section:quick", title: "Quick Access",
        entries: currentItems().filter(visible).map((item) => index.get(item.id)),
        emptyText: "This folder is empty."
      });
      sections.push({
        key: "section:favourites", title: "Favourites",
        entries: favouriteEntries(), emptyText: "Your favourite files will appear here"
      });
    } else {
      sections.push({
        key: "section:folder", title: currentFolder().name,
        entries: currentItems().filter(visible).map((item) => index.get(item.id)),
        emptyText: "This folder is empty."
      });
    }

    main.replaceChildren(...sections.map(sectionEl));
    markSelection();
  }

  function sectionEl(section) {
    const isCollapsed = collapsed.has(section.key);
    const el = createEl("section", "fx-section" + (isCollapsed ? " collapsed" : ""));

    const head = createEl("div", "fx-section-head", null, { action: "toggle", key: section.key });
    head.append(createEl("span", "", section.title), createEl("i", "fx-chevron down"));
    el.append(head);

    if (section.entries.length === 0) {
      el.append(createEl("div", "fx-empty", section.emptyText));
      return el;
    }

    const grid = createEl("div", "fx-grid");
    for (const entry of section.entries) {
      const item = entry.item;
      const row = createEl("div", "fx-item", null, { action: "select", id: item.id });
      row.tabIndex = 0;
      row.append(createEl("i", "fx-icon " + iconClassOf(item)));

      const text = createEl("div", "fx-text");
      text.append(createEl("span", "fx-name", item.name));
      text.append(createEl("span", "fx-sub", section.showLocation ? locationText(entry) : subtitleOf(item)));
      row.append(text);
      grid.append(row);
    }
    el.append(grid);
    return el;
  }

  function markSelection() {
    for (const el of main.querySelectorAll(".fx-item")) {
      el.classList.toggle("selected", el.dataset.id === activeTab.selectedId);
    }
  }

  // --- Búsqueda y favoritos --------------------------------------------------
  // Busca por nombre dentro de la carpeta actual y todas sus subcarpetas.
  function searchItems(query) {
    const needle = query.toLowerCase();
    const results = [];
    (function walk(items) {
      for (const item of items) {
        if (!visible(item)) continue;
        if (item.name.toLowerCase().includes(needle)) results.push(index.get(item.id));
        if (Array.isArray(item.children)) walk(item.children);
      }
    })(currentItems());
    return results;
  }

  function favouriteEntries() {
    return [...index.values()].filter((entry) => entry.item.favourite === true && visible(entry.item));
  }

  // --- Acciones --------------------------------------------------------------
  function openById(id) {
    const entry = index.get(id);
    openItem(entry && entry.item, explorer);
  }

  function select(id) {
    activeTab.selectedId = id;
    markSelection();
    renderSide();
    if (SINGLE_CLICK_OPENS) openById(id);
  }

  function openFirstResult() {
    const query = activeTab.query.trim();
    const first = query ? searchItems(query)[0] : null;
    if (first) openById(first.item.id);
  }

  function togglePanels() {
    const allCollapsed = PANEL_KEYS.every((key) => collapsed.has(key));
    for (const key of PANEL_KEYS) {
      if (allCollapsed) collapsed.delete(key); else collapsed.add(key);
    }
    renderSide();
  }

  function closeTab(tabId) {
    const position = tabs.findIndex((tab) => tab.id === tabId);
    if (position === -1) return;
    if (tabs.length === 1) {
      win.querySelector(".close").click();       // última pestaña: se cierra la ventana
      return;
    }
    tabs.splice(position, 1);
    if (activeTab.id === tabId) activeTab = tabs[Math.min(position, tabs.length - 1)];
    render();
  }

  function runCommand(command) {
    switch (command) {
      case "home":         navigate([]); break;
      case "up":           goUp(); break;
      case "refresh":      render(); break;
      case "close":        win.querySelector(".close").click(); break;
      case "clear-search": activeTab.query = ""; render(); break;
      case "toggle-panels": togglePanels(); break;
      case "open-selected": if (activeTab.selectedId) openById(activeTab.selectedId); break;
      case "open-new-tab": {
        const entry = activeTab.selectedId && index.get(activeTab.selectedId);
        if (entry && entry.item.type === "folder") {
          const tab = newTab();
          tab.path = entry.parents.concat(entry.item);
          tabs.push(tab);
          activeTab = tab;
          render();
        }
        break;
      }
      case "paint":   openPaintApp(); break;
      case "notepad": openNotesApp(); break;
      case "video":   openVideoApp(); break;
      case "about":
        openNotepadWindow({ appId: "explorer-about", title: "About Explorer", text: EXPLORER_ABOUT_TEXT,
                            position: { left: 260, top: 120 } });
        break;
      default:
        if (command.startsWith("open:")) openById(command.slice(5));
    }
  }

  // --- Menús desplegables ----------------------------------------------------
  function closeMenu() {
    const open = menubar.querySelector(".fx-dropdown");
    if (open) {
      open.parentElement.classList.remove("open");
      open.remove();
    }
  }

  function toggleMenu(menuEl) {
    const wasOpen = menuEl.classList.contains("open");
    closeMenu();
    if (wasOpen) return;

    const name = menuEl.dataset.menu;
    let entries = EXPLORER_MENUS[name];
    if (name === "Favourites") {
      entries = favouriteEntries().map((entry) => ({ label: entry.item.name, command: "open:" + entry.item.id }));
      if (entries.length === 0) entries = [{ label: "(Empty)", disabled: true }];
    }

    const dropdown = createEl("div", "fx-dropdown");
    for (const entry of entries) {
      dropdown.append(createEl("div", "fx-menu-item" + (entry.disabled ? " disabled" : ""), entry.label,
        entry.disabled ? null : { action: "command", command: entry.command }));
    }
    menuEl.classList.add("open");
    menuEl.append(dropdown);
  }

  // Cerrar el menú al hacer clic fuera de la ventana (se desengancha solo al cerrar la ventana).
  const onOutsideDown = (e) => {
    if (!win.isConnected) {
      document.removeEventListener("mousedown", onOutsideDown);
      return;
    }
    if (!e.target.closest || !e.target.closest(".fx-menu")) closeMenu();
  };
  document.addEventListener("mousedown", onOutsideDown);

  // --- Eventos (delegación: un solo listener por tipo para toda la ventana) --
  win.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target || !win.contains(target)) {
      closeMenu();
      return;
    }

    const action = target.dataset.action;
    if (action !== "menu") closeMenu();

    switch (action) {
      case "menu":       toggleMenu(target); break;
      case "command":    runCommand(target.dataset.command); break;
      case "back":       goBack(); break;
      case "forward":    goForward(); break;
      case "up":         goUp(); break;
      case "search-go":  openFirstResult(); break;
      case "crumb":      navigate(activeTab.path.slice(0, Number(target.dataset.depth))); break;
      case "select":     select(target.dataset.id); break;
      case "toggle": {
        const key = target.dataset.key;
        if (collapsed.has(key)) collapsed.delete(key); else collapsed.add(key);
        renderSide();
        renderMain();
        break;
      }
      case "select-tab": {
        const tab = tabs.find((t) => t.id === Number(target.dataset.tab));
        if (tab && tab !== activeTab) { activeTab = tab; render(); }
        break;
      }
      case "close-tab":  closeTab(Number(target.dataset.tab)); break;
      case "new-tab":
        activeTab = newTab();
        tabs.push(activeTab);
        render();
        break;
    }
  });

  win.addEventListener("dblclick", (e) => {
    const row = e.target.closest(".fx-item");
    if (row && win.contains(row) && !SINGLE_CLICK_OPENS) openById(row.dataset.id);
  });

  win.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();

    if (e.target === search) {
      if (e.key === "Enter") openFirstResult();
      if (e.key === "Escape") { activeTab.query = ""; render(); }
      return;
    }

    if (e.key !== "Enter" && e.key !== " ") return;
    const row = e.target.closest && e.target.closest(".fx-item, .fx-link");
    if (!row || !win.contains(row)) return;
    e.preventDefault();
    if (row.classList.contains("fx-link")) runCommand(row.dataset.command);
    else openById(row.dataset.id);
  });

  search.addEventListener("input", () => {
    activeTab.query = search.value;
    activeTab.selectedId = null;
    renderMain();
    renderSide();
  });

  function render() {
    renderTabs();
    renderToolbar();
    renderSide();
    renderMain();
  }

  render();
}

function openItem(item, explorer) {
  const fileType = item && FILE_TYPES[item.type];
  if (!fileType) {
    console.warn("[explorer] No se puede abrir el elemento:", item);
    return;
  }
  fileType.open(item, explorer);
}


// =========================
// TEXTOS E ICONOS DE CADA ELEMENTO
// =========================
function iconClassOf(item) {
  if (item.icon && CUSTOM_ICONS.includes(item.icon)) return "icon-" + item.icon;
  const fileType = FILE_TYPES[item.type];
  return fileType ? fileType.iconClass : "icon-folder";
}

function typeLabel(item) {
  const fileType = FILE_TYPES[item.type];
  return fileType ? fileType.label : "Unknown item";
}

function countText(count) {
  return count + (count === 1 ? " item" : " items");
}

// Texto corto bajo el nombre (en la cuadrícula).
function subtitleOf(item) {
  if (item.type === "folder") {
    return countText((item.children || []).length);
  }
  return typeLabel(item);
}

// Línea extra del panel "Details".
function describeItem(item) {
  switch (item.type) {
    case "folder":  return countText((item.children || []).length);
    case "video":   return "File: " + String(item.src || "").split("/").pop();
    case "project": return item.address || "Documentation + website";
    case "link":    return item.href || "";
    default:        return "";
  }
}

// "in Web › Proyectos": dónde está un resultado de búsqueda.
function locationText(entry) {
  return entry.parents.length ? "in " + entry.parents.map((f) => f.name).join(" › ") : "in Home";
}


// =========================
// UTILIDADES
// =========================

// Crea un elemento. `text` se inserta como texto plano; `data` llena data-*.
function createEl(tag, className, text, data) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  if (data) Object.assign(el.dataset, data);
  return el;
}

// Recorre el árbol y crea un mapa id → { item, parents }, avisando en consola de datos mal escritos.
// `parents` son las carpetas que contienen al elemento, desde la raíz (sirve para abrirlo desde
// resultados de búsqueda o favoritos).
function indexExplorerData(items, index = new Map(), parents = []) {
  for (const item of items) {
    if (!item.id) {
      console.warn("[explorer] Elemento sin id (se omitirá):", item);
    } else if (index.has(item.id)) {
      console.warn(`[explorer] id repetido "${item.id}" (se omitirá el segundo).`);
    } else {
      index.set(item.id, { item, parents });
    }

    if (!FILE_TYPES[item.type]) {
      console.warn(`[explorer] Tipo desconocido "${item.type}" en "${item.id}".`);
    }
    if (item.icon && !CUSTOM_ICONS.includes(item.icon)) {
      console.warn(`[explorer] Icono desconocido "${item.icon}" en "${item.id}" (se usa el del tipo).`);
    }

    if (Array.isArray(item.children)) {
      indexExplorerData(item.children, index, parents.concat(item));
    }
  }
  return index;
}

// Abre un enlace en pestaña nueva. Solo permite http(s) o el protocolo de esta página
// (para rutas relativas); bloquea cosas como "javascript:".
function openExternalLink(href) {
  let url = null;
  try {
    url = new URL(href, window.location.href);
  } catch (err) {
    // href inválido o ausente
  }

  const allowed = ["http:", "https:", window.location.protocol];
  if (!url || !allowed.includes(url.protocol)) {
    console.warn("[explorer] Enlace no válido:", href);
    return;
  }

  window.open(url.href, "_blank", "noopener,noreferrer");
}

// Primer video del árbol (se usa cuando el reproductor se abre sin un video concreto,
// por ejemplo al iniciar el portafolio).
function findFirstVideo(items) {
  for (const item of items) {
    if (item.type === "video") return item;
    if (Array.isArray(item.children)) {
      const found = findFirstVideo(item.children);
      if (found) return found;
    }
  }
  return null;
}


// =========================
// REPRODUCTOR DE VIDEO
// =========================
// `video` es un elemento de los datos ({ name, src, ... }). Sin argumento abre el primer video.
// Sirve para cualquier video: no hay rutas ni nombres escritos aquí.
// Solo existe una ventana de reproductor: si ya está abierta se reutiliza
// y solo se cambia el video cuando es distinto.
function openVideoApp(video = findFirstVideo(explorerData)) {
  if (!video || !video.src) {
    console.warn("[explorer] No hay un video para reproducir:", video);
    return;
  }

  const isNew = !findWindow("videoplayer");

  // Si ya existe, createWindow() la muestra, la trae al frente y la activa.
  const videoWindow = createWindow(
    "Video Player",
    `<div class="video-player"><video controls></video></div>`,
    "videoplayer",
    "./assets/icon/videoplayerbig.png"
  );

  if (isNew) {
    videoWindow.style.left = (window.innerWidth - videoWindow.offsetWidth - 200) + "px";
    videoWindow.style.top  = (window.innerHeight - videoWindow.offsetHeight - 250) + "px";
  }

  // La barra de título muestra qué video se está reproduciendo.
  const titleText = videoWindow.querySelector(".title-left span");
  if (titleText) {
    titleText.textContent = video.name ? video.name + " - Video Player" : "Video Player";
  }

  const player = videoWindow.querySelector("video");
  const wantedSrc = new URL(video.src, document.baseURI).href;

  // Solo se recarga si es otro video (así no se pierde el punto de reproducción).
  if (player.src !== wantedSrc) {
    player.src = video.src;
  }
}
