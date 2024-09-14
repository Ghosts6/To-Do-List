from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, Task, PasswordResetToken, FAQ

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'User Profiles'

class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'email', 'gender')
    list_filter = ['gender', 'date_of_birth']  
    search_fields = ['user__username']  

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'status', 'category', 'created_at', 'updated_at']  
    list_filter = ['status', 'category', 'created_at']  
    search_fields = ['title', 'user__username']  


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'created_at']  
    search_fields = ['question']  
    list_filter = ['created_at']  
    ordering = ['-created_at']

