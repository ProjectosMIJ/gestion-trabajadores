#importaciones de rest framework
from rest_framework import serializers

# importaciones de modelos y utilidades
from django.db import transaction
from ..models.personal_models import *
from ..models.historial_personal_models import Tipo_movimiento
#importacion de servicios
from ..services.generacion_codigo import generador_codigos 

from ..services.constants import *

from USER.models.user_models import cuenta as User

from ..services.constants_historial import registrar_historial_movimiento
from ..services.report_service import MAPA_REPORTES
from django.db.models import F, Count
from datetime import date, timedelta
from django.apps import apps



# -------------------------------------------------------------
# lista de los distintos campos utilizados en las api 
# -------------------------------------------------------------

    #  para los datos personales 
class SexoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sexo
        fields = '__all__'
class EstadoCivilSerializer(serializers.ModelSerializer):
    class Meta:
        model = estado_civil
        fields = '__all__'
   
# direccion 
class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = direccion_models.Region
        fields = [
            'id',
            'region'
        ]
class EstadoSerializer(serializers.ModelSerializer):
    Region = RegionSerializer(read_only=True)
    class Meta:
        model = direccion_models.Estado
        fields = [
            'id',
            'estado',
            'Region'
        ]     
class MunicipioSerializer(serializers.ModelSerializer):
    class Meta:
        model = direccion_models.Municipio
        fields = [
            'id',
            'municipio'
        ]
class ParroquiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = direccion_models.Parroquia
        fields = [
            'id',
            'parroquia'
        ]
class NivelAcademicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = NivelAcademico
        fields = [
            'id',
            'nivelacademico'
        ]
        
class CarrerasSerializer(serializers.ModelSerializer):
    class Meta:
        model = carreras
        fields = [
            'id',
            'nombre_carrera'
        ]
class MencionSerializer(serializers.ModelSerializer):
    carrera = CarrerasSerializer(source='carrera_id', read_only=True)
    class Meta:
        model = Menciones
        fields = [
            'id',
            'nombre_mencion',
            'carrera'
        ]
class GrupoSanguineoSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrupoSanguineo
        fields = [
            'id',
            'GrupoSanguineo'
        ]
    
class categoriasPatologiasSerializer(serializers.ModelSerializer):
    class Meta:
        model = categorias_patologias
        fields = [
            'id',
            'nombre_categoria'
        ]
class PatologiasSerializer(serializers.ModelSerializer):
    categoria = categoriasPatologiasSerializer(source='categoria_id', read_only=True)
    class Meta:
        model = patologias_Cronicas
        fields = [
            'id',
            'patologia',
            'categoria'
            
        ]
        
class categoriasDiscapacidadesSerializer(serializers.ModelSerializer):
    class Meta:
        model = categorias_discapacidad
        fields = [
            'id',
            'nombre_categoria'
        ]
class DiscapacidadSerializer(serializers.ModelSerializer):
    categoria = categoriasDiscapacidadesSerializer(source='categoria_id', read_only=True)
    class Meta:
        model = Discapacidades
        fields = [
            'id',
            'discapacidad',
            'categoria'
        ]
class TallaCamisaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Talla_Camisas
        fields = [
            'id',
            'talla'
        ]
class Talla_PantalonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Talla_Pantalones
        fields = [
            'id',
            'talla'
        ]

class Talla_ZapatosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Talla_Zapatos
        fields = [
            'id',
            'talla'
        ]
   
   #para los datos de codigo 
class denominacionCargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Denominacioncargo
        fields = [
            'id',
            'cargo'
        ]
class denominacionCargoEspecificoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Denominacioncargoespecifico
        fields = '__all__'  

class OrganismoAdscritoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganismoAdscrito   
        fields = '__all__' 
class gradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grado
        fields = '__all__' 
class TipoPersonalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipo_personal
        fields = '__all__' 

class TipoNominaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tiponomina
        fields = [
            'id',
            'nomina'
        ]


class TipoNominaGeneralSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tiponomina
        fields =[
            'id',
            'nomina',
            'requiere_codig'
            
        ]
     
class DependenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependencias
        fields = '__all__'   
class DireccionGeneralSerializer(serializers.ModelSerializer):
    dependencia = DependenciaSerializer(source='dependenciaId',read_only=True)
    class Meta:
        model = DireccionGeneral
        fields = [
            'id',
            'direccion_general',
            'dependencia'
        ]
    
    def validate_direccion_general(self,value):
        value = value.upper()
        return value
class DireccionLineaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DireccionLinea
        fields = '__all__' 
    
        extra_kwargs = {
            'direccionGeneral': {'write_only': True}
        }
    def validate_direccion_linea(self,value):
        value = value.upper()
        return value
      
class CoordinacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coordinaciones
        fields = [
            'id',
            'Codigo',
            'coordinacion',
            'direccionLinea'
        ] 
    
        extra_kwargs = {
            'direccionLinea': {'write_only': True}
         }
    def validate_coordinacion(self,value):
        value = value.upper()
        return value
    
class EstatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estatus
        fields = '__all__' 
        
        
# -------------------------------------------------------------
# creacion y actualizacion de codigo 
# -------------------------------------------------------------
class CodigosCreateSerializer(serializers.ModelSerializer):
    usuario_id = usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        write_only=True
    )
    class Meta:
        model = AsigTrabajo
        exclude= ['employee','OrganismoAdscritoid','Tipo_personal','estatusid','observaciones']
        
        
    def to_internal_value(self, data):
        
        data = data.copy() if hasattr(data, 'copy') else data.copy()
        fk_fields = [
            "gradoid", "Coordinacion", "DireccionLinea", 
            "DireccionGeneral"
        ]
        for field in fk_fields:
            if data.get(field) == 0 :
                data[field] = None  
        return super().to_internal_value(data)
    
     # validacion que el registro sea para un tipo de nomina permitido (es decir, que no sea de codigo autogenerable)
    def validate_tiponominaid(self,value):
        if  value.requiere_codig:
            raise serializers.ValidationError(
                'El registro de este tipo de nomina no es permitido'
            )
        return value
        
    def validate(self, attrs):
        try:
            attrs['estatusid'] = Estatus.objects.get(estatus__iexact=ESTATUS_VACANTE)
        except Estatus.DoesNotExist:
            raise serializers.ValidationError("El estatus para la asginacion de este codigo no existe")

        try:
            attrs['Tipo_personal'] = Tipo_personal.objects.get(tipo_personal__iexact=PERSONAL_ACTIVO)
        except Tipo_personal.DoesNotExist:
            raise serializers.ValidationError("El tipo de personal para la asignacion de este codigo no existe")
        
        
        dg = attrs.get('DireccionGeneral') 
        dl = attrs.get('DireccionLinea')   
        coor = attrs.get('Coordinacion')   
        if dl and dg:
          
            if dl.direccionGeneral_id != dg.id:
                raise serializers.ValidationError("DireccionLinea La línea  no pertenece a la Dirección General")

        if coor and dl:
            parent_dl_id = getattr(coor, 'direccionLinea_id', None)
            
            if parent_dl_id and parent_dl_id != dl.id:
                raise serializers.ValidationError({
                    "La coordinacion  no pertenece a la Dirección de Línea"
                })
        if coor and not dl:
            raise serializers.ValidationError("Debe seleccionar una Dirección de Línea para asignar esta Coordinación")

        return attrs
    # logica de creacion 
    def create(self, validated_data):
      
       usuario = validated_data.pop('usuario_id')
   
       instance = AsigTrabajo(**validated_data)
       instance._history_user = usuario
            
       instance.save()
            
       return instance

        
