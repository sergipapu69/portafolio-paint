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