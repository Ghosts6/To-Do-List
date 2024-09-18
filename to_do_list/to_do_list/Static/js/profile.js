document.addEventListener('DOMContentLoaded', function() {
    const csrfToken = getCookie('csrftoken');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const toggleButtons = document.querySelectorAll('.toggle-desc');
    const panels = document.querySelectorAll('.panel');

    tabButtons.forEach((button) => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));

            button.classList.add('active');
            const category = button.getAttribute('data-category');
            document.getElementById(category).classList.add('active');
        });
    });

    toggleButtons.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const taskItem = this.closest('.task-item');
            const fullDescription = taskItem.nextElementSibling; 

            if (fullDescription.style.display === 'none' || fullDescription.style.display === '') {
                fullDescription.style.display = 'block';
                this.classList.remove('fa-chevron-down');
                this.classList.add('fa-chevron-up'); 
            } else {
                fullDescription.style.display = 'none';
                this.classList.remove('fa-chevron-up');
                this.classList.add('fa-chevron-down'); 
            }
        });
    });

    document.getElementById('create-task-form').addEventListener('submit', handleSubmit);

    async function handleSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const title = form.querySelector('input[type="text"]').value.trim();
        const category = form.querySelector('select').value;
        const description = form.querySelector('textarea').value.trim();

        if (!title || !category || !description) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'All fields are required!',
            });
            return;
        }

        const taskData = {
            title: title,
            category: category,
            description: description
        };

        fetch('/tasks/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(taskData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error,
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Task Created',
                    text: 'Your task was created successfully!',
                });
                form.reset();
                populateTasks(category);
            }
        })
        .catch(error => {
            console.error('Error creating task:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong while creating the task.',
            });
        });
    }

    function populateTasks(category) {
        fetch(`/tasks/?category=${category}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const panel = document.getElementById(category);
                panel.innerHTML = '';  

                const tasks = data.tasks;

                if (tasks.length === 0) {
                    panel.innerHTML = '<div>No tasks available in this category.</div>';
                } else {
                    tasks.forEach(task => {
                        const taskHTML = `
                            <div class="task-item" data-task-id="${task.id}">
                                <div class="task-left">
                                    <i class="fas fa-tasks task-icon"></i>
                                    <h3 class="task-title">${task.title}</h3>
                                    <p class="task-desc-short">${task.description.substring(0, 50)}...</p>
                                </div>
                                <div class="task-status">
                                    <span>${task.status.replace('_', ' ')}</span>
                                </div>
                                <div class="task-actions">
                                    <i class="fas fa-edit edit-task" title="Edit Task"></i>
                                    <i class="fas fa-trash delete-task" title="Delete Task"></i>
                                    <i class="fas fa-chevron-down toggle-desc" title="Expand"></i>
                                    <i class="fas fa-check-circle confirm-task" style="display: none;" title="Confirm Changes"></i>
                                    <i class="fas fa-times-circle discard-task" style="display: none;" title="Discard Changes"></i>
                                </div>
                            </div>
                            <div class="task-desc-full" style="display: none;">
                                <p>${task.description}</p>
                            </div>
                        `;

                        panel.innerHTML += taskHTML;
                    });

                    attachTaskEventListeners();
                }
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
            });
    }

    function attachTaskEventListeners() {
        const deleteButtons = document.querySelectorAll('.delete-task');
        const editButtons = document.querySelectorAll('.edit-task');
        const confirmButtons = document.querySelectorAll('.confirm-task');
        const discardButtons = document.querySelectorAll('.discard-task');
        const toggleButtons = document.querySelectorAll('.toggle-desc');

        deleteButtons.forEach(deleteButton => {
            deleteButton.addEventListener('click', async function() {
                const taskItem = this.closest('.task-item');
                const taskId = taskItem.getAttribute('data-task-id');

                if (!taskId) {
                    console.error('Task ID not found');
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Task ID not found!',
                    });
                    return;
                }

                try {
                    const csrfToken = getCookie('csrftoken'); 

                    const response = await fetch(`/tasks/${taskId}/delete/`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': csrfToken,  
                        },
                    });

                    const data = await response.json();

                    if (response.status === 200) {
                        taskItem.remove();  

                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'Task deleted successfully.',
                            timer: 1500,  
                            showConfirmButton: false,
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.error || 'Error deleting task',
                        });
                    }
                } catch (error) {
                    console.error('Error deleting task:', error);

                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Something went wrong while deleting the task.',
                    });
                }
            });
        });

        editButtons.forEach(editButton => {
            editButton.addEventListener('click', function() {
                const taskItem = this.closest('.task-item');
                enableEditMode(taskItem);
            });
        });

        confirmButtons.forEach(confirmButton => {
            confirmButton.addEventListener('click', function() {
                const taskItem = this.closest('.task-item');
                confirmChanges(taskItem);
            });
        });

        discardButtons.forEach(discardButton => {
            discardButton.addEventListener('click', function() {
                const taskItem = this.closest('.task-item');
                discardChanges(taskItem);
            });
        });

        toggleButtons.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const taskItem = this.closest('.task-item');
                const fullDescription = taskItem.nextElementSibling;

                if (fullDescription.style.display === 'none' || fullDescription.style.display === '') {
                    fullDescription.style.display = 'block';
                    this.classList.remove('fa-chevron-down');
                    this.classList.add('fa-chevron-up');
                } else {
                    fullDescription.style.display = 'none';
                    this.classList.remove('fa-chevron-up');
                    this.classList.add('fa-chevron-down');
                }
            });
        });
    }

    ['work', 'personal', 'education', 'management', 'marketing_sales', 'customer_support'].forEach(category => {
        populateTasks(category);  
    });

    function enableEditMode(taskItem) {
        taskItem.querySelector('.fa-edit').style.display = 'none';
        taskItem.querySelector('.fa-trash').style.display = 'none';
        taskItem.querySelector('.fa-chevron-down').style.display = 'none';
        taskItem.querySelector('.confirm-task').style.display = 'inline-block';
        taskItem.querySelector('.discard-task').style.display = 'inline-block';

        const taskTitle = taskItem.querySelector('.task-title').textContent.trim();
        const taskDesc = taskItem.querySelector('.task-desc-short').textContent.trim().slice(0, -3);
        const taskStatus = taskItem.querySelector('.task-status span').textContent.trim().toLowerCase().replace(' ', '_');

        taskItem.querySelector('.task-title').innerHTML = `<input type="text" class="edit-input" value="${taskTitle}" required>`;
        taskItem.querySelector('.task-desc-short').innerHTML = `<textarea class="edit-input" required>${taskDesc}</textarea>`;

        taskItem.querySelector('.task-status span').innerHTML = `
            <select class="edit-select">
                <option value="pending" ${taskStatus === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="in_progress" ${taskStatus === 'in_progress' ? 'selected' : ''}>In Progress</option>
                <option value="completed" ${taskStatus === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
        `;
    }

    function confirmChanges(taskItem) {
        const taskId = taskItem.getAttribute('data-task-id');
        const titleInput = taskItem.querySelector('.task-title input');
        const descInput = taskItem.querySelector('.task-desc-short textarea');
        const statusSelect = taskItem.querySelector('.task-status select');

        if (!titleInput.value.trim() || !descInput.value.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Title and Description cannot be empty!',
            });
            return;
        }

        const updatedData = {
            title: titleInput.value.trim(),
            description: descInput.value.trim(),
            status: statusSelect.value,
        };

        fetch(`/tasks/${taskId}/update/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error,
                });
            } else {
                taskItem.querySelector('.task-title').innerText = updatedData.title;
                taskItem.querySelector('.task-desc-short').innerText = updatedData.description.substring(0, 50) + '...';
                taskItem.querySelector('.task-status span').innerText = updatedData.status.replace('_', ' ');

                taskItem.querySelector('.confirm-task').style.display = 'none';
                taskItem.querySelector('.discard-task').style.display = 'none';
                taskItem.querySelector('.fa-edit').style.display = 'inline-block';
                taskItem.querySelector('.fa-trash').style.display = 'inline-block';
                taskItem.querySelector('.fa-chevron-down').style.display = 'inline-block';

                Swal.fire({
                    icon: 'success',
                    title: 'Task Updated',
                    text: 'Your task was updated successfully!',
                });
            }
        })
        .catch(error => {
            console.error('Error updating task:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong while updating the task.',
            });
        });
    }

    function discardChanges(taskItem) {
        const originalTitle = taskItem.querySelector('.task-title input').value;
        const originalDesc = taskItem.querySelector('.task-desc-short textarea').value;
        const originalStatus = taskItem.querySelector('.task-status select').value;

        taskItem.querySelector('.task-title').innerHTML = originalTitle;
        taskItem.querySelector('.task-desc-short').innerHTML = originalDesc.substring(0, 50) + '...';
        taskItem.querySelector('.task-status span').innerHTML = originalStatus.replace('_', ' ');

        taskItem.querySelector('.confirm-task').style.display = 'none';
        taskItem.querySelector('.discard-task').style.display = 'none';
        taskItem.querySelector('.fa-edit').style.display = 'inline-block';
        taskItem.querySelector('.fa-trash').style.display = 'inline-block';
        taskItem.querySelector('.fa-chevron-down').style.display = 'inline-block';
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    function checkAuthenticated() {
        fetch('/check_authenticated/')
            .then(response => response.json())
            .then(data => {
                if (data.is_authenticated) {
                    fetch('/get_user_profile/')
                        .then(response => response.json())
                        .then(userData => {
                            const loginStatusDiv = document.getElementById('login-status');
                            loginStatusDiv.innerHTML = `
                                <div class="username-logout">
                                    <span>Welcome:${userData.username}</span>
                                    <button class="logout-btn" id="logout-button">Log Out</button>
                                </div>`;
                            document.getElementById('logout-button').addEventListener('click', handleLogout);
                        });
                } else {
                    const loginButton = document.getElementById('login-button');
                    loginButton.innerText = 'Log In';
                    loginButton.addEventListener('click', function() {
                        window.location.href = "../login";
                    });
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function handleLogout() {
        fetch("/logout/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            }
        })
        .then(response => {
            if (response.ok) {
                window.location.href = "../home";
            } else {
                console.error("Logout failed");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
    }

    checkAuthenticated();

});