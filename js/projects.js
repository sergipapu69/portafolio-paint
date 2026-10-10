// =========================
// PROYECTOS WEB
// =========================
// Un "proyecto" (type: "project" en explorer-data.js) se abre en DOS ventanas
// independientes que reutilizan las apps del escritorio:
//   - Bloc de notas con la documentación  (item.docs → archivo .txt)
//   - Navegador simulado con la página    (item.site → archivo .html)
//
// La documentación y la página viven en projects/<id>/, fuera del código del explorador.
// Para agregar un proyecto nuevo no se escribe código: ver explorer-data.js.

function openProject(project) {
  // Las ventanas se identifican por proyecto: cada una se puede mover, enfocar y cerrar
  // por separado, y volver a abrir un proyecto recupera las que ya estén abiertas.
  const key = String(project.id).replace(/[^\w-]/g, "_");

  if (project.docs) {
    const notesAppId = `project-notes-${key}`;
    const notesIsNew = !findWindow(notesAppId);

    const notesWindow = openNotepadWindow({
      appId: notesAppId,
      title: `README - ${project.name}`,
      text: notesIsNew ? "Cargando documentación…" : "",
      position: { left: 90, top: 70 }
    });

    if (notesIsNew) {
      loadProjectDocs(project.docs, notesWindow);
    }
  }

  if (project.site) {
    openBrowserWindow({
      appId: `project-browser-${key}`,
      title: project.name,
      url: project.site,
      address: project.address,
      position: { left: 700, top: 50 }
    });
  }
}

// Lee el archivo de documentación y lo muestra en el Bloc de notas.
function loadProjectDocs(src, notesWindow) {
  const textarea = notesWindow.querySelector("textarea");

  fetch(src)
    .then((response) => {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.text();
    })
    .then((text) => { if (notesWindow.isConnected) textarea.value = text; })
    .catch((err) => {
      console.warn("[projects] No se pudo cargar la documentación:", src, err);
      if (notesWindow.isConnected) {
        textarea.value =
          "No se pudo cargar la documentación (" + src + ").\n\n" +
          "Si abres el portafolio haciendo doble clic en index.html, el navegador bloquea " +
          "la lectura de archivos. Ábrelo desde un servidor local (por ejemplo Live Server " +
          "de VS Code) o desde su dirección publicada.";
      }
    });
}
