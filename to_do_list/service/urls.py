from django.urls import path, re_path
from django.views.static import serve
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('', views.home, name='home'),
    path('home/', views.home, name='home'),
    path('about_app/', views.about_app, name='about_app'),
    path('profile/', views.profile, name='profile'),
    path('tasks/', views.list_tasks, name='list_tasks'),
    path('tasks/create/', views.create_task, name='create_task'),
    path('tasks/<int:task_id>/update/', views.update_task, name='update_task'),
    path('tasks/<int:task_id>/delete/', views.delete_task, name='delete_task'),
    path('tasks/<int:task_id>/', views.task_detail, name='task_detail'),
    path('login/', views.login_signin, name='login_signin'),
    path('login_api/', views.login_api, name='login_api'),
    path('signup_api/', views.signup_api, name='signup_api'),
    path('faqs/', views.faqs, name='faqs'),
    path('faqs_api/', views.faqs_api, name='faqs_api'),
    path('forgot/', views.forgot, name='forgot'),
    path('reset_pass_api/<uidb64>/<token>/', views.reset_pass_api, name='reset_pass_api'),
    path('reset_pass_page/<uidb64>/<token>/', views.reset_pass_page, name='reset_pass_page'),
    path('check_authenticated/', views.check_authenticated, name='check_authenticated'),
    path('get_user_profile/', views.get_user_profile, name='get_user_profile'),
    path('logout/', views.logout_view, name='logout'),
    
    re_path(r'^media/(?P<path>.*)$', serve,{'document_root': settings.MEDIA_ROOT}),  
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)