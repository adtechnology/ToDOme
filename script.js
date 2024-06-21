document.addEventListener('DOMContentLoaded', function() {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoDate = document.getElementById('todo-date');
    const todoCategory = document.getElementById('todo-category');
    const todoList = document.getElementById('todo-list');
    const modal = document.getElementById('todo-modal');
    const modalDescription = document.getElementById('modal-description');
    const subtaskForm = document.getElementById('subtask-form');
    const subtaskInput = document.getElementById('subtask-input');
    const subtaskList = document.getElementById('subtask-list');
    const saveBtn = document.getElementById('save-btn');
    const closeBtn = document.querySelector('.close-btn');
    const darkmodeToggle = document.getElementById('darkmode-toggle');
    let currentTodo = null;

    // Load theme from local storage or system preference
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
            document.body.classList.toggle('dark', savedTheme === 'dark');
            darkmodeToggle.checked = savedTheme === 'dark';
        } else {
            document.body.classList.toggle('dark', systemPrefersDark);
            darkmodeToggle.checked = systemPrefersDark;
        }
    }

    function saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    darkmodeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark');
        const newTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
        saveTheme(newTheme);
    });

    loadTheme();

    // Hide modal on load
    modal.style.display = 'none';

    // Load todos from local storage
    loadTodos();

    todoForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const newTodoText = todoInput.value;
        const newTodoDate = todoDate.value;
        const newTodoCategory = todoCategory.value;

        const newTodo = {
            text: newTodoText,
            date: newTodoDate,
            category: newTodoCategory,
            completed: false,
            description: '',
            subtasks: []
        };

        addTodoToDOM(newTodo);
        saveTodoToLocalStorage(newTodo);

        todoInput.value = '';
        todoDate.value = '';
        todoCategory.value = 'Work';
    });

    function addTodoToDOM(todo) {
        const newTodoElement = document.createElement('li');
        newTodoElement.classList.add(`category-${todo.category}`);
        if (todo.completed) {
            newTodoElement.classList.add('completed');
        }

        newTodoElement.innerHTML = `
            <input type="checkbox" class="complete-checkbox" ${todo.completed ? 'checked' : ''}>
            <span>${todo.text}</span>
            <span class="date">${todo.date}</span>
            <span>${todo.category}</span>
            <button class="delete-btn"><img src="https://img.icons8.com/material-outlined/24/000000/trash.png"/></button>
        `;

        newTodoElement.querySelector('.complete-checkbox').addEventListener('change', function() {
            todo.completed = !todo.completed;
            newTodoElement.classList.toggle('completed');
            updateTodoInLocalStorage(todo);
        });

        newTodoElement.querySelector('.delete-btn').addEventListener('click', function() {
            todoList.removeChild(newTodoElement);
            removeTodoFromLocalStorage(todo);
        });

        todoList.appendChild(newTodoElement);

        newTodoElement.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
                currentTodo = todo;
                modalDescription.value = todo.description;
                loadSubtasks(todo.subtasks);
                modal.style.display = 'flex';
            }
        });
    }

    function saveTodoToLocalStorage(todo) {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.push(todo);
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function loadTodos() {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.forEach(todo => {
            addTodoToDOM(todo);
        });
    }

    function updateTodoInLocalStorage(updatedTodo) {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const index = todos.findIndex(todo => todo.text === updatedTodo.text && todo.date === updatedTodo.date && todo.category === updatedTodo.category);
        if (index !== -1) {
            todos[index] = updatedTodo;
            localStorage.setItem('todos', JSON.stringify(todos));
        }
    }

    function removeTodoFromLocalStorage(todo) {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const updatedTodos = todos.filter(t => t.text !== todo.text || t.date !== todo.date || t.category !== todo.category);
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
    }

    subtaskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newSubtaskText = subtaskInput.value;

        if (currentTodo) {
            const newSubtask = {
                text: newSubtaskText,
                completed: false
            };

            currentTodo.subtasks.push(newSubtask);
            updateTodoInLocalStorage(currentTodo);
            addSubtaskToDOM(newSubtask);
            subtaskInput.value = '';
        }
    });

    function addSubtaskToDOM(subtask) {
        const subtaskElement = document.createElement('li');
        subtaskElement.innerHTML = `
            <input type="checkbox" class="complete-subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
            <span>${subtask.text}</span>
            <button class="delete-btn"><img src="https://img.icons8.com/material-outlined/24/000000/trash.png"/></button>
        `;

        subtaskElement.querySelector('.complete-subtask-checkbox').addEventListener('change', function() {
            subtask.completed = !subtask.completed;
            updateTodoInLocalStorage(currentTodo);
        });

        subtaskElement.querySelector('.delete-btn').addEventListener('click', function() {
            subtaskList.removeChild(subtaskElement);
            currentTodo.subtasks = currentTodo.subtasks.filter(t => t.text !== subtask.text);
            updateTodoInLocalStorage(currentTodo);
        });

        subtaskList.appendChild(subtaskElement);
    }

    function loadSubtasks(subtasks) {
        subtaskList.innerHTML = '';
        subtasks.forEach(subtask => {
            addSubtaskToDOM(subtask);
        });
    }

    saveBtn.addEventListener('click', function() {
        if (currentTodo) {
            currentTodo.description = modalDescription.value;
            updateTodoInLocalStorage(currentTodo);
            modal.style.display = 'none';
        }
    });

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
});