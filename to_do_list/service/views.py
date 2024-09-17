from django.shortcuts import render , redirect
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required

from service.models import UserProfile, FAQ, PasswordResetToken, Task
import os
import json

# Home apis

def home(request):
    return render(request, 'home.html')

def about_app(request):
    return render(request, 'about_app.html')

# User profile api
@login_required
def profile(request):
    return render(request, 'profile.html')

# Tasks apis

@login_required
@csrf_exempt
def create_task(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        title = data.get('title')
        description = data.get('description')
        category = data.get('category', 'work')  
        user = request.user

        if not title:
            return JsonResponse({'error': 'Title is required'}, status=400)

        task = Task.objects.create(
            title=title,
            description=description,
            category=category,
            user=user
        )
        return JsonResponse({'id': task.id, 'title': task.title, 'category': task.category}, status=201)
    return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)

@login_required
@csrf_exempt
def update_task(request, task_id):
    if request.method == 'PUT':
        data = json.loads(request.body.decode('utf-8'))
        task = Task.objects.filter(id=task_id, user=request.user).first()

        if not task:
            return JsonResponse({'error': 'Task not found'}, status=404)

        title = data.get('title')
        description = data.get('description')
        status = data.get('status')

        if title:
            task.title = title
        if description:
            task.description = description
        if status:
            task.status = status

        task.save()
        return JsonResponse({'id': task.id, 'title': task.title, 'status': task.status}, status=200)
    
    return JsonResponse({'error': 'Only PUT requests are allowed'}, status=405)

@login_required
@csrf_exempt
def delete_task(request, task_id):
    if request.method == 'DELETE':
        task = Task.objects.filter(id=task_id, user=request.user).first()

        if not task:
            return JsonResponse({'error': 'Task not found'}, status=404)

        task.delete()
        return JsonResponse({'message': 'Task deleted successfully'}, status=200)
    return JsonResponse({'error': 'Only DELETE requests are allowed'}, status=405)

@login_required
def list_tasks(request):
    category = request.GET.get('category', None)

    if category:
        tasks = Task.objects.filter(user=request.user, category=category, status__in=['pending', 'in_progress']).order_by('-created_at')
    else:
        tasks = Task.objects.filter(user=request.user, status__in=['pending', 'in_progress']).order_by('-created_at')

    task_list = [
        {
            'id': task.id,
            'title': task.title,
            'description': task.description,  
            'status': task.status,
            'category': task.category
        } for task in tasks
    ]

    return JsonResponse({'tasks': task_list}, status=200)

@login_required
def task_detail(request, task_id):
    task = Task.objects.filter(id=task_id, user=request.user).first()
    if task:
        task_data = {
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'status': task.status,
            'category': task.category,
            'created_at': task.created_at,
            'updated_at': task.updated_at
        }
        return JsonResponse({'task': task_data}, status=200)
    return JsonResponse({'error': 'Task not found'}, status=404)

# Authentication apis

def login_signin(request):
    if request.user.is_authenticated:
        return redirect('../home') 
    return render(request, 'login.html')

@csrf_exempt
def login_api(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        gender = request.POST.get('gender')
        
        if gender:
            return JsonResponse({'success': False, 'message': 'Bot detected'}, status=400)

        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({'success': True, 'message': 'Login successful'}, status=200)
        else:
            return JsonResponse({'success': False, 'message': 'Invalid username or password'}, status=400)
    
    return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)

@csrf_exempt
def signup_api(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password_confirm = request.POST.get('password_confirm')
        gender = request.POST.get('gender')

        if gender:
            return JsonResponse({'success': False, 'message': 'Bot detected'}, status=400)

        if not username or not email or not password or not password_confirm:
            return JsonResponse({'success': False, 'message': 'Fill in all the required fields'}, status=400)

        if password != password_confirm:
            return JsonResponse({'success': False, 'message': 'Passwords do not match'}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({'success': False, 'message': 'Username already exists'}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({'success': False, 'message': 'Email already exists'}, status=400)

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({'success': True, 'message': 'User registered and logged in successfully'}, status=200)
            else:
                return JsonResponse({'success': False, 'message': 'Authentication failed after signup'}, status=400)

        except Exception as e:
            return JsonResponse({'success': False, 'message': 'Error: ' + str(e)}, status=500)

    return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)

@csrf_exempt
def forgot(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            email = data.get('email')

            user = get_user_model().objects.filter(email=email).first()

            if user:
                token = get_random_string(length=32)
                PasswordResetToken.objects.create(user=user, token=token)

                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

                reset_link = f'http://example.com/reset_pass_page/{uidb64}/{token}/'

                send_mail(
                    'Password Reset Request',
                    f'Click the following link to reset your password: {reset_link}',
                    'from@example.com',
                    [email],
                    fail_silently=False,
                )
                return JsonResponse({'message': 'Password reset email sent successfully.'})
            else:
                return JsonResponse({'error': 'No user found with that email address.'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    return render(request, 'forgot.html')

@csrf_exempt
def reset_pass_api(request, uidb64, token):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            new_password = data.get('new_password')
            confirm_password = data.get('confirm_password')

            if new_password != confirm_password:
                return JsonResponse({'error': 'Passwords do not match'}, status=400)

            if len(new_password) < 8 or len(new_password) > 40:
                return JsonResponse({'error': 'Password length should be between 8 and 40 characters'}, status=400)

            uid = urlsafe_base64_decode(uidb64).decode()
            user = get_user_model().objects.get(pk=uid)

        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            return JsonResponse({'error': 'Invalid user'}, status=400)

        if default_token_generator.check_token(user, token):
            user.password = make_password(new_password)
            user.save()
            return JsonResponse({'message': 'Password changed successfully'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid or expired token'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

def reset_pass_page(request, uidb64, token):
    return render(request, 'reset_pass.html')

# User interaction apis

def check_authenticated(request):
    if request.user.is_authenticated:
        return JsonResponse({'is_authenticated': True})
    else:
        return JsonResponse({'is_authenticated': False})
    
def get_user_profile(request):
    if request.user.is_authenticated:
        try:
            profile = UserProfile.objects.get(user=request.user)
            username = profile.name if profile.name else request.user.username
        except UserProfile.DoesNotExist:
            username = request.user.username
        return JsonResponse({'username': username})
    else:
        return JsonResponse({'error': 'User not authenticated'}, status=403)
    
def logout_view(request):
    if request.method == "POST":
        logout(request)
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Invalid request'}, status=400)

# Rest of apis

def faqs_api(request):
    faqs = FAQ.objects.order_by('id')
    faq_list = []

    if faqs.exists():
        for faq in faqs:
            faq_data = {
                'question': faq.question,
                'answer': faq.answer,
            }
            faq_list.append(faq_data)
        return JsonResponse({'faqs': faq_list}, status=200)

    else:
        default_faq = FAQ.objects.create(
            question="No questions available",
            answer="There are no records available at this time."
        )
        default_faq.save()

        return JsonResponse({'faqs': [{
            'question': default_faq.question,
            'answer': default_faq.answer
        }]}, status=200)

def faqs(request):
    return render(request, 'faqs.html')