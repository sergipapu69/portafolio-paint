// =========================
// NOTEPAD
// =========================
function openNotesApp() {
  const notesHTML = `
  <textarea id="notesArea" style="
    width:95%; height:100%; border:none; outline:none;
    font-size:16px; padding:10px; resize:none;
  ">
ola ^.^
bienvenid@ a mi portafolio

este es un espacio donde vas a encontrar mis trabajos en diseño, web y proyectos creativos.
no todo esta perfecto, pero todo esta hecho con intención, cuidado y muchas horas encima >.<

puedes explorar libremente, abrir ventanas, revisar proyectos y ver como trabajo y como pienso.
la idea no es solo mostrar resultados, sino el proceso detrás de ellos.

gracias por pasar por acá y tomarte el tiempo de mirar.
espero que algo de lo que veas te llame la atención.

༼ ºل͟º ༽

att: sergio

  </textarea>
`;

  createWindow("Notepad", notesHTML, "notes", "./assets/icon/notepadbig.png");
}

document.getElementById('openNotes')
  .addEventListener('dblclick', openNotesApp);