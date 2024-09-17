document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const toggleButtons = document.querySelectorAll('.toggle-desc');
    const panels = document.querySelectorAll('.panel');
    const deleteButtons = document.querySelectorAll('.delete-task');

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

    deleteButtons.forEach(deleteButton => {
        deleteButton.addEventListener('click', async function() {
            const taskItem = this.closest('.task-item'); 
            const taskId = taskItem.getAttribute('data-task-id'); 

            if (!taskId) {
                console.error('Task ID not found');
                return;
            }

            try {
                const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                const response = await fetch(`/tasks/delete/${taskId}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': csrfToken
                    }
                });

                const data = await response.json();

                if (response.status === 200) {
                    taskItem.remove();
                    alert('Task deleted successfully');
                } else {
                    alert(data.error || 'Error deleting task');
                }
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Something went wrong while deleting the task.');
            }
        });
    });

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
                                </div>
                            </div>
                            <div class="task-desc-full" style="display: none;">
                                <p>${task.description}</p>
                            </div>
                        `;

                        panel.innerHTML += taskHTML;
                    });

                }
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
            });
    }

    ['work', 'personal', 'education', 'management', 'marketing_sales', 'customer_support'].forEach(category => {
        populateTasks(category);  
    });

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