class CodigosUpdateSerializer(serializers.ModelSerializer):
    usuario_id = serializers.IntegerField(write_only=True)
    class Meta:
        model = AsigTrabajo
        exclude= ['employee','OrganismoAdscritoid','Tipo_personal','estatusid','codigo']
        
        
    def to_internal_value(self, data):
        
        data = data.copy() if hasattr(data, 'copy') else data.copy()
        fk_fields = [
            "gradoid", "Coordinacion", "DireccionLinea", 
            "DireccionGeneral"
        ]

        for field in fk_fields:
            if data.get(field) == 0 or data.get(field) == "0":
                data[field] = None
                
        
        return super().to_internal_value(data)
    
    # ataja el id del usuario para guardarlo en el historial 
    
    def validate_usuario_id(self, value):
        try:
            return User.objects.get(pk=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("El usuario no existe")
    
    def update(self, instance, validated_data):
        usuario = validated_data.pop('usuario_id')
        
        instance._history_user = usuario

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
# ----------------------------------
# serializer para listar los codigos 
# ----------------------------------
class CodigosListerSerializer(serializers.ModelSerializer):
      
    denominacioncargo = denominacionCargoSerializer(source='denominacioncargoid',read_only= True)
    denominacioncargoespecifico = denominacionCargoEspecificoSerializer(source = 'denominacioncargoespecificoid',read_only = True)
    grado = gradoSerializer(source = 'gradoid',read_only = True)
    tiponomina= TipoNominaSerializer(source = 'tiponominaid',read_only = True)
    OrganismoAdscrito = OrganismoAdscritoSerializer(source='OrganismoAdscritoid',read_only = True)
    
    DireccionGeneral = DireccionGeneralSerializer(read_only = True)
    DireccionLinea = DireccionLineaSerializer(read_only = True)
    Coordinacion = CoordinacionSerializer(read_only = True)
    estatusid = EstatusSerializer(read_only = True)

    
    class Meta:
        model = AsigTrabajo
        fields = [
            'id',
            'codigo',
            'denominacioncargo',
            'denominacioncargoespecifico',
            'grado',
            'tiponomina',
            'OrganismoAdscrito',
            'DireccionGeneral',
            'DireccionLinea',
            'Coordinacion',
            'estatusid',
            'observaciones',
            'fecha_actualizacion',
        ]
        

    
    
# ....................

class CondicionViviendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = condicion_vivienda
        fields = [
            'id',
            'condicion'
        ]

class DatosViviendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = datos_vivienda
        exclude = ['empleado_id','familiar_id']

class PerfilSaludSerializer(serializers.ModelSerializer):
    class Meta:
        model = perfil_salud
        exclude = ['empleado_id','familiar_id']

class PerfilFisicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = perfil_fisico
        exclude = ['empleado_id','familiar_id']

class FormacionAcademicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = formacion_academica
        exclude = ['empleado_id','familiar_id']
        
class AntecedentesServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = antecedentes_servicio
        exclude = ['empleado_id']
# -------------------------------------------------------------
# serializers para el registro y actualizacion de datos personales 
# -------------------------------------------------------------

    
class EmployeeSerializer(serializers.ModelSerializer):
    usuario_id = usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        write_only=True
    )
    datos_vivienda = DatosViviendaSerializer(required=False)
    perfil_salud = PerfilSaludSerializer(required=False)
    perfil_fisico = PerfilFisicoSerializer(required=False)
    formacion_academica = FormacionAcademicaSerializer(required=False)
    antecedentes = AntecedentesServicioSerializer(many=True, required=False)

    class Meta:
        model = Employee
        fields = '__all__'

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else data

        def limp_ceros(dictionary):
            if not isinstance(dictionary, dict): return dictionary
            for key, value in dictionary.items():
                if isinstance(value, list):
                    dictionary[key] = [item for item in value if item != 0]
                elif value == 0:
                    dictionary[key] = None
            return dictionary

        data = limp_ceros(data)
        nested_keys = ['datos_vivienda', 'perfil_salud', 'perfil_fisico', 'formacion_academica']
        for key in nested_keys:
            if key in data: data[key] = limp_ceros(data[key])

        def clean_date(val):
            return val.split('T')[0] if isinstance(val, str) and 'T' in val else val

        date_fields = ['fecha_nacimiento', 'fechaingresoorganismo']
        for f in date_fields:
            if f in data: data[f] = clean_date(data[f])

        if 'antecedentes' in data and isinstance(data['antecedentes'], list):
            for item in data['antecedentes']:
                limp_ceros(item)
                item['fecha_ingreso'] = clean_date(item.get('fecha_ingreso'))
                item['fecha_egreso'] = clean_date(item.get('fecha_egreso'))

        return super().to_internal_value(data)

    def validate_cedulaidentidad(self, value):
        if self.instance and self.instance.cedulaidentidad != value:
            raise serializers.ValidationError("La cedula de identidad no debe ser modificada")
        return value

    def validate_nombres(self, value): return value.upper() if value else value
    def validate_apellidos(self, value): return value.upper() if value else value

    def create(self, validated_data):
 
        usuario_obj = validated_data.pop('usuario_id')
        vivienda_data = validated_data.pop('datos_vivienda', None)
        salud_data = validated_data.pop('perfil_salud', None)
        fisico_data = validated_data.pop('perfil_fisico', None)
        academico_data = validated_data.pop('formacion_academica', None)
        antecedentes_data = validated_data.pop('antecedentes', [])

        instance = Employee(**validated_data)
        instance._history_user = usuario_obj
        instance.save()

        if vivienda_data:
            datos_vivienda.objects.create(empleado_id=instance, **vivienda_data)
        
        if salud_data:
            patologias = salud_data.pop('patologiaCronica', [])
            discapacidades = salud_data.pop('discapacidad', [])
            s_obj = perfil_salud.objects.create(empleado_id=instance, **salud_data)
            if patologias: s_obj.patologiaCronica.set(patologias)
            if discapacidades: s_obj.discapacidad.set(discapacidades)

        if fisico_data:
            perfil_fisico.objects.create(empleado_id=instance, **fisico_data)

        if academico_data:
            formacion_academica.objects.create(empleado_id=instance, **academico_data)

        for ant in antecedentes_data:
            antecedentes_servicio.objects.create(empleado_id=instance, **ant)

        return instance

    def update(self, instance, validated_data):
        usuario_obj = validated_data.pop('usuario_id', None)
        if usuario_obj:
            instance._history_user = usuario_obj

        vivienda_data = validated_data.pop('datos_vivienda', None)
        salud_data = validated_data.pop('perfil_salud', None)
        fisico_data = validated_data.pop('perfil_fisico', None)
        academico_data = validated_data.pop('formacion_academica', None)
        antecedentes_data = validated_data.pop('antecedentes', None)

        if vivienda_data:
            datos_vivienda.objects.update_or_create(empleado_id=instance, defaults=vivienda_data)
        
        if salud_data:
            patologias = salud_data.pop('patologiaCronica', None)
            discapacidades = salud_data.pop('discapacidad', None)
            s_obj, _ = perfil_salud.objects.update_or_create(empleado_id=instance, defaults=salud_data)
            if patologias is not None: s_obj.patologiaCronica.set(patologias)
            if discapacidades is not None: s_obj.discapacidad.set(discapacidades)

        if fisico_data:
            perfil_fisico.objects.update_or_create(empleado_id=instance, defaults=fisico_data)

        if academico_data:
            formacion_academica.objects.update_or_create(empleado_id=instance, defaults=academico_data)

        if antecedentes_data is not None:
            instance.antecedentes_servicio_set.all().delete()
            for ant in antecedentes_data:
                antecedentes_servicio.objects.create(empleado_id=instance, **ant)

        return super().update(instance, validated_data)
