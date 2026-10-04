const todo = document.querySelector("#todo");
const progress = document.querySelector("#progress");
const done = document.querySelector("#done");
const columns = [todo, progress, done];
const storageKey = "kanbanTasks";

let dragElement = null;

function createTaskId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function updateCounts() {
  columns.forEach(column => {
    const count = column.querySelector(".count");
    count.innerText = column.querySelectorAll(".task").length;
  });
}

function saveTasks() {
  const tasks = columns.flatMap(column =>
    [...column.querySelectorAll(".task")].map(task => ({
      id: task.dataset.id,
      title: task.querySelector("h2").innerText,
      description: task.querySelector("p").innerText,
      column: column.id
    }))
  );

  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function createTaskElement(task) {
  const taskElement = document.createElement("div");
  taskElement.className = "task";
  taskElement.draggable = true;
  taskElement.dataset.id = task.id;

  const title = document.createElement("h2");
  title.innerText = task.title;

  const description = document.createElement("p");
  description.innerText = task.description;

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.addEventListener("click", () => {
    taskElement.remove();
    updateCounts();
    saveTasks();
  });

  taskElement.append(title, description, deleteButton);
  taskElement.addEventListener("dragstart", () => {
    dragElement = taskElement;
  });

  return taskElement;
}

function getStoredTasks() {
  const storedTasks = localStorage.getItem(storageKey);
  if (!storedTasks) return null;

  try {
    const tasks = JSON.parse(storedTasks);
    return Array.isArray(tasks) ? tasks : null;
  } catch (error) {
    console.error("Unable to read saved tasks.", error);
    return null;
  }
}

function loadTasks() {
  const storedTasks = getStoredTasks();
  const tasks = storedTasks || [...todo.querySelectorAll(".task")].map(task => ({
    id: createTaskId(),
    title: task.querySelector("h2").innerText,
    description: task.querySelector("p").innerText,
    column: "todo"
  }));

  document.querySelectorAll(".task").forEach(task => task.remove());
  tasks.forEach(task => {
    const column = document.querySelector(`#${task.column}`) || todo;
    column.appendChild(createTaskElement(task));
  });

  updateCounts();
  if (!storedTasks) saveTasks();
}

function addDragEvents(column) {
  column.addEventListener("dragenter", event => {
    event.preventDefault();
    column.classList.add("hover-over");
  });

  column.addEventListener("dragleave", () => {
    column.classList.remove("hover-over");
  });

  column.addEventListener("dragover", event => {
    event.preventDefault();
  });

  column.addEventListener("drop", event => {
    event.preventDefault();
    if (!dragElement) return;

    column.appendChild(dragElement);
    column.classList.remove("hover-over");
    updateCounts();
    saveTasks();
    dragElement = null;
  });
}

columns.forEach(addDragEvents);

const toggleModalButton = document.querySelector("#toggle-modal");
const modal = document.querySelector(".modal");
const modalBg = document.querySelector(".modal .bg");
const addTaskButton = document.querySelector("#add-new-task");
const taskTitleInput = document.querySelector("#task-title-input");
const taskDescInput = document.querySelector("#task-desc-input");

toggleModalButton.addEventListener("click", () => {
  modal.classList.toggle("active");
});

modalBg.addEventListener("click", () => {
  modal.classList.remove("active");
});

addTaskButton.addEventListener("click", () => {
  const taskTitle = taskTitleInput.value.trim();
  const taskDesc = taskDescInput.value.trim();

  if (!taskTitle) return;

  todo.appendChild(createTaskElement({
    id: createTaskId(),
    title: taskTitle,
    description: taskDesc,
    column: "todo"
  }));

  updateCounts();
  saveTasks();
  taskTitleInput.value = "";
  taskDescInput.value = "";
  modal.classList.remove("active");
});

loadTasks();
