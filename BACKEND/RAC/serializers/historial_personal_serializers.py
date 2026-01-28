from rest_framework import serializers

from django.db import transaction

from django.utils import timezone

from ..models.historial_personal_models import *

from ..models.personal_models import DireccionLinea, Tiponomina, Estatus, AsigTrabajo, Tipo_personal, antecedentes_servicio

from USER.models.user_models import cuenta as User

from ..services.constants_historial import *

from ..services.constants import *

from ..serializers import (DireccionGeneralSerializer,DireccionLineaSerializer,CoordinacionSerializer,
                           TipoNominaSerializer,
                           denominacionCargoEspecificoSerializer,denominacionCargoSerializer,
                           gradoSerializer,OrganismoAdscritoSerializer)



class TipoMovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipo_movimiento
        fields = '__all__'

class MovimintoCargoSerializer(serializers.Serializer):
    nuevo_cargo_id = serializers.PrimaryKeyRelatedField(queryset=AsigTrabajo.objects.all())
    usuario_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    motivo = serializers.PrimaryKeyRelatedField(queryset=Tipo_movimiento.objects.all())

    def validate_nuevo_cargo_id(self, value):
     
        try:
            estatus_vacante = Estatus.objects.get(estatus__iexact=ESTATUS_VACANTE)
        except Estatus.DoesNotExist:
            raise serializers.ValidationError("No existe el estatus 'VACANTE'")

        if value.estatusid != estatus_vacante:
            raise serializers.ValidationError("El cargo seleccionado ya está ocupado")
        
        return value
 

    @transaction.atomic
    def update(self, instance, validated_data):
        puesto_nuevo = validated_data['nuevo_cargo_id']
        usuario = validated_data['usuario_id']
        motivo = validated_data['motivo']
        empleado = instance.employee

        try:
            estatus_vacante = Estatus.objects.get(estatus__iexact=ESTATUS_VACANTE)
            estatus_activo = Estatus.objects.get(estatus__iexact=ESTATUS_ACTIVO)
        except Estatus.DoesNotExist:
            raise serializers.ValidationError("Error de datos de estatus")

        # LIBERAR CARGO ACTUAL
        instance.employee = None
        instance.estatusid = estatus_vacante
        instance._history_user = usuario
        instance.save()

        # OCUPAR NUEVO PUESTO
        puesto_nuevo.employee = empleado
        puesto_nuevo.estatusid = estatus_activo
        puesto_nuevo._history_user = usuario
        puesto_nuevo.observaciones = motivo.movimiento
        puesto_nuevo.save()

        #REGISTRO EN EL HISTORIAL
        registrar_historial_movimiento(
            empleado=empleado,
            puesto=puesto_nuevo, 
            tipo_movimiento='TRASLADO',
            motivo=motivo,
            usuario=usuario
        )

        return puesto_nuevo



# SERIALIZER BASE PARA LA GESTION DE LOS ESTATUS 
class BaseActionInputSerializer(serializers.Serializer):
    estatus_id = serializers.PrimaryKeyRelatedField(
        queryset=Estatus.objects.all(),
        source='estatus' 
    )
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='usuario' 
    )


# SERILIZER PARA GESTIONAR CAMBIO DE ESTATUS 
class GestionStatusSerializer(BaseActionInputSerializer):
    motivo = serializers.PrimaryKeyRelatedField(queryset=Tipo_movimiento.objects.all())

    def validate_estatus_id(self, value):
 
        if value.estatus.upper() not in ESTATUS_PERMITIDOS:
            raise serializers.ValidationError("Gestión de estatus no permitido")
        return value

    @transaction.atomic
    def update(self, instance, validated_data):
        nuevo_estatus = validated_data['estatus'] 
        usuario = validated_data['usuario']
        motivo = validated_data['motivo']
        empleado = instance.employee

        instance.estatusid = nuevo_estatus
        instance.observaciones = motivo.movimiento
        instance._history_user = usuario
        instance.save()

        registrar_historial_movimiento(
            empleado=empleado,
            puesto=instance,
            tipo_movimiento='CAMBIO DE ESTATUS',
            motivo= motivo,
            usuario=usuario
        )

        return instance

