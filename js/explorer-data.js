// =========================
// DATOS DEL EXPLORADOR
// =========================
// Este es el ÚNICO archivo que necesitas editar para agregar, quitar,
// renombrar o reorganizar carpetas y archivos del explorador.
//
// Cada elemento tiene:
//   id     → identificador ÚNICO en todo el árbol (no lo repitas).
//   name   → texto que se muestra (se escribe como texto plano, no como HTML).
//   type   → "folder" | "video" | "project" | "link"   (ver FILE_TYPES en explorer.js)
//   icon   → (opcional) icono propio: "web", "edit", "anim", "hobbies", "music", "draw", "photo".
//            Si no lo pones se usa el icono del tipo. Los iconos viven en
//            assets/icon/explorer/ y se enlazan en css/explorer.css (.fx-icon.icon-<nombre>).
//   favourite → (opcional) true para que aparezca también en "Favourites".
//
// Propiedades según el tipo:
//   folder  → children: [ ...más elementos... ]   (puede ir vacío o no existir)
//   video   → src: "./assets/videos/archivo.mp4"
//   project → docs: "./projects/<id>/README.txt"            (se abre en el Bloc de notas)
//             site: "./projects/<id>/site/index.html"       (se abre en el navegador simulado)
//             address: "http://mi-proyecto.local"           (opcional, texto de la barra de direcciones)
//   link    → href: "https://ejemplo.com"                   (se abre en una pestaña nueva)
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
//   Nuevo proyecto web (crea la carpeta projects/mi-proyecto/ con README.txt y site/index.html):
//   { id: "mi-proyecto", name: "Mi proyecto", type: "project",
//     docs: "./projects/mi-proyecto/README.txt",
//     site: "./projects/mi-proyecto/site/index.html" }
//
//   Nuevo enlace:
//   { id: "mi-link", name: "Mi sitio", type: "link", href: "https://ejemplo.com" }

const explorerData = [
  {
    id: "web",
    name: "Web",
    type: "folder",
    icon: "web",
    children: [
      {
        id: "proyecto-ejemplo",
        name: "Proyecto de ejemplo",
        type: "project",
        docs: "./projects/proyecto-ejemplo/README.txt",
        site: "./projects/proyecto-ejemplo/site/index.html",
        address: "http://proyecto-ejemplo.local"
      }
    ]
  },
  {
    id: "edicion",
    name: "Edición",
    type: "folder",
    icon: "edit",
    children: [
      {
        id: "video-prueba",
        name: "video_prueba.mp4",
        type: "video",
        // El archivo físico se llama video-miedo.mp4; se reutiliza tal cual.
        src: "./assets/videos/video-miedo.mp4"
      }
    ]
  },
  {
    id: "animaciones",
    name: "Animaciones",
    type: "folder",
    icon: "anim",
    children: []
  },
  {
    id: "hobbies",
    name: "My Hobbies",
    type: "folder",
    icon: "hobbies",
    children: [
      { id: "mi-musica", name: "Mi Musica", type: "folder", icon: "music", children: [] },
      { id: "dibujos",   name: "Dibujos",   type: "folder", icon: "draw",  children: [] },
      { id: "fotos",     name: "Fotos",     type: "folder", icon: "photo", children: [] }
    ]
  }
];
