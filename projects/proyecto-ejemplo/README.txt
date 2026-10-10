==================================================
 RITMO · Tablero semanal
 Documentación del proyecto de ejemplo
==================================================

1. NOMBRE Y DESCRIPCIÓN
-----------------------
Nombre:  Ritmo
Tipo:    Sitio web de una sola página (aplicación de tareas)
Estado:  Ejemplo para el portafolio

Ritmo es un tablero sencillo para anotar las tareas de la semana,
darles una prioridad y ver cuánto se ha avanzado. Funciona en el
navegador, sin cuentas ni servidor.


2. PROBLEMA O NECESIDAD
-----------------------
Muchas aplicaciones de tareas piden registro, tienen decenas de
opciones y terminan abandonadas. Quien solo necesita recordar "qué
toca hacer hoy" pierde más tiempo configurando que trabajando.


3. OBJETIVO
-----------
Ofrecer una herramienta mínima y rápida:
  - Anotar una tarea en menos de cinco segundos.
  - Ver de un vistazo qué falta y cuánto se lleva avanzado.
  - No perder nada al cerrar la página.


4. FUNCIONALIDADES
------------------
  [x] Agregar tareas con prioridad alta, media o baja.
  [x] Marcar tareas como hechas (y volver a desmarcarlas).
  [x] Eliminar una tarea.
  [x] Filtrar por: todas, pendientes o hechas.
  [x] Contador y barra de progreso ("2 de 5 completadas").
  [x] Botón "Limpiar hechas" para borrar las terminadas.
  [x] Guardado automático en el navegador (localStorage).
  [x] Diseño adaptable y navegación con teclado.


5. TECNOLOGÍAS UTILIZADAS
-------------------------
  - HTML5 semántico
  - CSS3 (variables, flexbox, animaciones suaves)
  - JavaScript sin librerías ni frameworks
  - localStorage para guardar los datos

No usa dependencias externas ni fuentes descargadas: funciona
también sin conexión.


6. ESTRUCTURA BÁSICA DE ARCHIVOS
--------------------------------
  projects/
  └── proyecto-ejemplo/
      ├── README.txt        Esta documentación (Bloc de notas)
      └── site/
          ├── index.html    Estructura de la página
          ├── style.css     Estilos
          └── app.js        Lógica del tablero

  El portafolio conecta todo desde un solo lugar:
  js/explorer-data.js  (el elemento "Proyecto de ejemplo")


7. CÓMO SUSTITUIR EL EJEMPLO POR UN PROYECTO REAL
-------------------------------------------------
  1. Crea la carpeta  projects/mi-proyecto/  con dos cosas dentro:
       - README.txt              tu documentación
       - site/index.html         tu página (con su css y js)

  2. Abre  js/explorer-data.js  y busca el elemento del proyecto
     (o copia uno y pégalo dentro de la carpeta que quieras):

       {
         id: "mi-proyecto",
         name: "Mi proyecto",
         type: "project",
         docs: "./projects/mi-proyecto/README.txt",
         site: "./projects/mi-proyecto/site/index.html",
         address: "http://mi-proyecto.local"
       }

  3. Guarda. Al abrir "Mi proyecto" en el explorador se abrirán
     dos ventanas independientes: este Bloc de notas con tu
     README y el navegador con tu página.

  Notas:
  - "id" debe ser único en todo el explorador.
  - "address" es solo el texto de la barra de direcciones.
  - Las rutas de la página (css, js, imágenes) son relativas a
    su propio index.html, así que se pueden usar con normalidad.
  - Para ver este README hace falta abrir el portafolio desde un
    servidor (Live Server, Vercel, etc.), no con doble clic sobre
    index.html.