# -------------------------------------------------------------
# serializers para listar los datos personales
# -------------------------------------------------------------

class EmployeeCargoSerializer(serializers.ModelSerializer):

    sexo = SexoSerializer(source='sexoid', read_only=True)
    estadoCivil = EstadoCivilSerializer(read_only=True)
    
    datos_vivienda = serializers.SerializerMethodField()
    perfil_salud = serializers.SerializerMethodField()
    perfil_fisico = serializers.SerializerMethodField()
    formacion_academica = serializers.SerializerMethodField()
    
  
    antecedentes = AntecedentesServicioSerializer(
        source='antecedentes_servicio_set', 
        many=True, 
        read_only=True
    )

    asignaciones = CodigosListerSerializer(source='assignments', many=True, read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 
            'cedulaidentidad', 
            'nombres', 
            'apellidos', 
            'profile',
            'fecha_nacimiento', 
            'fechaingresoorganismo',
            'n_contrato', 
            'sexo', 
            'estadoCivil', 
            'datos_vivienda',   
            'perfil_salud',      
            'perfil_fisico',     
            'formacion_academica',  
            'antecedentes',
            'fecha_actualizacion', 
            'asignaciones'
        ]

    def get_datos_vivienda(self, obj):
        vivienda = obj.datos_vivienda_set.first()
        if not vivienda: return None
        return {
            "estado": EstadoSerializer(vivienda.estado_id).data if vivienda.estado_id else None,
            "municipio": MunicipioSerializer(vivienda.municipio_id).data if vivienda.municipio_id else None,
            "parroquia": ParroquiaSerializer(vivienda.parroquia).data if vivienda.parroquia else None,
            "direccionExacta": vivienda.direccion_exacta,
            "condicion":CondicionViviendaSerializer(vivienda.condicion_vivienda_id).data if vivienda.condicion_vivienda_id else None
        }

    def get_perfil_salud(self, obj):
        salud = obj.perfil_salud_set.first()
        if not salud: return None
        return {
            "grupoSanguineo": GrupoSanguineoSerializer(salud.grupoSanguineo).data if salud.grupoSanguineo else None,
            "discapacidad": DiscapacidadSerializer(salud.discapacidad, many=True).data if salud.discapacidad else None,
            "patologiasCronicas": PatologiasSerializer(salud.patologiaCronica, many=True).data if salud.patologiaCronica else None
        }

    def get_perfil_fisico(self, obj):
        fisico = obj.perfil_fisico_set.first()
        if not fisico: return None
        return {
            "tallaCamisa": TallaCamisaSerializer(fisico.tallaCamisa).data if fisico.tallaCamisa else None,
            "tallaPantalon": Talla_PantalonSerializer(fisico.tallaPantalon).data if fisico.tallaPantalon else None,
            "tallaZapatos": Talla_ZapatosSerializer(fisico.tallaZapatos).data if fisico.tallaZapatos else None
        }

    def get_formacion_academica(self, obj):
        formacion = obj.formacion_academica_set.first()
        if not formacion: return None
        return {
            "nivelAcademico": NivelAcademicoSerializer(formacion.nivel_Academico_id).data if formacion.nivel_Academico_id else None,
            "institucion": formacion.institucion if formacion.institucion else None,
            "capacitacion": formacion.capacitacion if formacion.capacitacion else None,
            "carrera": CarrerasSerializer(formacion.carrera_id).data if formacion.carrera_id else None,
            "mension": MencionSerializer(formacion.mencion_id).data if formacion.mencion_id else None
            
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        asignaciones_data = representation.get('asignaciones')
        if asignaciones_data is not None and len(asignaciones_data) == 0:
            pass
           
        
        
        return representation


class EmployeeListarDataSerializer(serializers.ModelSerializer):
    sexo = SexoSerializer(source='sexoid', read_only=True)
    estadoCivil = EstadoCivilSerializer(read_only=True)

    datos_vivienda = serializers.SerializerMethodField()
    perfil_salud = serializers.SerializerMethodField()
    perfil_fisico = serializers.SerializerMethodField()
    formacion_academica = serializers.SerializerMethodField()

    antecedentes = AntecedentesServicioSerializer(
        source='antecedentes_servicio_set', 
        many=True, 
        read_only=True
    )

    class Meta:
        model = Employee
        fields = [
            'id', 'cedulaidentidad', 'nombres', 'apellidos', 'profile',
            'fecha_nacimiento', 'fechaingresoorganismo', 'n_contrato', 
            'sexo', 'estadoCivil', 'datos_vivienda', 'perfil_salud', 
            'perfil_fisico', 'formacion_academica', 'antecedentes',
            'fecha_actualizacion'
        ]

    def get_datos_vivienda(self, obj):
        vivienda = obj.datos_vivienda_set.first()
        if not vivienda: return None
        return {
            "estado": EstadoSerializer(vivienda.estado_id).data if vivienda.estado_id else None,
            "municipio": MunicipioSerializer(vivienda.municipio_id).data if vivienda.municipio_id else None,
            "parroquia": ParroquiaSerializer(vivienda.parroquia).data if vivienda.parroquia else None,
            "direccionExacta": vivienda.direccion_exacta,
            "condicion": vivienda.condicion_vivienda_id.condicion if vivienda.condicion_vivienda_id else None
        }

    def get_perfil_salud(self, obj):
        salud = obj.perfil_salud_set.first()
        if not salud: return None
        return {
            "grupoSanguineo": GrupoSanguineoSerializer(salud.grupoSanguineo).data if salud.grupoSanguineo else None,
            "discapacidad": DiscapacidadSerializer(salud.discapacidad,many=True).data,
            "patologiasCronicas": PatologiasSerializer(salud.patologiaCronica, many=True).data
        }

    def get_perfil_fisico(self, obj):
        fisico = obj.perfil_fisico_set.first()
        if not fisico: return None
        return {
            "tallaCamisa": TallaCamisaSerializer(fisico.tallaCamisa).data if fisico.tallaCamisa else None,
            "tallaPantalon": Talla_PantalonSerializer(fisico.tallaPantalon).data if fisico.tallaPantalon else None,
            "tallaZapatos": Talla_ZapatosSerializer(fisico.tallaZapatos).data if fisico.tallaZapatos else None
        }

    def get_formacion_academica(self, obj):
        formacion = obj.formacion_academica_set.first()
        if not formacion: return None
        return {
            "nivelAcademico": NivelAcademicoSerializer(formacion.nivel_Academico_id).data if formacion.nivel_Academico_id else None,
            "institucion": formacion.institucion,
            "capacitacion": formacion.capacitacion,
            "carrera": CarrerasSerializer(formacion.carrera_id).data if formacion.carrera_id else None,
            "mencion": MencionSerializer(formacion.mencion_id).data if formacion.mencion_id else None
        }


# # -------------------------------
# serializer para asignar codigo 
# -------------------------------
class AsigCargoSerializer(serializers.ModelSerializer):
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        write_only=True
    )

    class Meta:
        model = AsigTrabajo
        fields = ['employee', 'usuario_id']

    def validate(self, attrs):
        try:
            # Asegúrate de que ESTATUS_ACTIVO esté definido o usa el string directamente
            attrs['estatusid'] = Estatus.objects.get(estatus__iexact='ACTIVO')
        except Estatus.DoesNotExist:
            raise serializers.ValidationError("El estatus ACTIVO no existe")
        return attrs

    def update(self, instance, validated_data):
        # 1. Extraemos los datos necesarios
        usuario = validated_data.pop('usuario_id')
        estatus_activo = validated_data.pop('estatusid')
        # Obtenemos el nuevo empleado del validated_data (si viene) o el actual
        nuevo_empleado = validated_data.get('employee', instance.employee)

        # 2. Validación preventiva: si no hay empleado, no podemos seguir
        if not nuevo_empleado:
            raise serializers.ValidationError(
                {"employee": "Se requiere un empleado para realizar esta asignación."}
            )

        # 3. Actualizamos y guardamos la instancia de AsigTrabajo
        instance.employee = nuevo_empleado
        instance.estatusid = estatus_activo
        instance._history_user = usuario
        instance.save()
        
        # 4. Intentamos registrar el historial
        try:
            motivo_ingreso = Tipo_movimiento.objects.get(movimiento__iexact="ASIGNACION DE CARGO")
            
            # PASAMOS 'nuevo_empleado' directamente para asegurar que no sea NULL
            registrar_historial_movimiento(
                empleado=nuevo_empleado,
                puesto=instance,
                tipo_movimiento='INGRESO',
                motivo=motivo_ingreso,
                usuario=usuario
            )
        except Tipo_movimiento.DoesNotExist:
            raise serializers.ValidationError("El motivo 'ASIGNACION DE CARGO' no existe")

        return instance

