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
  document.getElementById('currentTime').innerHTML =     hour+':'+min+' '+mid ;
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
  
none; 
}

const body = document.body;
const taskbar = document.getElementById('taskbar-apps');
let zIndexCounter = 1;

// --- SISTEMA DE VENTANAS ---
function makeWindowDraggable(win, titleBar) {
  let offsetX, offsetY, isDragging = false;

  titleBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    win.classList.add('active');
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
function createWindow(title, contentHTML, appId) {
  const win = document.createElement('div');
  win.classList.add('window');
  win.dataset.app = appId;
  win.innerHTML = `
    <div class="title-bar">
      <span>${title}</span>
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

  // Posición inicial
  win.style.left = '100px';
  win.style.top = '100px';
  win.style.display = 'block';
  win.style.zIndex = ++zIndexCounter;

  // === Crear botón en la taskbar ===
  const taskButton = document.createElement('button');
  taskButton.classList.add('taskbar-btn');
  taskButton.textContent = title;
  taskButton.dataset.app = appId;
  taskbar.appendChild(taskButton);

  // --- Eventos de ventana ---
  const content = win.querySelector('.window-content');
  const closeBtn = win.querySelector('.close');
  const minimizeBtn = win.querySelector('.minimize');
  const maximizeBtn = win.querySelector('.maximize');

  let isMinimized = false;
  let isMaximized = false;
  let prev = {};

  // Cerrar ventana
  closeBtn.onclick = () => {
    win.remove();
    taskButton.remove();
  };

  // Minimizar ventana
  minimizeBtn.onclick = () => {
    if (!isMinimized) {
      win.style.display = 'none'; // 👈 oculta toda la ventana
      isMinimized = true;
    } else {
      win.style.display = 'block'; // 👈 la vuelve a mostrar
      isMinimized = false;
      win.style.zIndex = ++zIndexCounter;
    }
  };


  // Maximizar / Restaurar
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

  // Click en taskbar → restaurar / enfocar
  taskButton.onclick = () => {
    const hidden = win.style.display === 'none';
    win.style.display = hidden ? 'block' : 'none';
    if (hidden) {
      win.style.zIndex = ++zIndexCounter;
    }
  };

  return win;
}

// --- PAINT APP ---
document.getElementById('openPaint').addEventListener('click', () => {
  // Verificar si ya está abierto
  const existing = document.querySelector('[data-app="paint"]');
  if (existing) {
    existing.style.zIndex = ++zIndexCounter;
    return;
  }

  const paintHTML = `
    <div class="controls">
      <label>Color <input type="color" id="paintColor" value="#000000"></label>
      <label>Tamaño <input type="range" id="brushSize" min="1" max="20" value="5"></label>
      <button id="clearCanvas">Limpiar</button>
    </div>
    <div class="canvas-container">
      <canvas id="paintCanvas" width="560" height="340"></canvas>
    </div>
  `;

  const paintWindow = createWindow('Paint', paintHTML, 'paint');
  const canvas = paintWindow.querySelector('#paintCanvas');
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let color = '#000';
  let brush = 5;

  const colorInput = paintWindow.querySelector('#paintColor');
  const sizeInput = paintWindow.querySelector('#brushSize');
  const clearBtn = paintWindow.querySelector('#clearCanvas');

  colorInput.oninput = () => color = colorInput.value;
  sizeInput.oninput = () => brush = sizeInput.value;

  // Función para dibujar
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

  // Limpiar canvas
  clearBtn.onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

  // === Hacer el canvas responsive ===
  const canvasContainer = paintWindow.querySelector('.canvas-container');
  
  // Función para ajustar el tamaño del canvas
  const resizeCanvas = () => {
    const containerWidth = canvasContainer.offsetWidth;
    const containerHeight = canvasContainer.offsetHeight;
    
    // Ajustamos el tamaño del canvas, manteniendo las proporciones
    canvas.width = containerWidth;
    canvas.height = containerHeight;
  };

  // Inicializar tamaño del canvas
  resizeCanvas();

  // Ajustar el canvas cuando la ventana se redimensione
  window.addEventListener('resize', resizeCanvas);

  // === Posicionar ventana al centro de la pantalla ===
  const windowWidth = 600; // Tamaño de la ventana
  const windowHeight = 450; // Tamaño de la ventana (con controles)
  const left = (window.innerWidth - windowWidth) / 2;
  const top = (window.innerHeight - windowHeight) / 2;

  paintWindow.style.left = `${left}px`;
  paintWindow.style.top = `${top}px`;
  paintWindow.style.zIndex = ++zIndexCounter;
});
