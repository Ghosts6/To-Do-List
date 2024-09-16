document.addEventListener('DOMContentLoaded', function() {
    const csrfToken = getCookie('csrftoken');
    const form = document.querySelector('.form');
    const submitButton = document.querySelector('.submit');
    const scrollToTopButton = document.getElementById('scrollToTopButton');

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
   
    async function checkAuthenticated() {
        try {
            const response = await fetch('/check_authenticated/');
            const data = await response.json();
            const loginStatusDiv = document.getElementById('login-status');

            if (data.is_authenticated) {
                const userProfileResponse = await fetch('/get_user_profile/');
                const userData = await userProfileResponse.json();
                
                loginStatusDiv.innerHTML = `
                    <div class="username-logout">
                        <span>Welcome: ${userData.username}</span>
                        <button class="logout-btn" id="logout-button">Log Out</button>
                    </div>`;
                
                document.getElementById('logout-button').addEventListener('click', handleLogout);
                return true;
            } else {
                const loginButton = document.getElementById('login-button');
                if (loginButton) {
                    loginButton.innerText = 'Log In';
                    loginButton.addEventListener('click', function() {
                        window.location.href = "../login";
                    });
                }
                return false; 
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
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
            console.error("Error during logout:", error);
        });
    }

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

        const isAuthenticated = await checkAuthenticated();

        if (!isAuthenticated) {
            window.location.href = '../login';
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

    checkAuthenticated();
    form.addEventListener('submit', handleSubmit);

    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            scrollToTopButton.style.display = 'block';
        } else {
            scrollToTopButton.style.display = 'none';
        }
    });

    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

});

function scrollToDiv() {
    document.querySelector('#task').scrollIntoView({
         behavior: 'smooth'
    });
}