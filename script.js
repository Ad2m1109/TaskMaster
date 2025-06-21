document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const newTaskInput = document.getElementById('new-task');
    const taskCategorySelect = document.getElementById('task-category');
    const taskDueDateInput = document.getElementById('task-due-date');
    const taskPrioritySelect = document.getElementById('task-priority');
    const taskList = document.getElementById('task-list');
    const taskCount = document.getElementById('task-count');
    const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');
    const filterCategorySelect = document.getElementById('filter-category');
    const sortTasksSelect = document.getElementById('sort-tasks');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const errorMessage = document.getElementById('error-message');

    let tasks = [];
    let editingTaskId = null;

    // Generate UUID for tasks
    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    // Load tasks and dark mode state
    loadTasks();
    loadDarkMode();

    // Form submission
    taskForm.addEventListener('submit', e => {
        e.preventDefault();
        const taskText = newTaskInput.value.trim();
        const category = taskCategorySelect.value;
        const dueDate = taskDueDateInput.value;
        const priority = taskPrioritySelect.value;

        if (taskText === '') {
            showError('Task description cannot be empty.');
            return;
        }

        if (editingTaskId) {
            updateTask(editingTaskId, taskText, category, dueDate, priority);
            editingTaskId = null;
        } else {
            addTask(taskText, category, dueDate, priority);
        }

        newTaskInput.value = '';
        taskDueDateInput.value = '';
        errorMessage.style.display = 'none';
        saveTasks();
        renderTasks();
    });

    // Add task
    function addTask(text, category, dueDate, priority, isChecked = false) {
        const task = {
            id: generateUUID(),
            text,
            category,
            dueDate,
            priority,
            checked: isChecked
        };
        tasks.push(task);
    }

    // Update task
    function updateTask(id, text, category, dueDate, priority) {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, text, category, dueDate, priority } : task
        );
    }

    // Render tasks
    function renderTasks() {
        taskList.innerHTML = '';
        let filteredTasks = tasks;

        // Filter by category
        const filterCategory = filterCategorySelect.value;
        if (filterCategory !== 'All') {
            filteredTasks = tasks.filter(task => task.category === filterCategory);
        }

        // Sort tasks
        const sortOption = sortTasksSelect.value;
        if (sortOption === 'due-date') {
            filteredTasks.sort((a, b) => (a.dueDate || '9999-12-31') > (b.dueDate || '9999-12-31') ? 1 : -1);
        } else if (sortOption === 'priority') {
            const priorityOrder = { High: 1, Medium: 2, Low: 3 };
            filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        }

        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.checked ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;

            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.checked ? 'checked' : ''} aria-label="Mark task as complete">
                <input type="text" class="task-text" value="${task.text.replace(/"/g, '&quot;')}" readonly aria-label="Task description">
                <span class="task-category">${task.category}</span>
                <span class="task-due-date">${task.dueDate || 'No due date'}</span>
                <span class="task-priority">${task.priority}</span>
                <button class="delete-btn" aria-label="Delete task">🗑️</button>
            `;

            taskList.appendChild(taskItem);

            // Checkbox handler
            const checkbox = taskItem.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => {
                task.checked = checkbox.checked;
                taskItem.classList.toggle('completed', task.checked);
                saveTasks();
                updateTaskCount();
            });

            // Edit handler
            const taskTextInput = taskItem.querySelector('.task-text');
            taskTextInput.addEventListener('dblclick', () => {
                taskTextInput.removeAttribute('readonly');
                taskTextInput.focus();
            });
            taskTextInput.addEventListener('blur', saveEdit);
            taskTextInput.addEventListener('keypress', e => {
                if (e.key === 'Enter') {
                    taskTextInput.blur();
                }
            });

            function saveEdit() {
                const newText = taskTextInput.value.trim();
                if (newText === '') {
                    alert('Task description cannot be empty.');
                    taskTextInput.value = task.text;
                } else {
                    task.text = newText;
                    taskTextInput.setAttribute('readonly', true);
                    saveTasks();
                }
            }

            // Delete handler
            taskItem.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this task?')) {
                    tasks = tasks.filter(t => t.id !== task.id);
                    saveTasks();
                    renderTasks();
                }
            });
        });

        updateTaskCount();
    }

    // Update task count
    function updateTaskCount() {
        taskCount.textContent = `Total Tasks: ${taskList.children.length}`;
    }

    // Show error
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Load tasks from localStorage
    function loadTasks() {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        renderTasks();
    }

    // Dark mode toggle
    toggleDarkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        toggleDarkModeBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Load dark mode state
    function loadDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            toggleDarkModeBtn.textContent = '☀️';
        }
    }

    // Filter and sort handlers
    filterCategorySelect.addEventListener('change', renderTasks);
    sortTasksSelect.addEventListener('change', renderTasks);

    // Clear all tasks
    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all tasks?')) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    });
});