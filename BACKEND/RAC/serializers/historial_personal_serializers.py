from rest_framework import serializers

from django.db import transaction

from django.utils import timezone

from ..models.historial_personal_models import EmployeeEgresado,EmployeeMovementHistory

from ..models.personal_models import DireccionLinea, Tiponomina, Estatus, AsigTrabajo, Tipo_personal, antecedentes_servicio

from USER.models.user_models import cuenta as User

from ..services.constants_historial import *

from ..services.constants import *

from ..serializers import (DireccionGeneralSerializer,DireccionLineaSerializer,CoordinacionSerializer,
                           TipoNominaSerializer,
                           denominacionCargoEspecificoSerializer,denominacionCargoSerializer,
                           gradoSerializer,OrganismoAdscritoSerializer)


class MovimintoCargoSerializer(serializers.Serializer):
    nuevo_cargo_id = serializers.IntegerField(required=True)
    usuario_id = serializers.IntegerField(required=True)
    motivo = serializers.CharField(required=True)

    def validate_nuevo_cargo_id(self, value):
        try:
            estatus_vacante = Estatus.objects.get(estatus__iexact=ESTATUS_VACANTE)
        except Estatus.DoesNotExist:
            raise serializers.ValidationError("No existe el estatus 'VACANTE'")

        try:
          
            puesto_destino = AsigTrabajo.objects.get(pk=value)
            if puesto_destino.estatusid != estatus_vacante:
                raise serializers.ValidationError("El el cargo ya está ocupado.")
            return puesto_destino 
        except AsigTrabajo.DoesNotExist:
            raise serializers.ValidationError("El cargo a asignar no es válido.")

    def validate_usuario_id(self, value):
        try:
         
            return User.objects.get(pk=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("El usuario no existe")

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
        puesto_nuevo.observaciones = motivo
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
    estatus_id = serializers.IntegerField(required=True)
    usuario_id = serializers.IntegerField(required=True)

    def validate_usuario_id(self, value):
        try:
            return User.objects.get(pk=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Usuario no encontrado.")


# SERILIZER PARA GESTIONAR CAMBIO DE ESTATUS 
class GestionStatusSerializer(BaseActionInputSerializer):
    motivo = serializers.CharField(required=True, max_length=255)

    def validate_estatus_id(self, value):
 
        try:
            estatus_obj = Estatus.objects.get(pk=value)
            if estatus_obj.estatus.upper() not in ESTATUS_PERMITIDOS:
                raise serializers.ValidationError("Gstion de estatus no permitido")
            return estatus_obj
        except Estatus.DoesNotExist:
            raise serializers.ValidationError("El  estatus enviado no existe")

    @transaction.atomic
    def update(self, instance, validated_data):
        nuevo_estatus = validated_data['estatus_id']
        usuario = validated_data['usuario_id']
        motivo = validated_data['motivo']
        empleado = instance.employee

        instance.estatusid = nuevo_estatus
        instance.observaciones = motivo
        instance._history_user = usuario
        instance.save()

        registrar_historial_movimiento(
            empleado=empleado,
            puesto=instance,
            tipo_movimiento='CAMBIO DE ESTATUS',
            motivo=f"CAMBIO DE ESTATUS: {motivo}",
            usuario=usuario
        )

        return instance

# SERIALIZER PARA GESTIONAR EGRESOS Y PERSONAL PASIVO 
class GestionEgreso_PasivoSerializer(BaseActionInputSerializer):
    motivo = serializers.CharField(required=True, max_length=255)
    tiponominaid = serializers.PrimaryKeyRelatedField(queryset=Tiponomina.objects.all(), required=False)
    codigo_nuevo = serializers.CharField(required=False, max_length=50)
    liberar_activos = serializers.BooleanField(required=False, default=False)

    def validate(self, data):
        
        try:
            estatus_obj = Estatus.objects.get(pk=data['estatus_id'])
            estatus_nombre = estatus_obj.estatus.upper()
        except Estatus.DoesNotExist:
            raise serializers.ValidationError({"El estatus no existe"})

        if estatus_nombre not in ESTATUS_PERMITIDOS_EGRESOS:
            raise serializers.ValidationError({"Tipo de estatus no permitido"})

        if estatus_nombre == "PASIVO":
            if not data.get('tiponominaid'):
                raise serializers.ValidationError({"Es obligatorio para personal PASIVO"})
            if not data.get('codigo_nuevo'):
                raise serializers.ValidationError({ "Debe asignar un código al nuevo cargo pasivo"})
            
            if AsigTrabajo.objects.filter(codigo=data['codigo_nuevo']).exists():
                raise serializers.ValidationError({"Este código de puesto ya está en uso"})

        return data

    @transaction.atomic
    
    def update(self, instance, validated_data):
        
        usuario = validated_data['usuario_id']
        estatus_obj = Estatus.objects.get(pk=validated_data['estatus_id'])
        estatus_nombre = estatus_obj.estatus.upper()
        obs_texto = validated_data.get('motivo', 'Sin observaciones registradas')
        estatus_vacante = Estatus.objects.get(estatus__iexact=ESTATUS_VACANTE)
      
        if estatus_nombre == "EGRESADO":
            self._procesar_egreso_total(instance, obs_texto, usuario, estatus_vacante)
            return instance

        if estatus_nombre == "PASIVO":
            try:
                # BUSQUEDA DE LA DIRECCION DE LINEA
                dl_admin = DireccionLinea.objects.get(direccion_linea__iexact="DIRECCION DE ADMINISTRACION DE PERSONAL")
                # OBTENCION DE LA DIRECCION GENERAL 
                dg_admin = dl_admin.direccionGeneral
            except DireccionLinea.DoesNotExist:
                raise serializers.ValidationError({
                     "No se encontró la 'DIRECCION DE ADMINISTRACION DE PERSONAL'"
                })
            liberar = validated_data.get('liberar_activos', False)
            
            ultima_asig = AsigTrabajo.objects.filter(employee=instance).first()
            if not ultima_asig:
                raise serializers.ValidationError("El empleado no posee cargos registrados")

            try:
                estatus_activo = Estatus.objects.get(estatus__iexact="ACTIVO")
            except Estatus.DoesNotExist:
                raise serializers.ValidationError("No existe el estatus")
            
            if liberar:
                msg_egreso = f"EGRESO  (PASO A PASIVO). {obs_texto}"
                self._procesar_egreso_total(instance, msg_egreso, usuario, estatus_vacante)

            try:
                tipo_pasivo = Tipo_personal.objects.get(tipo_personal__iexact=PERSONAL_PASIVO)
            except Tipo_personal.DoesNotExist:
                raise serializers.ValidationError("No existe el tipo de personal PASIVO")
            
            # CREACION DE NUEVO CARGO PASIVO TRAS LA VALIDACION DE LOS DATOS 
            nueva_asig= AsigTrabajo.objects.create(
                employee=instance,
                codigo=validated_data['codigo_nuevo'],
                denominacioncargoid=ultima_asig.denominacioncargoid,
                denominacioncargoespecificoid=ultima_asig.denominacioncargoespecificoid,
                tiponominaid=validated_data['tiponominaid'],
                estatusid=estatus_activo,
                Tipo_personal=tipo_pasivo,
                gradoid=ultima_asig.gradoid,
                DireccionGeneral=dg_admin,
                DireccionLinea=dl_admin,
                Coordinacion=None,
                OrganismoAdscritoid=ultima_asig.OrganismoAdscritoid,
                observaciones=f"Cargo pasivo generado. {obs_texto}"
            )
            # RGISTRO EN EL HISTORICO 
            nueva_asig._history_user = usuario
            nueva_asig.save()
            
            registrar_historial_movimiento(
                empleado=instance,
                puesto=ultima_asig,
                tipo_movimiento='CAMBIO_NOMINA',
                motivo=f"PASA A ESTATUS PASIVO: {obs_texto}",
                usuario=usuario
            )

        return instance
    
#    REGISTRO DE EGRESO 
    def _procesar_egreso_total(self, empleado, motivo, usuario, estatus_vacante):
        
        try:
            estatus_egresado = Estatus.objects.get(estatus__iexact="EGRESADO") 
        except Estatus.DoesNotExist:
            raise serializers.ValidationError("No se encontró el estatus EGRESADO en la base de datos.")
        
        fecha_hoy = timezone.now().date()
        asignaciones = AsigTrabajo.objects.filter(employee=empleado)
        
        ultima_asig = asignaciones.first()
        antecedentes_servicio.objects.create(
            empleado_id=empleado,
            institucion="Ministerio del Poder Popular para Relaciones Interiores, Justicia y Paz", 
        
            fecha_ingreso=empleado.fechaingresoorganismo,
            fecha_egreso=fecha_hoy
        )
        for asig in asignaciones:
            EmployeeEgresado.objects.create(
                employee=empleado,
                nombres=empleado.nombres,
                apellidos=empleado.apellidos,
                codigo=asig.codigo,
                fechaingresoorganismo=empleado.fechaingresoorganismo,
                denominacioncargoid=asig.denominacioncargoid,
                denominacioncargoespecificoid=asig.denominacioncargoespecificoid,
                gradoid=asig.gradoid,
                tiponominaid=asig.tiponominaid,
                DireccionGeneral=asig.DireccionGeneral,
                DireccionLinea=asig.DireccionLinea,
                Coordinacion=None,
                OrganismoAdscritoid=asig.OrganismoAdscritoid,
                motivo_egreso=motivo
            )
            
            
            asig.estatusid = estatus_egresado
            # REGISTRO EN EL HISTORIAL 
            registrar_historial_movimiento(empleado, asig, 'EGRESO', motivo, usuario)
            
            asig.employee = None
            asig.estatusid = estatus_vacante
            asig._history_user = usuario
            asig.save()
            
    # SERIALIZER LISTAR PERSONAL EGRESADO 
class PersonalEgresadoSerializer(serializers.ModelSerializer):
    denominacioncargo = denominacionCargoSerializer(source='denominacioncargoid',read_only= True)
    denominacioncargoespecifico = denominacionCargoEspecificoSerializer(source = 'denominacioncargoespecificoid', read_only = True)
    grado = gradoSerializer(source='gradoid', read_only = True)
    tiponomina = TipoNominaSerializer(source='tiponominaid', read_only = True)
    DireccionGeneral = DireccionGeneralSerializer( read_only = True)
    DireccionLinea = DireccionLineaSerializer( read_only = True)
    Coordinacion = CoordinacionSerializer( read_only = True)
    OrganismoAdscrito = OrganismoAdscritoSerializer( source = 'OrganismoAdscritoid',read_only = True)
    class Meta:
        model = EmployeeEgresado
        fields = [
                
                'employee',
                'nombres',
                'apellidos',
                'codigo',
                'fechaingresoorganismo',
                'denominacioncargo',
                'denominacioncargoespecifico',
                'grado',
                'tiponomina',
                'DireccionGeneral',
                'DireccionLinea',
                'Coordinacion',
                'OrganismoAdscrito',
                'motivo_egreso',
                'fecha_egreso'
                
            ]
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
            
        for key, value in representation.items():
            if value is None:
                representation[key] = ''
        return representation
    
    
    
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

    motivo_movimiento = serializers.CharField(source='motivo', read_only=True)

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
        return prev.denominacioncargoespecifico.cargo if prev else ""

    def get_prev_cargo_general(self, obj):
        prev = self.get_previous_record(obj)
        return prev.denominacioncargo.cargo if prev else ""

    def get_prev_nomina(self, obj):
        prev = self.get_previous_record(obj)
        return prev.tiponomina.nomina if prev else ""

    def get_prev_grado(self, obj):
        prev = self.get_previous_record(obj)
        return prev.gradoid.grado if (prev and prev.gradoid) else ""

    def get_prev_estatus(self, obj):
        prev = self.get_previous_record(obj)
        return prev.estatus.estatus if prev else ""

    def get_prev_tipo_personal(self, obj):
        prev = self.get_previous_record(obj)
        return prev.tipo_personal.tipo_personal if prev else ""

    def to_representation(self, instance):

        if hasattr(self, '_prev_record_cache'):
            del self._prev_record_cache
            
        ret = super().to_representation(instance)
        for key, value in ret.items():
            if value is None:
                ret[key] = ""
        return ret