# -------------------------------
# serializer para asignar codigo autogenerable
# -------------------------------   
class RegisterCargoEspecialSerializer(serializers.ModelSerializer):
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        write_only=True
    )

    class Meta: 
        model = AsigTrabajo
        exclude = ['Tipo_personal', 'estatusid', 'codigo', 'observaciones']

    def to_internal_value(self, data):
        # Corrección: data.copy() solo una vez
        data = data.copy() if hasattr(data, 'copy') else data
        fk_fields = ['OrganismoAdscrituitid', 'gradoid', 'Coordinacion', 'DireccionLinea', 'DireccionGeneral']
        for field in fk_fields:
            if data.get(field) == 0 or data.get(field) == "0":
                data[field] = None
        return super().to_internal_value(data)

    def validate_tiponominaid(self, value):
        if not value.requiere_codig:
            raise serializers.ValidationError('El registro de este tipo de nomina no es permitido')
        return value

    def validate(self, attrs):
        # 1. Obtención de objetos necesarios
        try:
            attrs['estatus_obj'] = Estatus.objects.get(estatus__iexact=ESTATUS_ACTIVO)
            attrs['personal_obj'] = Tipo_personal.objects.get(tipo_personal__iexact=PERSONAL_ACTIVO)
        except (Estatus.DoesNotExist, Tipo_personal.DoesNotExist) as e:
            raise serializers.ValidationError(f"Error de configuración: {str(e)}")

        # 2. Generación de código
        tipo_nomina = attrs.get('tiponominaid')
        if not tipo_nomina or not tipo_nomina.nomina:
            raise serializers.ValidationError("El tipo de nomina no es válida")

        nombre_nomina = tipo_nomina.nomina.upper()
        palabras_ignorar = ['DE', 'LA', 'EL', 'Y', 'LOS', 'LAS', 'EN', 'PARA']
        palabras = [word for word in nombre_nomina.split() if word not in palabras_ignorar]
        
        prefix = "".join([word[0] for word in palabras]) + "_" if palabras else "GEN_"
        attrs['codigo_generado'] = generador_codigos(prefix)

        return attrs 

    def create(self, validated_data):
        # Extraer datos que no van directo al modelo AsigTrabajo
        usuario_obj = validated_data.pop('usuario_id')
        estatus_obj = validated_data.pop('estatus_obj')
        personal_obj = validated_data.pop('personal_obj')
        codigo_generado = validated_data.pop('codigo_generado')
        
        # El empleado es obligatorio para el historial
        empleado_obj = validated_data.get('employee')
        if not empleado_obj:
            raise serializers.ValidationError({"employee": "Debe asignar un empleado para registrar el historial."})

        try:
            with transaction.atomic():
                # Preparar instancia
                instance = AsigTrabajo(**validated_data)
                instance.estatusid = estatus_obj
                instance.Tipo_personal = personal_obj
                instance.codigo = codigo_generado
                instance._history_user = usuario_obj
                instance.save() 

                # Buscar motivo
                try:
                    motivo_ingreso = Tipo_movimiento.objects.get(movimiento__iexact="ASIGNACION DE CARGO")
                except Tipo_movimiento.DoesNotExist:
                    raise ValueError("El motivo 'ASIGNACION DE CARGO' no existe")

                # Registrar Historial usando el objeto empleado_obj validado
                registrar_historial_movimiento(
                    empleado=empleado_obj, 
                    puesto=instance,
                    tipo_movimiento='INGRESO',
                    motivo=motivo_ingreso,
                    usuario=usuario_obj
                )

                return instance

        except Exception as e:
            # Importante: Esto te permite ver en consola qué falló realmente durante el desarrollo
            print(f"DEBUG: Error en create: {str(e)}")
            raise serializers.ValidationError(f"No se pudo completar el registro: {str(e)}")
