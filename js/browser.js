// =========================
// NAVEGADOR SIMULADO
// =========================
// Una ventana con barra de navegación y un <iframe> que muestra una página real
// del proyecto (HTML/CSS/JS propios), no una captura de pantalla.
//
//   appId    → identifica la ventana (misma app = misma ventana, sin duplicados).
//   title    → título de la ventana.
//   url      → página que se carga en el iframe (ruta relativa a index.html).
//   address  → (opcional) texto que se muestra en la barra de direcciones. Por defecto, `url`.
//   position → (opcional) { left, top } en px; solo se aplica si la ventana es nueva.
//
// Si la ventana ya existe, createWindow() la trae al frente y no se toca la página
// (el usuario conserva por dónde iba).
function openBrowserWindow({ appId, title = "Browser", url, address, position }) {
  const isNew = !findWindow(appId);

  const browserWindow = createWindow(
    title,
    `<div class="browser">
       <div class="browser-toolbar">
         <button class="browser-btn" data-action="back"    title="Back">◀</button>
         <button class="browser-btn" data-action="forward" title="Forward">▶</button>
         <button class="browser-btn" data-action="reload"  title="Reload">⟳</button>
         <button class="browser-btn" data-action="home"    title="Home">⌂</button>
         <input class="browser-address" type="text" readonly value="${escapeHTML(address || url)}">
       </div>
       <iframe class="browser-frame" src="${escapeHTML(url)}" title="${escapeHTML(title)}"></iframe>
     </div>`,
    appId,
    "./assets/icon/explorer/project.svg"
  );

  if (!isNew) return browserWindow;

  if (position) {
    browserWindow.style.left = position.left + "px";
    browserWindow.style.top  = position.top + "px";
  }

  // Un solo listener para los botones de la barra (delegación de eventos).
  const frame = browserWindow.querySelector(".browser-frame");
  browserWindow.querySelector(".browser-toolbar").addEventListener("click", (e) => {
    const button = e.target.closest("[data-action]");
    if (!button) return;

    try {
      switch (button.dataset.action) {
        case "back":    frame.contentWindow.history.back(); break;
        case "forward": frame.contentWindow.history.forward(); break;
        case "reload":  frame.contentWindow.location.reload(); break;
        case "home":    frame.src = url; break;
      }
    } catch (err) {
      // Si la página no es accesible (otro origen), se recarga la página inicial.
      frame.src = url;
    }
  });

  return browserWindow;
}
