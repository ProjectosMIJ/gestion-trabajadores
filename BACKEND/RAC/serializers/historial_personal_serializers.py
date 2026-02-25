from rest_framework import serializers

from django.db import transaction

from django.utils import timezone

from ..models.historial_personal_models import *

from ..models.personal_models import *

from USER.models.user_models import cuenta as User

from ..services.constants_historial import *

from ..services.constants import *

from RAC.serializers.personal_activo_serializers import *




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
    codigo_nuevo = serializers.CharField(required=False, max_length=50, allow_blank=True, allow_null=True)
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
            dg_humana = DireccionGeneral.objects.get(direccion_general__iexact="OFICINA DE GESTION HUMANA")
            dl_humana = DireccionLinea.objects.filter(direccionGeneral=dg_humana).first()
        except DireccionGeneral.DoesNotExist:
            raise serializers.ValidationError("OFICINA DE GESTION HUMANA no encontrada")

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
            Dependencia =  dg_humana.dependenciaId if dg_humana else Dependencias.objects.get(id=1),
            DireccionGeneral=dg_humana,
            DireccionLinea=dl_humana,
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
                TipoPersonalId= asig.Tipo_personal,
                Dependencia = asig.Dependencia,
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
 

    
class TipoMovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipo_movimiento
        fields = ['id', 'movimiento']
    
    

        
class EmployeeCargoHistorySerializer(serializers.ModelSerializer):
    nombre_analista = serializers.CharField(source='ejecutado_por.username', read_only=True)
    cedula_analista = serializers.CharField(source='ejecutado_por.cedula', read_only=True)
    motivo_movimiento = TipoMovimientoSerializer(source='motivo',read_only=True)
    new_estatus = EstatusSerializer(source='estatus',read_only=True)
  
    new_denominacioncargo = denominacionCargoSerializer(source='denominacioncargo',read_only=True)
    new_denominacioncargoespecifico = denominacionCargoEspecificoSerializer(source='denominacioncargoespecifico',read_only=True)
    new_grado = gradoSerializer(source='gradoid',read_only=True)
    new_tiponomina = TipoNominaSerializer(source='tiponomina',read_only=True)
    new_Dependencia = DependenciaSerializer(source='DependenciasId',read_only=True)
    new_DireccionGeneral = DireccionGeneralSerializer(source='DireccionGeneralid',read_only=True)
    new_DireccionLinea = DireccionLineaSerializer(source='DireccionLineaid',read_only=True)
    new_Coordinacion= CoordinacionSerializer(source='Coordinacionid',read_only=True)

    class Meta:
        model = EmployeeMovementHistory
        fields = [
            'id', 'codigo_puesto', 'fecha_movimiento', 'nombre_analista', 'cedula_analista',
            'motivo_movimiento','new_estatus',
            'new_denominacioncargo', 'new_denominacioncargoespecifico', 'new_grado', 
            'new_tiponomina','new_Dependencia' ,'new_DireccionGeneral', 'new_DireccionLinea', 'new_Coordinacion'
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        prev = EmployeeMovementHistory.objects.filter(
            empleado=instance.empleado,
            fecha_movimiento__lt=instance.fecha_movimiento
        ).select_related(
            'denominacioncargo', 'denominacioncargoespecifico', 'gradoid',
            'tiponomina', 'DependenciasId','DireccionGeneralid', 'DireccionLineaid', 'Coordinacionid','estatus'
        ).order_by('-fecha_movimiento').first()

        representation.update({
            'prev_estatus': EstatusSerializer(prev.estatus).data if prev else None,
            'prev_denominacioncargo': denominacionCargoSerializer(prev.denominacioncargo).data if prev else None,
            'prev_denominacioncargoespecifico': denominacionCargoEspecificoSerializer(prev.denominacioncargoespecifico).data if prev else None,
            'prev_grado': gradoSerializer(prev.gradoid).data if prev and prev.gradoid else None,
            'prev_tiponomina': TipoNominaSerializer(prev.tiponomina).data if prev else None,
            'prev_Dependencia': DependenciaSerializer(prev.DependenciasId).data if prev and prev.DependenciasId else None,
            'prev_DireccionGeneral': DireccionGeneralSerializer(prev.DireccionGeneralid).data if prev and prev.DireccionGeneralid else None,
            'prev_DireccionLinea': DireccionLineaSerializer(prev.DireccionLineaid).data if prev and prev.DireccionLineaid else None,
            'prev_Coordinacion': CoordinacionSerializer(prev.Coordinacionid).data if prev and prev.Coordinacionid else None,
        })

        return representation