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

