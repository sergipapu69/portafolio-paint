//                            HOUR SCRIPT
// ----------------------------------------------------------------
window.onload = function() {
  clock();  
    function clock() {
    let now = new Date();
    let TwentyFourHour = now.getHours();
    let hour = now.getHours();
    let min = now.getMinutes();
    let sec = now.getSeconds();
    let mid = 'PM';
    if(sec < 10) { 
      sec = "0" + sec; 
    }
    if (min < 10) {
      min = "0" + min;
    }
    if (hour > 12) {
      hour = hour - 12;
    }   
    if (hour < 10 ) {
      hour = "0" + hour;
    }   
    if(hour==0){ 
      hour=12;
    }
    if(TwentyFourHour < 12) {
       mid = 'AM';
    }
  document.getElementById('currentTime').innerHTML = hour+':'+min+' '+mid ;
    setTimeout(clock, 1000);
    }
}
// ----------------------------------------------------------------

//                START MENU HIDE AND SHOW SCRIPT 
// ----------------------------------------------------------------
let startMenuDiv = document.getElementById('start-menu')
let startMenudisplay = 0;

function hideShow()
{
  if(startMenudisplay==1)
  {
    startMenuDiv.style.display="none";
    startMenudisplay = 0;
  }
  else
  {
    startMenuDiv.style.display="flex";
    startMenudisplay = 1;
  }

}
// ----------------------------------------------------------------
//                SHUT DOWN HIDE AND SHOW SCRIPT 
// ----------------------------------------------------------------

let shutDownDiv = document.getElementById('shut-down-tab-parent')
let shutDowndisplay = 0;

function shutDown()
{
  if(shutDowndisplay==1)
  {
    shutDownDiv.style.display="none";
    shutDowndisplay = 0;
  }
  else
  {
    shutDownDiv.style.display="flex";
    shutDowndisplay = 1;
  }
}

// ----------------------------------------------------------------

// GLOBALS
const body = document.body;
const taskbar = document.getElementById('taskbar-apps');
let zIndexCounter = 1;
let activeApp = null;
let paintOpenedOnce = false;


// ===============================
// FUNCIÓN PARA ACTIVAR UNA APP
// ===============================
function setActiveApp(appId) {
  activeApp = appId;

  document.querySelectorAll('.taskbar-btn').forEach(btn => {
    if (btn.dataset.app === appId) {
      btn.classList.add('active-task');
    } else {
      btn.classList.remove('active-task');
    }
  });

  document.querySelectorAll('.window').forEach(win => {
    if (win.dataset.app === appId) {
      win.classList.add('active');
    } else {
      win.classList.remove('active');
    }
  });
}

// --- SISTEMA DE VENTANAS ---
function makeWindowDraggable(win, titleBar) {
  let offsetX, offsetY, isDragging = false;

  titleBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    setActiveApp(win.dataset.app);
    win.style.zIndex = ++zIndexCounter;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      win.style.left = `${e.clientX - offsetX}px`;
      win.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', () => isDragging = false);
}