# SERIALIZER PARA GESTIONAR EGRESOS Y PERSONAL PASIVO 
class GestionEgreso_PasivoSerializer(BaseActionInputSerializer):
    motivo = serializers.PrimaryKeyRelatedField(queryset=Tipo_movimiento.objects.all())
    tiponominaid = serializers.IntegerField(required=False, allow_null=True)
    codigo_nuevo = serializers.CharField(required=False, max_length=50)
    liberar_activos = serializers.BooleanField(required=False, default=False)
    
    def validate(self, data):
        
        estatus_obj = data['estatus']
        estatus_nombre = estatus_obj.estatus.upper()
      

        if estatus_nombre not in ESTATUS_PERMITIDOS_EGRESOS:
            raise serializers.ValidationError("Tipo de estatus no permitido")

        if estatus_nombre == "PASIVO":
            errores = {}

            if not data.get('tiponominaid'):
               errores['tiponominaid'] = "Es obligatorio asignar una nomina para personal PASIVO"
        
            if not data.get('codigo_nuevo'):
                errores['codigo_nuevo'] = "Debe asignar un codigo al nuevo cargo pasivo"
            elif AsigTrabajo.objects.filter(codigo=data['codigo_nuevo']).exists():
                errores['codigo_nuevo'] = "Este codigo de puesto ya esta en uso"

            if errores:
               raise serializers.ValidationError(errores)
        return data

    @transaction.atomic
    
    def update(self, instance, validated_data):
        
        usuario = validated_data['usuario']
        estatus_obj = validated_data['estatus']
        estatus_nombre = estatus_obj.estatus.upper()
        motivo = validated_data['motivo']
      
        try:
            estatus_vacante = Estatus.objects.get(estatus__iexact=ESTATUS_VACANTE)
        except Estatus.DoesNotExist:
            raise serializers.ValidationError("Estatus VACANTE no configurado en el sistema")
        
        
      
        if estatus_nombre == "EGRESADO":
            self._procesar_egreso_total(instance, motivo, usuario, estatus_vacante)
            return instance

        if estatus_nombre == "PASIVO":
            return self._procesar_pasivo(instance, validated_data, motivo, usuario, estatus_vacante)

        return instance
    
    def _procesar_pasivo(self, empleado, validated_data, motivo_obj, usuario, estatus_vacante):
        try:
            dl_admin = DireccionLinea.objects.get(direccion_linea__iexact="DIRECCION DE ADMINISTRACION DE PERSONAL")
            dg_admin = dl_admin.direccionGeneral
        except DireccionLinea.DoesNotExist:
            raise serializers.ValidationError("DIRECCION DE ADMINISTRACION DE PERSONAL no encontrada")

        ultima_asig = AsigTrabajo.objects.filter(employee=empleado).first()
        if not ultima_asig:
            raise serializers.ValidationError("El empleado no tiene cargos previos para realizar el pase a pasivo.")

        if validated_data.get('liberar_activos', False):
            self._procesar_egreso_total(empleado, motivo_obj, usuario, estatus_vacante)

        try:
            estatus_activo = Estatus.objects.get(estatus__iexact="ACTIVO")
            tipo_pasivo = Tipo_personal.objects.get(tipo_personal__iexact=PERSONAL_PASIVO)
        except (Estatus.DoesNotExist, Tipo_personal.DoesNotExist):
            raise serializers.ValidationError(" Verifique estatus 'ACTIVO' y tipo personal 'PASIVO'")

        nueva_asig = AsigTrabajo.objects.create(
            employee=empleado,
            codigo=validated_data['codigo_nuevo'],
            denominacioncargoid=ultima_asig.denominacioncargoid,
            denominacioncargoespecificoid=ultima_asig.denominacioncargoespecificoid,
            tiponominaid_id=validated_data['tiponominaid'],
            estatusid=estatus_activo,
            Tipo_personal=tipo_pasivo,
            gradoid=ultima_asig.gradoid,
            DireccionGeneral=dg_admin,
            DireccionLinea=dl_admin,
            Coordinacion=None,
            OrganismoAdscritoid=ultima_asig.OrganismoAdscritoid,
            observaciones=f"Cargo pasivo generado. {motivo_obj.movimiento}"
        )
        
        nueva_asig._history_user = usuario
        nueva_asig.save()

        # 4. Registro en el Histórico
        registrar_historial_movimiento(
            empleado=empleado,
            puesto=ultima_asig,
            tipo_movimiento='CAMBIO_NOMINA',
            motivo=motivo_obj,
            usuario=usuario
        )
        return empleado
    
