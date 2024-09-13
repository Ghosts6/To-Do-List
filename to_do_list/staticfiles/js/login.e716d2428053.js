document.addEventListener("DOMContentLoaded", function() {
    const signInBtn = document.getElementById('signIn');
    const signUpBtn = document.getElementById('signUp');
    const container = document.querySelector('.container');

    if (signInBtn && signUpBtn && container) {
        signInBtn.addEventListener('click', () => {
            container.classList.remove('right-panel-active');
        });

        signUpBtn.addEventListener('click', () => {
            container.classList.add('right-panel-active');
        });
    } else {
        console.error('Elements with IDs signInBtn, signUpBtn, or the container were not found.');
    }

    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(this);

        if (!validateLoginForm(formData)) {
            return;
        }

        try {
            const response = await fetch('/login_api/', {
                method: 'POST',
                body: formData,
                headers: {
                    "X-CSRFToken": getCookie('csrftoken')
                }
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();

            showAlert('success', 'Operation Successful', 'Login successful!');

            if (data.is_superuser) {
                window.location.href = '/admin/';
            } else {
                window.location.href = '/home/';
            }
        } catch (error) {
            console.error('Error:', error);

            if (error.message.includes('Account locked')) {
                showAlert('error', 'Error', 'Your account has been locked for 5 minutes due to too many failed login attempts.', 5000);
                setTimeout(function() {
                    window.location.href = '../locked';
                }, 5000);
            } else {
                showAlert('error', 'Error', 'Incorrect email or password');
            }
        }
    });

    document.getElementById('signUpForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(this);

        if (!validateSignupForm(formData)) {
            return;
        }

        try {
            const response = await fetch('/signup_api/', {
                method: 'POST',
                body: formData,
                headers: {
                    "X-CSRFToken": getCookie('csrftoken')
                }
            });

            if (!response.ok) {
                throw new Error('Signup failed');
            }

            const data = await response.json();

            if (data.success) {
                showAlert('success', 'Operation Successful', 'Signup successful!');
                window.location.href = '/home/';
            } else {
                showAlert('error', 'Error', data.message || 'Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('error', 'Error', 'Signup failed. Please try again.');
        }
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

    function showAlert(icon, title, text) {
        Swal.fire({
            icon: icon,
            title: title,
            text: text,
            showConfirmButton: true
        });
    }

    function validateLoginForm(formData) {
        const username = formData.get('username'); 
        const password = formData.get('password'); 

        if (!username || !password) {
            showAlert('error', 'Error', 'Please fill out all fields.');
            return false;
        }
        return true;
    }

    function validateSignupForm(formData) {
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm_password');

        if (!username || !email || !password || !confirmPassword) {
            showAlert('error', 'Error', 'Please fill out all fields.');
            return false;
        }

        if (!validateEmail(email)) {
            showAlert('error', 'Error', 'Please enter a valid email address.');
            return false;
        }

        if (password !== confirmPassword) {
            showAlert('error', 'Error', 'Passwords do not match.');
            return false;
        }

        if (!validatePassword(password)) {
            showAlert('error', 'Error', 'Password must be at least 8 characters and include letters.');
            return false;
        }

        return true;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        return password.length >= 8 && /[a-zA-Z]/.test(password);
    }

    document.getElementById('passwordSignup').addEventListener('input', toggleSLockIcon);
    document.getElementById('confirmPasswordSignup').addEventListener('input', toggleCLockIcon);
    document.getElementById('loginPassword').addEventListener('input', toggleLLockIcon);

    function toggleSLockIcon() {
        const passwordInput = document.getElementById('passwordSignup');
        const sLockIcon = document.getElementById('S-lock');

        if (passwordInput.value.trim() !== '') {
            sLockIcon.style.display = 'block';
        } else {
            sLockIcon.style.display = 'none';
            resetLockIcon('S-lock');
        }
    }

    function toggleCLockIcon() {
        const confirmPasswordInput = document.getElementById('confirmPasswordSignup');
        const cLockIcon = document.getElementById('C-lock');

        if (confirmPasswordInput.value.trim() !== '') {
            cLockIcon.style.display = 'block';
        } else {
            cLockIcon.style.display = 'none';
            resetLockIcon('C-lock');
        }
    }

    function toggleLLockIcon() {
        const loginPasswordInput = document.getElementById('loginPassword');
        const lLockIcon = document.getElementById('L-lock');

        if (loginPasswordInput.value.trim() !== '') {
            lLockIcon.style.display = 'block';
        } else {
            lLockIcon.style.display = 'none';
            resetLockIcon('L-lock');
        }
    }

    document.getElementById('S-lock').addEventListener('click', togglePasswordVisibility.bind(null, 'passwordSignup', 'S-lock'));
    document.getElementById('C-lock').addEventListener('click', togglePasswordVisibility.bind(null, 'confirmPasswordSignup', 'C-lock'));
    document.getElementById('L-lock').addEventListener('click', togglePasswordVisibility.bind(null, 'loginPassword', 'L-lock'));

    function togglePasswordVisibility(inputId, lockIconId) {
        const passwordInput = document.getElementById(inputId);
        const lockIcon = document.getElementById(lockIconId);

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            lockIcon.classList.remove('fa-lock');
            lockIcon.classList.add('fa-lock-open');
        } else {
            passwordInput.type = 'password';
            lockIcon.classList.remove('fa-lock-open');
            lockIcon.classList.add('fa-lock');
        }
    }

    function resetLockIcon(lockIconId) {
        const lockIcon = document.getElementById(lockIconId);
        lockIcon.classList.remove('fa-lock-open');
        lockIcon.classList.add('fa-lock');
    }

    function resetAllLockIcons() {
        const lockIconMappings = {
            'S-lock': 'passwordSignup',
            'C-lock': 'confirmPasswordSignup',
            'L-lock': 'loginPassword'
        };

        Object.keys(lockIconMappings).forEach(lockIconId => {
            const passwordInputId = lockIconMappings[lockIconId];
            const passwordInput = document.getElementById(passwordInputId);

            if (passwordInput.type === 'text') {
                passwordInput.type = 'password';
            }

            resetLockIcon(lockIconId);
        });
    }
});