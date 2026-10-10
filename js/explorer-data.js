// =========================
// DATOS DEL EXPLORADOR
// =========================
// Este es el ÚNICO archivo que necesitas editar para agregar, quitar,
// renombrar o reorganizar carpetas y archivos del explorador.
//
// Cada elemento tiene:
//   id     → identificador ÚNICO en todo el árbol (no lo repitas).
//   name   → texto que se muestra (se escribe como texto plano, no como HTML).
//   type   → "folder" | "video" | "link"   (ver FILE_TYPES en explorer.js)
//
// Propiedades según el tipo:
//   folder → children: [ ...más elementos... ]   (puede ir vacío o no existir)
//   video  → src: "./assets/videos/archivo.mp4"
//   link   → href: "https://ejemplo.com"          (se abre en una pestaña nueva)
//
// EJEMPLOS (copia y pega dentro del `children` que quieras):
//
//   Nueva carpeta:
//   { id: "mi-carpeta", name: "Mi carpeta", type: "folder", children: [] }
//
//   Nuevo video:
//   { id: "nuevo-video", name: "Mi nuevo video.mp4", type: "video",
//     src: "./assets/videos/mi-nuevo-video.mp4" }
//
//   Nuevo enlace:
//   { id: "mi-link", name: "Mi sitio", type: "link", href: "https://ejemplo.com" }

const explorerData = [
  {
    id: "universidad",
    name: "Trabajos Universitarios",
    type: "folder",
    children: [
      {
        id: "videos",
        name: "Videos",
        type: "folder",
        children: [
          {
            id: "video-prueba",
            name: "video_prueba.mp4",
            type: "video",
            src: "./assets/videos/video-miedo.mp4"
          }
        ]
      },
      {
        id: "animaciones",
        name: "Animaciones",
        type: "folder",
        children: []
      },
      {
        id: "proyectos",
        name: "Proyectos",
        type: "folder",
        children: []
      }
    ]
  }
];
