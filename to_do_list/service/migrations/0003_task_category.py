# Generated by Django 4.2.3 on 2024-09-14 06:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('service', '0002_remove_userprofile_address_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='category',
            field=models.CharField(choices=[('work', 'Work'), ('personal', 'Personal'), ('education', 'Education'), ('management', 'Management'), ('marketing_sales', 'Marketing & Sales'), ('customer_support', 'Customer Support')], default='work', max_length=50),
        ),
    ]