// Crear ventana y botón en la barra de tareas
function createWindow(title, contentHTML, appId, iconPath) {

  // Evitar múltiples ventanas de la misma app
  const existing = document.querySelector(`[data-app="${appId}"]`);
  if (existing) {
    existing.style.display = "block";
    existing.style.zIndex = ++zIndexCounter;
    setActiveApp(appId);
    return existing;
  }

  const win = document.createElement('div');
  win.classList.add('window');
  win.dataset.app = appId;

  win.innerHTML = `
    <div class="title-bar">
      <div class="title-left">
        <img src="${iconPath}" class="title-icon">
        <span>${title}</span>
      </div>
      <div class="buttons">
        <button class="minimize"></button>
        <button class="maximize"></button>
        <button class="close"></button>
      </div>
    </div>
    <div class="window-content">${contentHTML}</div>
  `;

  body.appendChild(win);

  const titleBar = win.querySelector('.title-bar');
  makeWindowDraggable(win, titleBar);

  win.style.left = '120px';
  win.style.top = '120px';
  win.style.display = 'block';
  win.style.zIndex = ++zIndexCounter;

  // === Crear botón en la taskbar ===
  const taskButton = document.createElement('button');
  taskButton.classList.add('taskbar-btn');
  taskButton.dataset.app = appId;

  taskButton.innerHTML = `
    <img src="${iconPath}" class="taskbar-icon">
    <span class="taskbar-text">${title}</span>
  `;

  taskbar.appendChild(taskButton);

  // Activar app al abrir
  setActiveApp(appId);

  // EVENTOS
  const closeBtn = win.querySelector('.close');
  const minimizeBtn = win.querySelector('.minimize');
  const maximizeBtn = win.querySelector('.maximize');

  let isMinimized = false;
  let isMaximized = false;
  let prev = {};

  // Cerrar
  closeBtn.onclick = () => {
    win.remove();
    taskButton.remove();
    if (activeApp === appId) activeApp = null;
  };

  // Minimizar
  minimizeBtn.onclick = () => {
    win.style.display = 'none';
    isMinimized = true;
  };

  // Maximizar
  maximizeBtn.onclick = () => {
    if (!isMaximized) {
      prev = { left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height };
      win.style.left = '0';
      win.style.top = '0';
      win.style.width = '100vw';
      win.style.height = '100vh';
      isMaximized = true;
    } else {
      Object.assign(win.style, prev);
      isMaximized = false;
    }
  };

  // Restaurar desde taskbar
  taskButton.onclick = () => {
    if (win.style.display === 'none') {
      win.style.display = 'block';
    }
    win.style.zIndex = ++zIndexCounter;
    setActiveApp(appId);
  };

  // Activar al hacer click en la ventana
  win.addEventListener("mousedown", () => {
    win.style.zIndex = ++zIndexCounter;
    setActiveApp(appId);
  });

  return win;
}

// =========================
//  PAINT APP
// =========================
function openPaintApp() {

  const paintHTML = `
    <div class="controls">
      <label>Color <input type="color" id="paintColor" value="#000000"></label>
      <label>Tamaño <input type="range" id="brushSize" min="1" max="20" value="5"></label>
      <button id="clearCanvas">Limpiar</button>
    </div>
    <div class="canvas-container">
      <canvas id="paintCanvas"></canvas>
    </div>
  `;

  const paintWindow = createWindow("Paint", paintHTML, "paint", "./assets/icon/paintbig.png");

  const canvas = paintWindow.querySelector('#paintCanvas');
  const ctx = canvas.getContext('2d');


  
  canvas.width = 800;
  canvas.height = 600;

  // ⭐ Solo cargar el dibujo la PRIMER apertura después de recargar
  if (!window.paintOpenedOnce) {
    window.paintOpenedOnce = true;

    const img = new Image();
    img.src = "./assets/images/default-paint.png";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }
    // ⭐⭐⭐ CENTRAR LA VENTANA ⭐⭐⭐
  const w = paintWindow;
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  const winW = w.offsetWidth;
  const winH = w.offsetHeight;

  w.style.left = (screenW / 2 - winW / 2) + "px";
  w.style.top  = (screenH / 2 - winH / 2) + "px";

  // SISTEMA DE PINCEL
  let drawing = false;
  let color = '#000';
  let brush = 5;

  const colorInput = paintWindow.querySelector('#paintColor');
  const sizeInput = paintWindow.querySelector('#brushSize');
  const clearBtn = paintWindow.querySelector('#clearCanvas');

  colorInput.oninput = () => color = colorInput.value;
  sizeInput.oninput = () => brush = sizeInput.value;

  canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.strokeStyle = color;
      ctx.lineWidth = brush;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  });

  canvas.addEventListener('mouseup', () => drawing = false);
  canvas.addEventListener('mouseleave', () => drawing = false);

  clearBtn.onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
}

document.getElementById('openPaint')
  .addEventListener('dblclick', openPaintApp);



// =========================
// NOTEPAD
// =========================
function openNotesApp() {
  const notesHTML = `
    <textarea id="notesArea" style="
      width:95%; height:100%; border:none; outline:none;
      font-size:16px; padding:10px; resize:none;
    "></textarea>
  `;
  createWindow("Notepad", notesHTML, "notes", "./assets/icon/notepadbig.png");
}

document.getElementById('openNotes')
  .addEventListener('dblclick', openNotesApp);



  
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


window.addEventListener("load", () => {
  setTimeout(() => {
    openVideoApp();  // 💜 ahora sí se abre al iniciar
  }, 100);
  
  setTimeout(() => {
    openNotesApp();
  }, 300);
  
  setTimeout(() => {
    openExplorerApp();
  }, 200);
  
  setTimeout(() => {
    openPaintApp();
  }, 400);
});

