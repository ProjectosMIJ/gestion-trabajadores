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
    # id_especialidad_medico = serializers.IntegerField(required=False, allow_null=True)  # medicoSM no existe
    
    class Meta:
        model = cuenta
     
        fields = ['cedula', 'password', 'password2', 'departament', 'email', 'phone', 'status']  # , 'id_especialidad_medico']  # medicoSM no existe
        extra_kwargs = {
            'status': {'required': False, 'default': 'basic'},
            'departament': {'required': False},
            'id_especialidad_medico': {'required': False, 'allow_null': True}
        }

    def validate_cedula(self, value):
        # Validar que se proporcione una cédula
        if value is None or str(value).strip() == "":
            raise serializers.ValidationError("La cédula es requerida.")

        # Si ya es un objeto Employee, devolverlo directamente
        if isinstance(value, Employee):
            return value

        cedula_str = str(value).strip()

        # Intentar buscar en Employee
        try:
            empleado = Employee.objects.get(cedulaidentidad__iexact=cedula_str)
            return empleado
        except Employee.DoesNotExist:
            # Si no está en Employee, intentar en Medico
            try:
                medico = Medico.objects.get(Cedula__iexact=cedula_str)
                # Devolver la cédula como string para que el flujo siguiente la trate como valor simple
                return medico.Cedula
            except Medico.DoesNotExist:
                raise serializers.ValidationError("La cédula no existe en el sistema RAC.")

    def validate(self, data):
        print('DATA RECIBIDA EN REGISTER VALIDATE:', data)
        empleado = data['cedula']
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        # Validar que no exista ya una cuenta con la misma cédula
        cedula_str = empleado.cedulaidentidad if isinstance(empleado, Employee) else str(empleado)
        if cuenta.objects.filter(cedula=cedula_str).exists():
            raise serializers.ValidationError({"cedula": "Ya existe un usuario con esta cédula."})

        departament_value = data.pop('departament', None)
        if departament_value:
            try:
                # Si es un número, buscar por id; si no, por nombre
                if str(departament_value).isdigit():
                    data['departament'] = departaments.objects.get(id=int(departament_value))
                else:
                    data['departament'] = departaments.objects.get(nombre=departament_value)
            except departaments.DoesNotExist:
                raise serializers.ValidationError({"departament": "Departamento no encontrado"})
        
        # Validar y procesar id_especialidad_medico
        # especialidad_id = data.get('id_especialidad_medico', None)
        # if especialidad_id is not None:
        #     try:
        #         from medicoSM.models import Especialidad
        #         especialidad = Especialidad.objects.get(id=especialidad_id)
        #         data['id_especialidad_medico'] = especialidad
        #     except Especialidad.DoesNotExist:
        #         raise serializers.ValidationError({"id_especialidad_medico": "Especialidad no encontrada"})
        
        return data

    def create(self, validated_data):
        try:
            password = validated_data.pop('password')
            validated_data.pop('password2', None)
            validated_data.pop('user_id', None)  # Asegura que no se pase user_id manualmente
            
            empleado = validated_data['cedula']
            if isinstance(empleado, Employee):
                validated_data['cedula'] = empleado.cedulaidentidad
                # Generar el username automáticamente con nombres y apellidos
                print(f"Tipo de empleado: {type(empleado)}")
                nombre_completo = f"{empleado.nombres.strip()} {empleado.apellidos.strip()}"
                validated_data['username'] = nombre_completo
            else:
                validated_data['username'] = validated_data.get('username', '')

            if 'status' not in validated_data:
                validated_data['status'] = 'basic'
            
            # Crear la cuenta
            user = cuenta.objects.create(**validated_data)
            user.password = make_password(password)
            user.save()
            
            return user
        except KeyError as e:
            raise serializers.ValidationError(f"Falta el campo requerido: {str(e)}")





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
            empleado = Employee.objects.get(cedulaidentidad__iexact=str(obj.cedula)) or Medico.objects.get(Cedula__iexact=str(obj.cedula))
            return f"{empleado.nombres.strip()} {empleado.apellidos.strip()}"
        except Employee.DoesNotExist:
            return ""
    
    def get_especialidad_descripcion(self, obj):
        try:
            if obj.id_especialidad_medico:
                return obj.id_especialidad_medico.descripcion_especialidad
            return None
        except Exception as e:
            return None

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
