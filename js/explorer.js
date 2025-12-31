// =========================
// EXPLORADOR DE ARCHIVOS
// =========================

document.getElementById('openExplorer')
  .addEventListener('dblclick', openExplorerApp);

document.getElementById('openExplorerStart')
  .addEventListener('click', openExplorerApp);


function openExplorerApp() {

  const existing = document.querySelector('[data-app="explorer"]');
  if (existing) {
    existing.style.display = 'block';
    existing.style.zIndex = ++zIndexCounter;
    setActiveApp("explorer");
    return;
  }

  const explorerRoot = `
    <div class="explorer-list">
      <div class="explorer-folder" id="folderUni">
        <div class="folder-icon"></div> Trabajos Universitarios
      </div>
    </div>
  `;

  const explorerWindow = createWindow(
    "Explorer",
    explorerRoot,
    "explorer",
    "./assets/icon/explorerbig.png"
  );

  explorerWindow.style.left = "200px";
  explorerWindow.style.top  = (window.innerHeight - explorerWindow.offsetHeight - 200) + "px";

  const content = explorerWindow.querySelector('.window-content');
  content.addEventListener("click", (e) => explorerNavigation(e, explorerWindow));
}


function explorerNavigation(e, explorerWindow) {

  const content = explorerWindow.querySelector('.window-content');

  if (e.target.id === "backRoot") {
    const explorerRoot = `
      <div class="explorer-list">
        <div class="explorer-folder" id="folderUni">
          <div class="folder-icon"></div> Trabajos Universitarios
        </div>
      </div>
    `;
    openExplorerPage(explorerWindow, explorerRoot);
    return;
  }

  // ----- Carpeta Trabajos Universitarios -----
  if (e.target.id === "folderUni" || e.target.parentNode.id === "folderUni") {
    const uniHTML = `
      <div class="explorer-back" id="backRoot">⬅ Volver</div>
      <div class="explorer-folder" id="folderVideos">
        <div class="folder-icon"></div> Videos
      </div>
      <div class="explorer-folder" id="folderAni">
        <div class="folder-icon"></div> Animaciones
      </div>
      <div class="explorer-folder" id="folderProy">
        <div class="folder-icon"></div> Proyectos
      </div>
    `;
    openExplorerPage(explorerWindow, uniHTML);
    return;
  }

  // ----- Carpeta Videos -----
  if (e.target.id === "folderVideos" || e.target.parentNode.id === "folderVideos") {
    const videosHTML = `
      <div class="explorer-back" id="backUni">⬅ Volver</div>

      <div class="explorer-folder" id="video1">
        <div class="folder-icon"></div> video_prueba.mp4
      </div>
    `;
    openExplorerPage(explorerWindow, videosHTML);
    return;
  }

  // ----- Volver desde Videos -----
  if (e.target.id === "backUni") {
    const backUniHTML = `
      <div class="explorer-back" id="backRoot">⬅ Volver</div>
      <div class="explorer-folder" id="folderVideos">
        <div class="folder-icon"></div> Videos
      </div>
      <div class="explorer-folder" id="folderAni">
        <div class="folder-icon"></div> Animaciones
      </div>
      <div class="explorer-folder" id="folderProy">
        <div class="folder-icon"></div> Proyectos
      </div>
    `;
    openExplorerPage(explorerWindow, backUniHTML);
    return;
  }

  // ----- ARCHIVO DE VIDEO -----
  if (e.target.id === "video1" || e.target.parentNode.id === "video1") {
    openVideoApp(); // 💜 ahora funciona perfecto
  }
}


// =========================
// ACTUALIZAR CONTENIDO DEL EXPLORER
// =========================
function openExplorerPage(windowObj, htmlContent) {
  windowObj.querySelector('.window-content').innerHTML = htmlContent;
}


// VIDEO

function openVideoApp() {
  const existing = document.querySelector('[data-app="videoplayer"]');
  if (existing) {
    existing.style.display = 'block';
    existing.style.zIndex = ++zIndexCounter;
    setActiveApp("videoplayer");
    return;
  }

  const videoHTML = `
    <div class="video-player">
      <video controls>
        <source src="./assets/videos/video-miedo.mp4" type="video/mp4">
      </video>
    </div>
  `;
const videoWindow = createWindow("Video Player", videoHTML, "videoplayer", "./assets/icon/videoplayerbig.png");

videoWindow.style.left = (window.innerWidth - videoWindow.offsetWidth - 200) + "px";
videoWindow.style.top  = (window.innerHeight - videoWindow.offsetHeight - 250) + "px";

  createWindow(
    "Video Player",
    videoHTML,
    "videoplayer",
    "./assets/icon/videoplayerbig.png"
  );
}