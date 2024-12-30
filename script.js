document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtn = document.getElementById('add-task-btn');
    const newTaskInput = document.getElementById('new-task');
    const taskCategorySelect = document.getElementById('task-category');
    const taskDueDateInput = document.getElementById('task-due-date');
    const taskPrioritySelect = document.getElementById('task-priority');
    const taskList = document.getElementById('task-list');
    const taskCount = document.getElementById('task-count');
    const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');

    // Load tasks from local storage
    loadTasks();

    addTaskBtn.addEventListener('click', () => {
        const taskText = newTaskInput.value.trim();
        const category = taskCategorySelect.value;
        const dueDate = taskDueDateInput.value;
        const priority = taskPrioritySelect.value;

        if (taskText !== '') {
            addTask(taskText, category, dueDate, priority);
            newTaskInput.value = '';
            taskDueDateInput.value = '';
            updateTaskCount();
            saveTaskToLocalStorage(taskText, category, dueDate, priority, false); // Save task to local storage with unchecked state
        }
    });

    function addTask(taskText, category, dueDate, priority, isChecked = false) {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <input type='checkbox' class='task-checkbox' ${isChecked ? 'checked' : ''}>
            <span contenteditable="true">${taskText}</span>
            <span class="task-category">${category}</span>
            <span class="task-due-date">${dueDate}</span>
            <span class="task-priority">${priority}</span>
            <button><img src="images/delete.png" width="35px" height="35px" ></button>
        `;
        taskList.appendChild(taskItem);

        const deleteBtn = taskItem.querySelector('button');
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                taskList.removeChild(taskItem);
                removeTaskFromLocalStorage(taskText); // Remove task from local storage
                updateTaskCount();
            }
        });

        const checkbox = taskItem.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                taskItem.querySelector('span').style.textDecoration = 'line-through';
                taskItem.classList.add('completed'); // Add a class for completed tasks
            } else {
                taskItem.querySelector('span').style.textDecoration = 'none';
                taskItem.classList.remove('completed'); // Remove the class for uncompleted tasks
            }
            updateTaskStateInLocalStorage(taskText, checkbox.checked); // Update checkbox state in local storage
        });

        // Update task on blur
        taskItem.querySelector('span[contenteditable="true"]').addEventListener('blur', () => {
            const updatedText = taskItem.querySelector('span[contenteditable="true"]').innerText;
            updateTaskInLocalStorage(taskText, updatedText, category, dueDate, priority);
            taskText = updatedText; // Update the taskText variable
        });

        updateTaskCount();
    }

    function updateTaskCount() {
        const totalTasks = taskList.children.length;
        taskCount.textContent = `Total Tasks: ${totalTasks}`;
    }

    // Function to save task to local storage
    function saveTaskToLocalStorage(taskText, category, dueDate, priority, isChecked) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push({ text: taskText, category: category, dueDate: dueDate, priority: priority, checked: isChecked });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Function to load tasks from local storage
    function loadTasks() {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            addTask(task.text, task.category, task.dueDate, task.priority, task.checked); // Pass the checked state
        });
    }

    // Function to update task in local storage
    function updateTaskInLocalStorage(oldText, newText, category, dueDate, priority) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.map(task => {
            if (task.text === oldText) {
                return { text: newText, category: category, dueDate: dueDate, priority: priority, checked: task.checked };
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Function to remove task from local storage
    function removeTaskFromLocalStorage(taskText) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => task.text !== taskText);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Dark Mode Toggle
    toggleDarkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
});