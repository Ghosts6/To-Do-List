document.addEventListener('DOMContentLoaded', function() {
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

    const scrollToTopButton = document.getElementById('scrollToTopButton');
    
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