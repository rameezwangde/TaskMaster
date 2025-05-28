document.addEventListener("DOMContentLoaded", () => {
  // Initialize Flatpickr on #taskDate input
  flatpickr("#taskDate", {
    dateFormat: "Y-m-d",
    // allowInput: true, // optional if you want to allow typing date
  });

  const storedTasks = JSON.parse(localStorage.getItem("tasks"));
  if (storedTasks) {
    storedTasks.forEach((task) => tasks.push(task));
    updateTasksList();
    updateStats();
  }
});

let tasks = [];

const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

const addTask = () => {
  const taskInput = document.getElementById("taskInput");
  const dateInput = document.getElementById("taskDate");

  const text = taskInput.value.trim();
  const date = dateInput.value.trim();

  if (text) {
    tasks.push({ text: text, completed: false, date: date });

    updateTasksList();
    updateStats();
    saveTasks();

    // Clear inputs after adding
    taskInput.value = "";
    dateInput.value = "";
  }
  console.log(tasks);
};

const toggleTaskComplete = (index) => {
  tasks[index].completed = !tasks[index].completed;
  console.log({ tasks });
  updateTasksList();
  updateStats();
  saveTasks();
};

const deleteTask = (index) => {
  tasks.splice(index, 1);
  updateTasksList();
  updateStats();
  saveTasks();
};

const editTask = (index) => {
  const taskInput = document.getElementById("taskInput");
  const dateInput = document.getElementById("taskDate");

  taskInput.value = tasks[index].text;
  dateInput.value = tasks[index].date || "";
  tasks.splice(index, 1);
  updateTasksList();
  updateStats();
  saveTasks();
};
document.getElementById('clearAll').addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all tasks?")) {
        tasks = [];
        updateTasksList();
        updateStats();
        saveTasks();
    }
});

const updateStats = () => {
  const completeTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks === 0 ? 0 : (completeTasks / totalTasks) * 100;

  const progressBar = document.getElementById("progress");
  progressBar.style.width = `${progress}%`;

  document.getElementById("numbers").innerText = `${completeTasks}/${totalTasks}`;
  if (tasks.length && completeTasks === totalTasks) {
    blastConfetti();
  }
};

const updateTasksList = () => {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <div class="taskItem">
          <div class="task ${task.completed ? "completed" : ""}">
          <input type="checkbox" class="checkbox" ${
            task.completed ? "checked" : ""
          } />
          <p>${task.text}</p>
          ${
            task.date
              ? `<small style="margin-left:10px; font-size:0.85rem; color: var(--teal);">(${task.date})</small>`
              : ""
          }
          </div>
          <div class="icons">
              <img src="edit.png" onClick="editTask(${index})" />
              <img src="bin.png" onClick="deleteTask(${index})" />
          </div>
      </div>
      `;
    listItem.addEventListener("change", () => toggleTaskComplete(index));
    taskList.appendChild(listItem);
  });
};

document.getElementById("newTask").addEventListener("click", function (e) {
  e.preventDefault();

  addTask();
});
// AI Assistant command parser
document.getElementById('aiForm').addEventListener('submit', function(e){
  e.preventDefault();
  const input = document.getElementById('aiInput').value.trim();
  const responseEl = document.getElementById('aiResponse');

  if(!input){
    responseEl.innerText = "Please enter a command.";
    return;
  }

  // Simple commands parsing (case insensitive)
  const lowerInput = input.toLowerCase();

  if(lowerInput.startsWith('add ')){
    // Add command: add task text
    const taskText = input.slice(4).trim();
    if(taskText){
      tasks.push({text: taskText, completed: false, date: ""});
      saveTasks();
      updateTasksList();
      updateStats();
      responseEl.innerText = `Added task: "${taskText}"`;
      document.getElementById('aiInput').value = '';
    } else {
      responseEl.innerText = "Please specify the task to add.";
    }
  }
  else if(lowerInput.startsWith('delete ')){
    // Delete command: delete task number
    const numStr = input.slice(7).trim();
    const index = parseInt(numStr) - 1; // user task # is 1-based
    if(!isNaN(index) && index >=0 && index < tasks.length){
      const removed = tasks.splice(index,1)[0];
      saveTasks();
      updateTasksList();
      updateStats();
      responseEl.innerText = `Deleted task #${index+1}: "${removed.text}"`;
      document.getElementById('aiInput').value = '';
    } else {
      responseEl.innerText = "Invalid task number to delete.";
    }
  }
  else if(lowerInput.startsWith('edit ')){
    // Edit command: edit task_number new text
    // Format: "edit 2 buy fruits"
    const match = input.match(/^edit\s+(\d+)\s+(.+)$/i);
    if(match){
      const index = parseInt(match[1]) - 1;
      const newText = match[2].trim();
      if(!isNaN(index) && index >= 0 && index < tasks.length && newText){
        tasks[index].text = newText;
        saveTasks();
        updateTasksList();
        updateStats();
        responseEl.innerText = `Edited task #${index+1} to "${newText}"`;
        document.getElementById('aiInput').value = '';
      } else {
        responseEl.innerText = "Invalid edit command format or task number.";
      }
    } else {
      responseEl.innerText = "Please use format: edit [task number] [new task text]";
    }
  }
  else if(lowerInput === "show tasks"){
    // Show task list
    if(tasks.length === 0){
      responseEl.innerText = "No tasks to show.";
    } else {
      let list = tasks.map((t,i) => `${i+1}. ${t.text} ${t.completed ? "(Done)" : ""}`).join('\n');
      responseEl.innerText = list;
    }
  }
  else {
    responseEl.innerText = 'Unknown command. Try "Add", "Delete", "Edit", or "Show tasks".';
  }
});

const blastConfetti = () => {
  const count = 200,
    defaults = {
      origin: { y: 0.7 },
    };

  function fire(particleRatio, opts) {
    confetti(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
      })
    );
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};