# class ReporteDinamicoSerializer(serializers.Serializer):
#     TIPO_REPORTE_CHOICES = [
#         ('conteo', 'Conteo de registros'),
#         ('lista', 'Lista de valores'),
#     ]
#     tabla = serializers.CharField(max_length=100) # Ej: "Employee" o "AsigTrabajo"
#     columna = serializers.CharField(max_length=100)
#     tipo_reporte = serializers.ChoiceField(choices=TIPO_REPORTE_CHOICES)
#     filtros = serializers.JSONField(required=False, default=dict)


class ReporteDinamicoSerializer(serializers.Serializer):
    categoria = serializers.ChoiceField(choices=[('empleados', 'Empleados'), ('familiares', 'Familiares')])
    agrupar_por = serializers.CharField()
    tipo_reporte = serializers.ChoiceField(choices=[('conteo', 'Conteo'), ('lista', 'Lista')])
    filtros = serializers.JSONField(required=False, default=dict)

    def ejecutar(self):

        data = self.validated_data
        config = MAPA_REPORTES[data['categoria']]

        Model = apps.get_model('RAC', config['modelo'])
 
        campo_db = config['campos_permitidos'].get(data['agrupar_por'])
        if not campo_db:
            raise serializers.ValidationError({"agrupar_por": "Campo no permitido."})
        filtros_finales = {}
        for clave, valor in data['filtros'].items():
            if clave in config['filtros_permitidos']:
                campo_filtro = config['filtros_permitidos'][clave]
                
                if clave == "edad_max":
                    fecha_limite = date.today() - timedelta(days=int(valor) * 365.25)
                    filtros_finales[campo_filtro] = fecha_limite
                else:
                    filtros_query = {campo_filtro: valor}
                    filtros_finales.update(filtros_query)

        queryset = Model.objects.filter(**filtros_finales)

        if data['tipo_reporte'] == 'conteo':
            return queryset.values(label=F(campo_db)).annotate(
                total=Count(campo_db)
            ).order_by('-total')
        
        return queryset.values(label=F(campo_db)).distinct()