// =========================
// NOTEPAD
// =========================
// Abre un Bloc de notas. Es genérico para poder reutilizarlo:
//   appId  → identifica la ventana (misma app = misma ventana, sin duplicados).
//   title  → título en la barra de la ventana y de tareas.
//   text   → contenido inicial (texto plano; se escapa, nunca se interpreta como HTML).
//   position → (opcional) { left, top } en px; solo se aplica si la ventana es nueva.
// Si la ventana ya existe se reutiliza tal cual (conserva lo que el usuario escribió).
// Devuelve la ventana, para poder cambiar el texto después (por ejemplo al cargar un archivo).
function openNotepadWindow({ appId = "notes", title = "Notepad", text = "", position } = {}) {
  const isNew = !findWindow(appId);

  const notepadWindow = createWindow(
    title,
    `<textarea class="notes-area" style="
      width:95%; height:100%; border:none; outline:none;
      font-size:16px; padding:10px; resize:none;
    ">${escapeHTML(text)}</textarea>`,
    appId,
    "./assets/icon/notepadbig.png"
  );

  if (isNew && position) {
    notepadWindow.style.left = position.left + "px";
    notepadWindow.style.top  = position.top + "px";
  }
  return notepadWindow;
}

const WELCOME_NOTE = `
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

`;

function openNotesApp() {
  const notesWindow = openNotepadWindow({ appId: "notes", title: "Notepad", text: WELCOME_NOTE });
  notesWindow.querySelector("textarea").id = "notesArea";
}

document.getElementById('openNotes')
  .addEventListener('dblclick', openNotesApp);