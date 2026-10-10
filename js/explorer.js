// =========================
// EXPLORADOR DE ARCHIVOS
// =========================
// Los datos (carpetas, videos, enlaces) viven en js/explorer-data.js.
// Este archivo solo contiene la lógica: tipos de elemento, navegación,
// dibujo de cada carpeta y reproductor de video.

document.getElementById('openExplorer')
  .addEventListener('dblclick', openExplorerApp);

document.getElementById('openExplorerStart')
  .addEventListener('click', openExplorerApp);


// =========================
// TIPOS DE ELEMENTO
// =========================
// Qué icono usa cada tipo y qué pasa al abrirlo.
// Para agregar un tipo nuevo (por ejemplo "image"):
//   1. Añade una entrada aquí con su `iconClass` y su función `open`.
//   2. Si quieres un icono propio, crea la clase en css/explorer.css.
//   3. Úsalo en explorer-data.js con `type: "image"`.
//
// `open(item, explorer)` recibe el elemento de los datos y el explorador
// (que expone `openFolder(item)`).
const FILE_TYPES = {
  folder: {
    iconClass: "folder-icon",
    open: (item, explorer) => explorer.openFolder(item)
  },
  video: {
    iconClass: "video-icon",
    open: (item) => openVideoApp(item)
  },
  link: {
    iconClass: "link-icon",
    open: (item) => openExternalLink(item.href)
  }
};


// =========================
// ABRIR / CREAR LA VENTANA DEL EXPLORADOR
// =========================
function openExplorerApp() {
  const isNew = !document.querySelector('.window[data-app="explorer"]');

  // Si ya existe, createWindow() la muestra, la trae al frente y la activa.
  const explorerWindow = createWindow(
    "Explorer",
    "",
    "explorer",
    "./assets/icon/explorerbig.png"
  );

  if (!isNew) return;

  explorerWindow.style.left = "200px";
  explorerWindow.style.top  = (window.innerHeight - explorerWindow.offsetHeight - 200) + "px";

  setupExplorer(explorerWindow.querySelector('.window-content'));
}


// =========================
// NAVEGACIÓN Y DIBUJO
// =========================
function setupExplorer(content) {
  const index = indexExplorerData(explorerData);

  // Carpetas abiertas, desde la raíz hacia adentro. [] = raíz.
  let path = [];

  const explorer = {
    openFolder(folder) {
      path.push(folder);
      render();
    }
  };

  function render() {
    const current = path[path.length - 1];
    const items = current ? (current.children || []) : explorerData;

    const list = createEl("div", "explorer-list");

    if (path.length > 0) {
      const toolbar = createEl("div", "explorer-toolbar");
      toolbar.append(createEl("div", "explorer-back", "⬅ Volver", { action: "back" }));
      if (path.length > 1) {
        toolbar.append(createEl("div", "explorer-back", "⌂ Raíz", { action: "root" }));
      }
      list.append(toolbar);
    }

    let shown = 0;
    for (const item of items) {
      // Se omiten elementos sin id o con id repetido (ya avisados en consola).
      if (index.get(item.id) !== item) continue;

      const fileType = FILE_TYPES[item.type];
      const row = createEl("div", "explorer-item", null, { action: "open", id: item.id });
      row.append(createEl("div", fileType ? fileType.iconClass : "folder-icon"));
      row.append(createEl("span", "", item.name)); // textContent: nunca se interpreta como HTML
      list.append(row);
      shown++;
    }

    if (shown === 0) {
      list.append(createEl("div", "explorer-empty", "Esta carpeta está vacía"));
    }

    content.replaceChildren(list);
  }

  // Un solo listener para todo el contenido (delegación de eventos).
  // closest() encuentra el elemento correcto aunque el clic caiga en el icono o el texto.
  content.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target || !content.contains(target)) return;

    switch (target.dataset.action) {
      case "back":
        path.pop();
        render();
        break;
      case "root":
        path = [];
        render();
        break;
      case "open":
        openItem(index.get(target.dataset.id), explorer);
        break;
    }
  });

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

// Recorre el árbol y crea un mapa id → elemento, avisando en consola de datos mal escritos.
function indexExplorerData(items, index = new Map()) {
  for (const item of items) {
    if (!item.id) {
      console.warn("[explorer] Elemento sin id (se omitirá):", item);
    } else if (index.has(item.id)) {
      console.warn(`[explorer] id repetido "${item.id}" (se omitirá el segundo).`);
    } else {
      index.set(item.id, item);
    }

    if (!FILE_TYPES[item.type]) {
      console.warn(`[explorer] Tipo desconocido "${item.type}" en "${item.id}".`);
    }

    if (Array.isArray(item.children)) {
      indexExplorerData(item.children, index);
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
// `video` es un elemento de los datos ({ src, ... }). Sin argumento abre el primer video.
// Solo existe una ventana de reproductor: si ya está abierta se reutiliza
// y solo se cambia el video cuando es distinto.
function openVideoApp(video = findFirstVideo(explorerData)) {
  if (!video || !video.src) {
    console.warn("[explorer] No hay un video para reproducir:", video);
    return;
  }

  const isNew = !document.querySelector('.window[data-app="videoplayer"]');

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

  const player = videoWindow.querySelector("video");
  const wantedSrc = new URL(video.src, document.baseURI).href;

  // Solo se recarga si es otro video (así no se pierde el punto de reproducción).
  if (player.src !== wantedSrc) {
    player.src = video.src;
  }
}
