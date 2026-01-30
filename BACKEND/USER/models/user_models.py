from django.db import models


# Create your models here.
class departaments(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(null=True, blank=True)

    class Meta:
        managed = True
        app_label = 'USER'

class cuenta(models.Model):
    user_id = models.AutoField(primary_key=True)
    cedula = models.CharField(max_length=20, unique=True)  
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True) 
    status = models.CharField(max_length=50, default='basic')  
    departament = models.ForeignKey(departaments, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        managed = True
        app_label = 'USER'

class permissions(models.Model):
    id = models.AutoField(primary_key=True)
    superuser = models.BooleanField(default=False)
    staff = models.BooleanField(default=False)
    cuenta = models.ForeignKey(cuenta, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        managed = True
        app_label = 'USER'
