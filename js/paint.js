// =========================
//  PAINT APP
// =========================
function openPaintApp() {

  const paintHTML = `
  <div class="controls">

    <div class="tools">
      <button title="Pincel" id="brushTool" class="tool-btn active"></button>
      <button title="Rellenar" id="fillTool" class="tool-btn"></button>
      <button title="Selector de color" id="pickerTool" class="tool-btn"></button>
      <button title="Borrar lienzo" id="clearCanvas"></button>
      <button title="Borrador" id="eraserTool" class="tool-btn"></button>
      <button title="Círculo" id="circleTool" class="tool-btn"></button>
      <button title="Rectángulo" id="rectTool" class="tool-btn"></button>
      <button title="Estrella" id="starTool" class="tool-btn"></button>
      </div>

    <div class="settings">
      <input type="range" id="brushSize" min="1" max="20" value="5">
      <input type="color" id="paintColor" value="#000000">
    </div>

    <div class="palette">
      ${[
        "#000000","#80807e","#7e0207","#7d820e","#0a7d0f","#197873",
        "#00036e","#82077d","#7f833f","#064041","#0681f8","#0d4371",
        "#7f03f7","#7e4005","#ffffff","#c2c0bc","#f1040b","#f7fa2c",
        "#12f610","#20f2f2","#0802de","#f807f4","#fefc8d","#15f283",
        "#88fff7","#8181f5","#f60481","#f38546"
      ].map(c => `<div class="color-swatch" data-color="${c}" style="background:${c}"></div>`).join("")}
    </div>

  </div>

  <div class="canvas-container">
    <canvas id="paintCanvas"></canvas>
  </div>
  `;

  const paintWindow = createWindow(
    "Paint",
    paintHTML,
    "paint",
    "./assets/icon/paintbig.png"
  );

  // centrar ventana
  paintWindow.style.left =
    (window.innerWidth / 2 - paintWindow.offsetWidth / 2) + "px";
  paintWindow.style.top =
    (window.innerHeight / 2 - paintWindow.offsetHeight / 2) + "px";

  const canvas = paintWindow.querySelector('#paintCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 850;
  canvas.height = 600;

  // imagen inicial
  if (!window.paintOpenedOnce) {
    window.paintOpenedOnce = true;
    const img = new Image();
    img.src = "./assets/images/default-paint.png";
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  // ---------- ESTADO ----------
  let tool = 'brush';
  let drawing = false;
  let color = '#000000';
  let brush = 5;
  let startX = 0;
  let startY = 0;
  let previewImage = null;

  let history = [];
  const MAX_HISTORY = 30;

  // ---------- HISTORIAL ----------
  function saveState() {
    if (history.length >= MAX_HISTORY) history.shift();
    history.push(canvas.toDataURL());
  }

  function undo() {
    if (!history.length) return;
    const img = new Image();
    img.src = history.pop();
    img.onload = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img,0,0);
    };
  }

  // ---------- HERRAMIENTAS ----------
  function selectTool(t) {
    tool = t;
    paintWindow.querySelectorAll('.tool-btn')
      .forEach(b => b.classList.remove('active'));

    const map = {
      brush:'brushTool',
      eraser:'eraserTool',
      circle:'circleTool',
      rect:'rectTool',
      star:'starTool',
      fill:'fillTool',
      picker:'pickerTool'
    };
    paintWindow.querySelector('#'+map[t]).classList.add('active');
  }

  function drawStar(x,y,w,h){
    const cx=x+w/2, cy=y+h/2;
    const spikes=5;
    const outer=Math.min(w,h)/2;
    const inner=outer/2;
    let rot=Math.PI/2*3;
    const step=Math.PI/spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy-outer);
    for(let i=0;i<spikes;i++){
      ctx.lineTo(cx+Math.cos(rot)*outer, cy+Math.sin(rot)*outer);
      rot+=step;
      ctx.lineTo(cx+Math.cos(rot)*inner, cy+Math.sin(rot)*inner);
      rot+=step;
    }
    ctx.closePath();
    ctx.stroke();
  }

  // ---------- FILL ----------
  function hexToRgba(hex){
    const c=parseInt(hex.slice(1),16);
    return [(c>>16)&255,(c>>8)&255,c&255,255];
  }

  function floodFill(x,y,fillColor){
    const img=ctx.getImageData(0,0,canvas.width,canvas.height);
    const data=img.data;
    const w=canvas.width;
    const stack=[[x,y]];
    const i=(y*w+x)*4;
    const target=data.slice(i,i+4);
    const fill=hexToRgba(fillColor);

    if (target.every((v,i)=>v===fill[i])) return;

    while(stack.length){
      const [cx,cy]=stack.pop();
      if(cx<0||cy<0||cx>=w||cy>=canvas.height) continue;
      const idx=(cy*w+cx)*4;
      if(!target.every((v,i)=>data[idx+i]===v)) continue;

      data.set(fill,idx);
      stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
    }
    ctx.putImageData(img,0,0);
  }

  // ---------- PICK COLOR ----------
  function pickColor(x,y){
    const d=ctx.getImageData(x,y,1,1).data;
    const hex=`#${[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
    color=hex;
    paintWindow.querySelector('#paintColor').value=hex;
  }

  // ---------- CONTROLES ----------
  paintWindow.querySelector('#brushTool').onclick=()=>selectTool('brush');
  paintWindow.querySelector('#eraserTool').onclick=()=>selectTool('eraser');
  paintWindow.querySelector('#circleTool').onclick=()=>selectTool('circle');
  paintWindow.querySelector('#rectTool').onclick=()=>selectTool('rect');
  paintWindow.querySelector('#starTool').onclick=()=>selectTool('star');
  paintWindow.querySelector('#fillTool').onclick=()=>selectTool('fill');
  paintWindow.querySelector('#pickerTool').onclick=()=>selectTool('picker');

  paintWindow.querySelector('#paintColor').oninput=e=>color=e.target.value;
  paintWindow.querySelector('#brushSize').oninput=e=>brush=e.target.value;

  paintWindow.querySelectorAll('.color-swatch').forEach(s=>{
    s.onclick=()=>{
      color=s.dataset.color;
      paintWindow.querySelector('#paintColor').value=color;
    };
  });

  paintWindow.querySelector('#clearCanvas').onclick=()=>{
    saveState();
    ctx.clearRect(0,0,canvas.width,canvas.height);
  };

  // ---------- CANVAS ----------
  canvas.addEventListener('mousedown',e=>{
    startX=e.offsetX;
    startY=e.offsetY;

    if(tool==='fill'){
      saveState();
      floodFill(startX,startY,color);
      return;
    }

    if(tool==='picker'){
      pickColor(startX,startY);
      return;
    }

    saveState();
    previewImage=new Image();
    previewImage.src=canvas.toDataURL();

    if(tool==='brush'||tool==='eraser'){
      drawing=true;
      ctx.beginPath();
      ctx.moveTo(startX,startY);
    }
  });

  canvas.addEventListener('mousemove',e=>{
    if(!previewImage) return;

    if(drawing){
      ctx.strokeStyle=tool==='eraser'?'#ffffff':color;
      ctx.lineWidth=brush;
      ctx.lineCap='round';
      ctx.lineTo(e.offsetX,e.offsetY);
      ctx.stroke();
      return;
    }

    const x=Math.min(startX,e.offsetX);
    const y=Math.min(startY,e.offsetY);
    const w=Math.abs(e.offsetX-startX);
    const h=Math.abs(e.offsetY-startY);

    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(previewImage,0,0);
    ctx.strokeStyle=color;
    ctx.lineWidth=brush;

    if(tool==='rect') ctx.strokeRect(x,y,w,h);
    if(tool==='circle'){
      ctx.beginPath();
      ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);
      ctx.stroke();
    }
    if(tool==='star') drawStar(x,y,w,h);
  });

  canvas.addEventListener('mouseup',()=>{
    drawing=false;
    previewImage=null;
  });

  // ---------- CTRL + Z ----------
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey && e.key.toLowerCase()==='z'){
      e.preventDefault();
      undo();
    }
  });

  selectTool('brush');
}

document.getElementById('openPaint')
  .addEventListener('dblclick', openPaintApp);
