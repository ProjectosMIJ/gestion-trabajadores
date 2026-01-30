from rest_framework import serializers
from ..models.user_models import departaments, cuenta, permissions
from django.contrib.auth.hashers import check_password, make_password
from RAC.models import Employee, AsigTrabajo, Dependencias, DireccionGeneral, DireccionLinea, Coordinaciones
from rest_framework.response import Response



class DependenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependencias
        fields = ['id', 'dependencia']

class DireccionGeneralSerializer(serializers.ModelSerializer):
    dependencia = DependenciaSerializer(source='dependenciaId', read_only=True)
    class Meta:
        model = DireccionGeneral
        fields = ['id', 'direccion_general', 'dependencia']

class DireccionLineaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DireccionLinea
        fields = ['id', 'direccion_linea']

class CoordinacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coordinaciones
        fields = ['id', 'coordinacion']


class LoginSerializer(serializers.Serializer):
    cedula = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
  
    user_id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    departament = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    phone = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)
    direccion_general = serializers.SerializerMethodField()
    direccion_linea = serializers.SerializerMethodField()
    coordinacion = serializers.SerializerMethodField()
    dependencia = serializers.SerializerMethodField()

    def _get_asignacion(self, obj):
        if not hasattr(self, '_cached_asig'):
   
      
            user = obj.get('user')

            self._cached_asig = AsigTrabajo.objects.filter(employee=user.cedula).select_related(
                'DireccionGeneral', 'DireccionGeneral__dependenciaId',
                'DireccionLinea', 'Coordinacion'
            ).first()
        return self._cached_asig

    def get_direccion_general(self, obj):
        asig = self._get_asignacion(obj)
        if asig and asig.DireccionGeneral:
            return {'id': asig.DireccionGeneral.id, 'nombre': asig.DireccionGeneral.direccion_general}
        return None

    def get_direccion_linea(self, obj):
        asig = self._get_asignacion(obj)
        if asig and asig.DireccionLinea:
            return {'id': asig.DireccionLinea.id, 'nombre': asig.DireccionLinea.direccion_linea}
        return None

    def get_coordinacion(self, obj):
        asig = self._get_asignacion(obj)
        if asig and asig.Coordinacion:
            return {'id': asig.Coordinacion.id, 'nombre': asig.Coordinacion.coordinacion}
        return None

    def get_dependencia(self, obj):
        asig = self._get_asignacion(obj)
        if asig and asig.DireccionGeneral and asig.DireccionGeneral.dependenciaId:
            dep = asig.DireccionGeneral.dependenciaId
            return {'id': dep.id, 'nombre': dep.dependencia}
        return None
    
    def validate(self, data):
        cedula = data.get('cedula')
        password = data.get('password')

        if not cedula or not password:
            raise serializers.ValidationError("Se requieren cédula y contraseña")

        # Buscar al usuario por cédula
        try:
            user = cuenta.objects.get(cedula=cedula)
        except cuenta.DoesNotExist:
            # Usar mensaje genérico para evitar revelar información
            raise serializers.ValidationError("Usuario o contraseña inválidos")
        
        # Verificar si la contraseña está hasheada
        is_hashed = password_is_hashed(user.password)
        
        if is_hashed:
            # Si está hasheada, verificar con check_password
            if not check_password(password, user.password):
                raise serializers.ValidationError("Usuario o contraseña inválidos")
        else:
            # Si no está hasheada, comparar directamente y actualizar a hasheada si coincide
            if user.password != password:
                raise serializers.ValidationError("Usuario o contraseña inválidos")
            else:
                # Actualizar la contraseña a formato hasheado
                user.password = make_password(password)
                user.save()
        
        # Añadir los campos específicos a los datos validados
        data['user_id'] = user.user_id
        data['username'] = user.username
        # Serializar cedula si es instancia de Employee
        
        if isinstance(user.cedula, Employee):
            data['cedula'] = EmployeeSerializer(user.cedula).data
        else:
            data['cedula'] = user.cedula
            
        data['departament'] = user.departament.nombre if user.departament else None
        data['status'] = user.status
        data['email'] = user.email
        data['phone'] = user.phone
        
       
        data['user'] = user
        return data


def password_is_hashed(password):
    """
    Determina si una contraseña ya está hasheada.
    """
    return password.startswith(('pbkdf2_sha256$', 'bcrypt$', 'argon2'))
        
class DepartamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = departaments
        fields = ['id', 'nombre', 'descripcion']

class UserSerializer(serializers.ModelSerializer):
    departament_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = cuenta
        fields = ['user_id', 'username', 'cedula', 'status', 'departament', 'departament_name']
        read_only_fields = ['departament_name']
        
    def get_departament_name(self, obj):
        try:
            if obj.departament:
                return obj.departament.nombre
            return None
        except Exception as e:
            return None

class CuentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = cuenta
        fields = '__all__'
        read_only_fields = ['id'] 
        
   #   registrar usuario  
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    
    departament = serializers.PrimaryKeyRelatedField(
        queryset=departaments.objects.all(), 
        required=False,
        allow_null=True
    )

    class Meta:
        model = cuenta
        fields = ['cedula', 'password', 'password2', 'departament', 'email', 'phone', 'status']

    def validate_cedula(self, value):
        cedula_str = str(value).strip()
        if not Employee.objects.filter(cedulaidentidad__iexact=cedula_str).exists():
            raise serializers.ValidationError("La cédula no pertenece a un empleado registrado en RAC.")
        
        if cuenta.objects.filter(cedula=cedula_str).exists():
            raise serializers.ValidationError("Este empleado ya posee una cuenta de usuario.")
            
        return cedula_str

    def validate(self, data):
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password2', None)
        
        cedula_str = validated_data.get('cedula')
        empleado = Employee.objects.get(cedulaidentidad__iexact=cedula_str)
        
        validated_data['username'] = f"{empleado.nombres.strip()} {empleado.apellidos.strip()}"
        validated_data['password'] = make_password(password) # Cifrar la contraseña

        return cuenta.objects.create(**validated_data)


class UserDetailSerializer(serializers.ModelSerializer):
    departament_name = serializers.SerializerMethodField(read_only=True)
    cedula_str = serializers.SerializerMethodField(read_only=True)
    nombre_apellido = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = cuenta
        fields = [
            'user_id',
            'nombre_apellido',
            'cedula',
            'cedula_str',  
            'email',
            'phone',
            'status',
            'departament',
            'departament_name',

        ]
        read_only_fields = ['departament_name', 'cedula_str', 'nombre_apellido']

    def get_departament_name(self, obj):
        try:
            if obj.departament:
                return obj.departament.nombre
            return None
        except Exception as e:
            return None

    def get_cedula_str(self, obj):
        return str(obj.cedula)

    def get_nombre_apellido(self, obj):
        try:
            empleado = Employee.objects.get(cedulaidentidad__iexact=str(obj.cedula))
            return f"{empleado.nombres.strip()} {empleado.apellidos.strip()}"
        except Employee.DoesNotExist:
            return ""
    

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
