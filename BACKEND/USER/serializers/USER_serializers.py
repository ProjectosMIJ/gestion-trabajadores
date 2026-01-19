from rest_framework import serializers
from ..models.user_models import departaments, cuenta, permissions
from django.contrib.auth.hashers import check_password, make_password
from RAC.models import Employee
from rest_framework.response import Response



class LoginSerializer(serializers.Serializer):
    # Campos de entrada
    cedula = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    # Campos de respuesta
    user_id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    departament = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(read_only=True)
    phone = serializers.CharField(read_only=True)
    status = serializers.IntegerField(read_only=True)
    # id_especialidad_medico = serializers.IntegerField(read_only=True, allow_null=True)  # medicoSM no existe
    
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
            data['cedula'] = EmployeeSerializer(user.cedula)
        else:
            data['cedula'] = user.cedula
        data['departament'] = user.departament.nombre if user.departament else None
        data['status'] = user.status
        data['email'] = user.email
        data['phone'] = user.phone
        # data['id_especialidad_medico'] = user.id_especialidad_medico.id if user.id_especialidad_medico else None  # medicoSM no existe
     
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
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    departament = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = cuenta
        fields = ['cedula', 'password', 'password2', 'departament', 'email', 'phone', 'status']
        extra_kwargs = {
            'status': {'required': False, 'default': 'basic'},
            'departament': {'required': False},
        }

    def validate_cedula(self, value):
        """
        Valida que la cédula exista exclusivamente en la tabla Employee (RAC).
        """
        if value is None or str(value).strip() == "":
            raise serializers.ValidationError("La cédula es requerida.")

        # Si ya recibimos el objeto Employee por algún proceso previo
        if isinstance(value, Employee):
            return value

        cedula_str = str(value).strip()

        try:
            # Buscar únicamente en Employee
            empleado = Employee.objects.get(cedulaidentidad__iexact=cedula_str)
            return empleado
        except Employee.DoesNotExist:
            raise serializers.ValidationError("La cédula no pertenece a un empleado registrado en el sistema RAC.")

    def validate(self, data):
        # 1. Validar coincidencia de contraseñas
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})

        # 2. Validar que no tenga ya una cuenta creada
        empleado = data.get('cedula')
        # Como validate_cedula devuelve un objeto Employee, usamos su atributo
        cedula_str = empleado.cedulaidentidad 
        
        if cuenta.objects.filter(cedula=cedula_str).exists():
            raise serializers.ValidationError({"cedula": "Este empleado ya posee una cuenta de usuario."})

        # 3. Procesar el Departamento (String/ID -> Objeto)
        departament_value = data.pop('departament', None)
        if departament_value:
            try:
                if str(departament_value).isdigit():
                    data['departament'] = departaments.objects.get(id=int(departament_value))
                else:
                    data['departament'] = departaments.objects.get(nombre=departament_value)
            except departaments.DoesNotExist:
                raise serializers.ValidationError({"departament": "El departamento especificado no existe."})
        
        return data

    def create(self, validated_data):
        # Extraer datos que no van directo al modelo 'cuenta'
        password = validated_data.pop('password')
        validated_data.pop('password2', None)
        
        # 'cedula' aquí es el objeto Employee devuelto por validate_cedula
        empleado = validated_data.pop('cedula')
        
        # Preparar los datos finales para la creación
        validated_data['cedula'] = empleado.cedulaidentidad
        # Generamos el username automáticamente desde los datos de RRHH
        validated_data['username'] = f"{empleado.nombres.strip()} {empleado.apellidos.strip()}"

        # Crear y cifrar contraseña
        user = cuenta.objects.create(**validated_data)
        user.password = make_password(password)
        user.save()
        
        return user



class UserDetailSerializer(serializers.ModelSerializer):
    departament_name = serializers.SerializerMethodField(read_only=True)
    cedula_str = serializers.SerializerMethodField(read_only=True)
    nombre_apellido = serializers.SerializerMethodField(read_only=True)
    especialidad_descripcion = serializers.SerializerMethodField(read_only=True)

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
            'id_especialidad_medico',
            'especialidad_descripcion'
        ]
        read_only_fields = ['departament_name', 'cedula_str', 'nombre_apellido', 'especialidad_descripcion']

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
