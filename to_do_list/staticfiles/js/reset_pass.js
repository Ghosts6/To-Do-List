document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submit-btn');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const newPasswordLockIcon = document.getElementById('N-lock');
    const confirmPasswordLockIcon = document.getElementById('C-lock');

    const getCookie = (name) => {
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
    };

    // Toggle visibility of password
    function togglePasswordVisibility(inputField, icon) {
        icon.addEventListener('click', function() {
            if (inputField.type === 'password') {
                inputField.type = 'text';
                icon.classList.remove('fa-lock');
                icon.classList.add('fa-lock-open');
            } else {
                inputField.type = 'password';
                icon.classList.remove('fa-lock-open');
                icon.classList.add('fa-lock');
            }
        });
    }

    togglePasswordVisibility(newPasswordInput, newPasswordLockIcon);
    togglePasswordVisibility(confirmPasswordInput, confirmPasswordLockIcon);

    submitButton.addEventListener('click', function(event) {
        event.preventDefault();

        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (newPassword.length < 8 || newPassword.length > 40) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Password',
                text: 'Password length must be between 8 and 40 characters',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Password Mismatch',
                text: 'New password and confirmation password do not match',
            });
            return;
        }

        const uidb64 = window.location.pathname.split('/')[2];
        const token = window.location.pathname.split('/')[3];

        fetch(`/reset_pass_api/${uidb64}/${token}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                new_password: newPassword,
                confirm_password: confirmPassword
            })
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
                    title: 'Password Reset',
                    text: 'Your password has been successfully reset.',
                }).then(() => {
                    window.location.href = '../login';
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while resetting your password.',
            });
        });
    });
});