#    REGISTRO DE EGRESO 
    def _procesar_egreso_total(self, empleado, motivo, usuario, estatus_vacante):
        
        try:
            estatus_egresado = Estatus.objects.get(estatus__iexact="EGRESADO") 
        except Estatus.DoesNotExist:
            raise serializers.ValidationError("No se encontró el estatus EGRESADO en la base de datos.")
        
        fecha_hoy = timezone.now().date()
        asignaciones = AsigTrabajo.objects.filter(employee=empleado)
        
        antecedentes_servicio.objects.create(
            empleado_id=empleado,
            institucion="MPPRIJP", 
            fecha_ingreso=empleado.fechaingresoorganismo,
            fecha_egreso=fecha_hoy
        )
        egreso_obj = EmployeeEgresado.objects.create(
        employee=empleado,
        n_contrato=empleado.n_contrato, 
        fechaingresoorganismo=empleado.fechaingresoorganismo,
        motivo_egreso=motivo
        )

   
        for asig in asignaciones:
            CargoEgresado.objects.create(
                egreso=egreso_obj,
                codigo=asig.codigo,
                denominacioncargoid=asig.denominacioncargoid,
                denominacioncargoespecificoid=asig.denominacioncargoespecificoid,
                gradoid=asig.gradoid,
                tiponominaid=asig.tiponominaid,
                DireccionGeneral=asig.DireccionGeneral,
                DireccionLinea=asig.DireccionLinea,
                Coordinacion=None,
                OrganismoAdscritoid=asig.OrganismoAdscritoid
            )
        
            asig.estatusid = estatus_egresado
            registrar_historial_movimiento(empleado, asig, 'EGRESO', motivo, usuario)
            
            asig.employee = None
            asig.estatusid = estatus_vacante
            asig._history_user = usuario
            asig.save()
        
    # SERIALIZER LISTAR PERSONAL EGRESADO 

class CargoEgresadoSerializer(serializers.ModelSerializer):
    denominacioncargo = denominacionCargoSerializer(source='denominacioncargoid', read_only=True)
    denominacioncargoespecifico = denominacionCargoEspecificoSerializer(source='denominacioncargoespecificoid', read_only=True)
    grado = gradoSerializer(source='gradoid', read_only=True)
    tiponomina = TipoNominaSerializer(source='tiponominaid', read_only=True)
    DireccionGeneral = DireccionGeneralSerializer(read_only=True)
    DireccionLinea = DireccionLineaSerializer(read_only=True)
    Coordinacion = CoordinacionSerializer(read_only=True)
    OrganismoAdscrito = OrganismoAdscritoSerializer(source='OrganismoAdscritoid', read_only=True)

    class Meta:
        model = CargoEgresado
        fields = [
            'id',
            'codigo', 'denominacioncargo', 'denominacioncargoespecifico', 
            'grado', 'tiponomina', 'DireccionGeneral', 
            'DireccionLinea', 'Coordinacion', 'OrganismoAdscrito'
        ]
 
