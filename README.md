![baner](https://github.com/Ghosts6/Local-website/blob/main/img/Baner.png)

# 📝 To-Do List App
Welcome to the To-Do List App! This project allows users to manage tasks with features for user authentication, task management, and more. It’s built with Django and includes automated testing with GitHub Actions.

## 🚀 Features
User Authentication: Sign up, log in, and manage user profiles.
Task Management: Create, update, and delete tasks with different statuses.
Password Management: Forgot password functionality with secure reset tokens.
FAQs: View and manage frequently asked questions.
Admin Panel: Accessible for managing users, tasks, and FAQs.

## 🛠️ Technologies Used
Django: Web framework for building the application.
Django REST Framework (DRF): For building RESTful APIs.
GitHub Actions: CI/CD for automated testing and deployment.
Bcrypt: For securely hashing passwords.
SQLite: Database used for development (can be changed to PostgreSQL or others for production).

## 📋 Getting Started
Prerequisites
Python 3.7, 3.8, or 3.9
pip (Python package installer)
Git

### Clone the Repository
To get started, clone the repository:
```sh
git clone https://github.com/yourusername/to_do_list.git
cd to_do_list
```
### Install Dependencies
Install the required packages:
```sh
python -m pip install --upgrade pip
pip install -r requirements.txt
```
### Run Migrations
Apply the initial migrations to set up the database:
```sh
python manage.py migrate
```
### Create a Superuser
Create a superuser account to access the Django admin panel:
```sh
python manage.py createsuperuser
```
### Run the Development Server
Start the Django development server:
```sh
python manage.py runserver
```
Visit http://127.0.0.1:8000 in your web browser to see the application in action.

## 🔧 GitHub Actions Workflow
This project includes a GitHub Actions workflow for continuous integration. The workflow runs tests on push and pull request events.

Workflow File
The configuration is located in .github/workflows/django.yml. It performs the following steps:

Check Out Code: Retrieves the latest code from the repository.
Set Up Python: Configures the Python environment.
Install Dependencies: Installs packages from requirements.txt.
Run Tests: Executes Django tests.
Running Workflow
The workflow is automatically triggered on:

Push: When changes are pushed to the main branch.
Pull Request: When a pull request is created or updated.
You can view workflow runs and their status in the Actions tab of the repository on GitHub.

## 🧩 Endpoints
### Authentication:
Sign Up: POST /api/signup/ - Register a new user.
Login: POST /api/login/ - Authenticate and log in.
Forgot Password: POST /api/forgot/ - Request a password reset link.
Reset Password: POST /api/reset/<uidb64>/<token>/ - Reset the user password.

### Task Management:
List Tasks: GET /api/tasks/ - Retrieve a list of tasks.
Create Task: POST /api/tasks/ - Add a new task.
Update Task: PUT /api/tasks/<id>/ - Update an existing task.
Delete Task: DELETE /api/tasks/<id>/ - Remove a task.

### FAQs:
List FAQs: GET /api/faqs/ - Retrieve a list of frequently asked questions.
Add FAQ: POST /api/faqs/ - Create a new FAQ.
Update FAQ: PUT /api/faqs/<id>/ - Update an existing FAQ.
Delete FAQ: DELETE /api/faqs/<id>/ - Remove an FAQ.
