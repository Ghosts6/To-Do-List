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

    function fetchFaqs() {
        fetch('/faqs_api/')
            .then(response => response.json())
            .then(data => {
                const faqs = data.faqs;
                const faqContainer = document.getElementById('faqContainer');
                faqContainer.innerHTML = ''; 

                faqs.forEach(faq => {
                    const faqDiv = document.createElement('div');
                    faqDiv.classList.add('faq-container'); 

                    const questionDiv = document.createElement('div');
                    questionDiv.classList.add('question');
                    faqDiv.appendChild(questionDiv);

                    const questionHeader = document.createElement('h2');
                    questionHeader.textContent = faq.question;
                    questionDiv.appendChild(questionHeader);

                    const answerDiv = document.createElement('div');
                    answerDiv.classList.add('answer');
                    answerDiv.style.display = 'none';
                    faqDiv.appendChild(answerDiv);

                    const answerParagraph = document.createElement('p');
                    answerParagraph.textContent = faq.answer;
                    answerDiv.appendChild(answerParagraph);

                    const toggleIcon = document.createElement('i');
                    toggleIcon.classList.add('fas', 'fa-plus-circle', 'toggle-answer');
                    faqDiv.appendChild(toggleIcon);

                    faqContainer.appendChild(faqDiv);

                    toggleIcon.addEventListener('click', function() {
                        if (answerDiv.style.display === "block") {
                            answerDiv.style.display = "none";
                            toggleIcon.classList.replace('fa-minus-circle', 'fa-plus-circle');
                        } else {
                            answerDiv.style.display = "block";
                            toggleIcon.classList.replace('fa-plus-circle', 'fa-minus-circle');
                        }
                    });
                });

                if (faqs.length === 0) {
                    console.log("No FAQ items found.");
                }
            })
            .catch(error => console.error('Error:', error));
    }

    fetchFaqs();

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
                                    <span>Welcome, ${userData.username}</span>
                                    <button class="logout-btn" id="logout-button">Log Out</button>
                                </div>`;
                            document.getElementById('logout-button').addEventListener('click', handleLogout);
                        });
                } else {
                    const loginButton = document.getElementById('login-button');
                    loginButton.innerText = 'Log In';
                    loginButton.addEventListener('click', function() {
                        window.location.href = "{% url 'login' %}";
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
                window.location.href = "{% url 'home' %}";
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