class PersonalEgresadoSerializer(serializers.ModelSerializer):
    cedula = serializers.CharField(source='employee.cedulaidentidad', read_only=True)
    nombres = serializers.CharField(source='employee.nombres', read_only=True)
    apellidos = serializers.CharField(source='employee.apellidos', read_only=True)
    
    Tipo_movimiento = TipoMovimientoSerializer(source='motivo_egreso', read_only=True)
    
    cargos = CargoEgresadoSerializer(source='cargos_historial', many=True, read_only=True)

    class Meta:
        model = EmployeeEgresado
        fields = [
            'id',
            'cedula',
            'nombres',
            'apellidos',
            'fechaingresoorganismo',
            'fecha_egreso',
            'Tipo_movimiento',
            'cargos'  
        ]
    
    
    
    # SERIALIZER PARA LISTAR EL HISTORIAL DE MOVIMIENTOS 
class EmployeeCargoHistorySerializer(serializers.ModelSerializer):
    # Campos del registro antes del ultimo movimiento ( mapeados como "new_")
    empleado_cedula = serializers.CharField(source='empleado.cedulaidentidad', read_only=True)
    puesto_codigo = serializers.CharField(source='codigo_puesto', read_only=True)
    modificado_por_usuario = serializers.CharField(source='ejecutado_por.username', read_only=True)
    fecha_movimiento = serializers.DateTimeField(read_only=True)
    
    # Mapeo de valores actuales a campos "new_"
    new_cargo_especifico = serializers.CharField(source='denominacioncargoespecifico.cargo', read_only=True)
    new_cargo_general = serializers.CharField(source='denominacioncargo.cargo', read_only=True)
    new_nomina = serializers.CharField(source='tiponomina.nomina', read_only=True)
    new_grado = serializers.CharField(source='gradoid.grado', read_only=True)
    new_estatus = serializers.CharField(source='estatus.estatus', read_only=True)

    motivo_movimiento = TipoMovimientoSerializer(source='motivo', read_only=True)

    # Declalarcion DE los campos "prev_" 
    prev_cargo_especifico = serializers.SerializerMethodField()
    prev_cargo_general = serializers.SerializerMethodField()
    prev_nomina = serializers.SerializerMethodField()
    prev_grado = serializers.SerializerMethodField()
    prev_estatus = serializers.SerializerMethodField()


    class Meta:
        model = EmployeeMovementHistory
        fields = [
            'id',
            'empleado_cedula', 'puesto_codigo', 'fecha_movimiento', 'modificado_por_usuario',
            'prev_cargo_especifico', 'prev_cargo_general', 'prev_nomina', 'prev_grado',
            'prev_estatus',
            'new_cargo_especifico', 'new_cargo_general', 'new_nomina', 'new_grado',
            'new_estatus', 'motivo_movimiento'
        ]

    def get_previous_record(self, obj):
        # BUSQUEDA DEL MOVIMIENTO ANTERIOR DEL MSMO EMPLEADO 
        if not hasattr(self, '_prev_record_cache'):
            self._prev_record_cache = EmployeeMovementHistory.objects.filter(
                empleado=obj.empleado,
                fecha_movimiento__lt=obj.fecha_movimiento
            ).order_by('-fecha_movimiento').first()
        return self._prev_record_cache

    # METODOS PARA OBTENER LOS DATOS DEL REGISTRO ANTERIOR
    def get_prev_cargo_especifico(self, obj):
        prev = self.get_previous_record(obj)
        return prev.denominacioncargoespecifico.cargo if prev else None

    def get_prev_cargo_general(self, obj):
        prev = self.get_previous_record(obj)
        return prev.denominacioncargo.cargo if prev else None

    def get_prev_nomina(self, obj):
        prev = self.get_previous_record(obj)
        return prev.tiponomina.nomina if prev else None

    def get_prev_grado(self, obj):
        prev = self.get_previous_record(obj)
        return prev.gradoid.grado if (prev and prev.gradoid) else None

    def get_prev_estatus(self, obj):
        prev = self.get_previous_record(obj)
        return prev.estatus.estatus if prev else None

    def get_prev_tipo_personal(self, obj):
        prev = self.get_previous_record(obj)
        return prev.tipo_personal.tipo_personal if prev else None

    def to_representation(self, instance):

        if hasattr(self, '_prev_record_cache'):
            del self._prev_record_cache
 