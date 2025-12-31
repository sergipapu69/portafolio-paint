// =========================
//  PAINT APP
// =========================
function openPaintApp() {

  const paintHTML = `
  <div class="controls">
    <div class="settings">
      <button id="clearCanvas">Limpiar</button>
    </div>

    
    <div class="colors">
    
      <label>
        <input type="range" id="brushSize" min="1" max="20" value="5">
      </label>

      <label>
      <input type="color" id="paintColor" value="#000000">
      </label>
      
      <div class="palette">
        <div class="color-swatch" data-color="#000000" style="background-color: #000000;"></div>
        <div class="color-swatch" data-color="#80807e" style="background-color: #80807e;"></div>
        <div class="color-swatch" data-color="#7e0207" style="background-color: #7e0207;"></div>
        <div class="color-swatch" data-color="#7d820e" style="background-color: #7d820e;"></div>
        <div class="color-swatch" data-color="#0a7d0f" style="background-color: #0a7d0f;"></div>
        <div class="color-swatch" data-color="#197873" style="background-color: #197873;"></div>
        <div class="color-swatch" data-color="#00036e" style="background-color: #00036e;"></div>
        <div class="color-swatch" data-color="#82077d" style="background-color: #82077d;"></div>
        <div class="color-swatch" data-color="#7f833f" style="background-color: #7f833f;"></div>
        <div class="color-swatch" data-color="#064041" style="background-color: #064041;"></div>
        <div class="color-swatch" data-color="#0681f8" style="background-color: #0681f8;"></div>
        <div class="color-swatch" data-color="#0d4371" style="background-color: #0d4371;"></div>
        <div class="color-swatch" data-color="#7f03f7" style="background-color: #7f03f7;"></div>
        <div class="color-swatch" data-color="#7e4005" style="background-color: #7e4005;"></div>
        <div class="color-swatch" data-color="#ffffff" style="background-color: #ffffff;"></div>
        <div class="color-swatch" data-color="#c2c0bc" style="background-color: #c2c0bc;"></div>
        <div class="color-swatch" data-color="#f1040b" style="background-color: #f1040b;"></div>
        <div class="color-swatch" data-color="#f7fa2c" style="background-color: #f7fa2c;"></div>
        <div class="color-swatch" data-color="#12f610" style="background-color: #12f610;"></div>
        <div class="color-swatch" data-color="#20f2f2" style="background-color: #20f2f2;"></div>
        <div class="color-swatch" data-color="#0802de" style="background-color: #0802de;"></div>
        <div class="color-swatch" data-color="#f807f4" style="background-color: #f807f4;"></div>
        <div class="color-swatch" data-color="#fefc8d" style="background-color: #fefc8d;"></div>
        <div class="color-swatch" data-color="#15f283" style="background-color: #15f283;"></div>
        <div class="color-swatch" data-color="#88fff7" style="background-color: #88fff7;"></div>
        <div class="color-swatch" data-color="#8181f5" style="background-color: #8181f5;"></div>
        <div class="color-swatch" data-color="#f60481" style="background-color: #f60481;"></div>
        <div class="color-swatch" data-color="#f38546" style="background-color: #f38546;"></div>

      </div>

    </div class="colors">
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

  paintWindow.querySelectorAll('.color-swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    color = swatch.dataset.color;
    colorInput.value = color; // sincroniza con el input color
  });
});

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

