// Ritmo · lógica del tablero de tareas (JavaScript vanilla, sin librerías).
// Las tareas se guardan en localStorage; si el navegador lo bloquea, la página
// sigue funcionando y las tareas viven solo mientras la página esté abierta.

(function () {
  "use strict";

  var STORAGE_KEY = "ritmo-tareas-v1";
  var PRIORITY_LABEL = { high: "Alta", medium: "Media", low: "Baja" };

  var form = document.getElementById("task-form");
  var input = document.getElementById("task-text");
  var select = document.getElementById("task-priority");
  var list = document.getElementById("task-list");
  var empty = document.getElementById("empty");
  var counter = document.getElementById("counter");
  var progress = document.getElementById("progress");
  var progressBar = document.getElementById("progress-bar");
  var clearDone = document.getElementById("clear-done");
  var filterButtons = document.querySelectorAll(".filter");

  var tasks = load();
  var filter = "all";

  // ---------- Almacenamiento ----------
  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) return saved;
    } catch (err) { /* sin almacenamiento o datos dañados */ }

    // Tareas de ejemplo la primera vez que se abre la página.
    return [
      { id: 1, text: "Revisar el correo de la mañana", priority: "low", done: true },
      { id: 2, text: "Preparar la presentación del jueves", priority: "high", done: false },
      { id: 3, text: "Llamar al dentista", priority: "medium", done: false }
    ];
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (err) { /* ignorar */ }
  }

  // ---------- Dibujo ----------
  function visibleTasks() {
    return tasks.filter(function (task) {
      if (filter === "pending") return !task.done;
      if (filter === "done") return task.done;
      return true;
    });
  }

  function render() {
    list.replaceChildren();

    visibleTasks().forEach(function (task) {
      list.append(taskElement(task));
    });

    var doneCount = tasks.filter(function (task) { return task.done; }).length;
    var percent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

    counter.textContent = doneCount + " de " + tasks.length + " completadas";
    progressBar.style.width = percent + "%";
    progress.setAttribute("aria-valuenow", String(percent));
    clearDone.hidden = doneCount === 0;

    var messages = {
      all: "Todavía no hay tareas. ¡Agrega la primera!",
      pending: "No tienes tareas pendientes. ¡Buen trabajo!",
      done: "Aún no has completado ninguna tarea."
    };
    empty.textContent = messages[filter];
    empty.hidden = list.children.length > 0;
  }

  // Las tareas se construyen con textContent: lo que escriba el usuario nunca se interpreta como HTML.
  function taskElement(task) {
    var item = document.createElement("li");
    item.className = "task" + (task.done ? " is-done" : "");
    item.dataset.id = task.id;

    var label = document.createElement("label");
    label.className = "task-label";

    var check = document.createElement("input");
    check.type = "checkbox";
    check.className = "task-check";
    check.checked = task.done;

    var box = document.createElement("span");
    box.className = "task-box";

    var text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    label.append(check, box, text);

    var tag = document.createElement("span");
    tag.className = "tag tag-" + task.priority;
    tag.textContent = PRIORITY_LABEL[task.priority] || "Media";

    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete";
    remove.setAttribute("aria-label", "Eliminar tarea");
    remove.textContent = "×";

    item.append(label, tag, remove);
    return item;
  }

  // ---------- Eventos ----------
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var text = input.value.trim();
    if (!text) return;

    tasks.unshift({ id: Date.now(), text: text, priority: select.value, done: false });
    input.value = "";
    save();
    render();
    input.focus();
  });

  // Un solo listener para todas las tareas (delegación de eventos).
  list.addEventListener("change", function (event) {
    var item = event.target.closest(".task");
    if (!item || !event.target.classList.contains("task-check")) return;

    var task = tasks.find(function (t) { return String(t.id) === item.dataset.id; });
    if (task) task.done = event.target.checked;
    save();
    render();
  });

  list.addEventListener("click", function (event) {
    var button = event.target.closest(".delete");
    var item = button && button.closest(".task");
    if (!item) return;

    tasks = tasks.filter(function (t) { return String(t.id) !== item.dataset.id; });
    save();
    render();
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filter = button.dataset.filter;
      filterButtons.forEach(function (other) {
        other.classList.toggle("is-active", other === button);
      });
      render();
    });
  });

  clearDone.addEventListener("click", function () {
    tasks = tasks.filter(function (task) { return !task.done; });
    save();
    render();
  });

  render();
})();
