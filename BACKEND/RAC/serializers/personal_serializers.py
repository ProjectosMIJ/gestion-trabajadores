#importaciones de rest framework
from rest_framework import serializers

# importaciones de modelos y utilidades
from django.db.models import Q
from ..models.personal_models import *

#importacion de servicios
from ..services.generacion_codigo import generador_codigos 

from ..services.constants import *

from USER.models.user_models import cuenta as User

from ..services.constants_historial import registrar_historial_movimiento


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
        
class DireccionGeneralSerializer(serializers.ModelSerializer):
    class Meta:
        model = DireccionGeneral
        fields = '__all__' 
    
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
    usuario_id = serializers.IntegerField(write_only=True)
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
            if data.get(field) == 0 or data.get(field) == "0":
                data[field] = None  

        
        return super().to_internal_value(data)
    
     # validacion que el registro sea para un tipo de nomina permitido (es decir, que no sea de codigo autogenerable)
    def validate_tiponominaid(self,value):
        if  value.requiere_codig:
            raise serializers.ValidationError(
                'El registro de este tipo de nomina no es permitido'
            )
        return value
    
    
    # logica de creacion 
    def create(self, validated_data):
      id_usuario = validated_data.pop('usuario_id')
        
      try:
        
            usuario_obj = User.objects.get(pk=id_usuario)
      except User.DoesNotExist:
            raise serializers.ValidationError({"El usuario no existe"})
      
    #    para que se asigne como un codigo con estatus vacante 
      try:
        estatus_obj = Estatus.objects.get(estatus__iexact=ESTATUS_VACANTE)
        validated_data['estatusid'] = estatus_obj
      except Estatus.DoesNotExist:
        raise serializers.ValidationError({
             "El estatus para la asginacion de este codigo no existe"
        })
        
        # para identificar que el codigo pertece a un tipo de personal activo y no pasivo 
      try:
        personal_obj = Tipo_personal.objects.get(tipo_personal__iexact=PERSONAL_ACTIVO)
        validated_data['Tipo_personal'] = personal_obj
      except Tipo_personal.DoesNotExist:
        raise serializers.ValidationError({
             "El tipo de personal para la asignacion de este codigo no existe"
        })

      try:
            instance = AsigTrabajo(**validated_data)
            
            instance._history_user = usuario_obj
            
            instance.save()
            
            return instance
 
      except Exception as e:

        raise serializers.ValidationError({
            f"No se pudo crear el registro: {str(e)}"
        })
        
        
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
    
    def update(self, instance, validated_data):
        id_usuario = validated_data.pop('usuario_id')

        try:
            usuario_obj = User.objects.get(pk=id_usuario)
        except User.DoesNotExist:
            raise serializers.ValidationError({"El usuario no existe"})

        instance._history_user = usuario_obj

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
        
    def to_representation(self, instance):
        
        representation = super().to_representation(instance)
        
            
        for key, value in representation.items():
            if value is None:
                representation[key] = ''
        return representation
    
    
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
    usuario_id = serializers.IntegerField(write_only=True)
    

    datos_vivienda = DatosViviendaSerializer(required=False)
    perfil_salud = PerfilSaludSerializer(required=False)
    perfil_fisico = PerfilFisicoSerializer(required=False)
    formacion_academica = FormacionAcademicaSerializer(required=False)
    antecedentes = AntecedentesServicioSerializer(many=True, required=False)
    class Meta:
        model = Employee
        fields = '__all__'

  
    def validate_cedulaidentidad(self, value):
        if self.instance and self.instance.cedulaidentidad != value:
            raise serializers.ValidationError("La cedula es un campo permanente.")
        return value

    def validate_nombres(self, value): return value.upper() if value else value
    def validate_apellidos(self, value): return value.upper() if value else value

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else data
        

        def limp_ceros(dictionary):
            if not isinstance(dictionary, dict):
                return dictionary
            
            for key, value in dictionary.items():
                if isinstance(value, list):
                    dictionary[key] = [item for item in value if item != 0 ]

                elif value == 0:
                    dictionary[key] = None
                    
            return dictionary
        data = limp_ceros(data)

        nested_objects = [
            'datos_vivienda', 
            'perfil_salud', 
            'perfil_fisico', 
            'formacion_academica'
        ]
        
        for obj_key in nested_objects:
            if obj_key in data and isinstance(data[obj_key], dict):
                data[obj_key] = limp_ceros(data[obj_key])
                
        if 'antecedentes' in data and isinstance(data['antecedentes'], list):
            cleaned_antecedentes = []
            for item in data['antecedentes']:
                item = limp_ceros(item)
                # Limpiar fechas  de antecedentes
                ant_date_fields = ['fecha_ingreso', 'fecha_egreso']
                for f in ant_date_fields:
                    val = item.get(f)
                    if val and isinstance(val, str) and 'T' in val:
                        item[f] = val.split('T')[0]
                cleaned_antecedentes.append(item)
            data['antecedentes'] = cleaned_antecedentes

        if 'antecedentes' in data and isinstance(data['antecedentes'], list):
            data['antecedentes'] = [limp_ceros(item) for item in data['antecedentes']]

        date_fields = ['fecha_nacimiento', 'fechaingresoorganismo']
        for field in date_fields:
            value = data.get(field)
            if value and isinstance(value, str) and 'T' in value:
                data[field] = value.split('T')[0]

        return super().to_internal_value(data)

    def create(self, validated_data):
        id_usuario = validated_data.pop('usuario_id')
        vivienda_data = validated_data.pop('datos_vivienda', None)
        salud_data = validated_data.pop('perfil_salud', None)
        fisico_data = validated_data.pop('perfil_fisico', None)
        academico_data = validated_data.pop('formacion_academica', None)
        antecedentes_data = validated_data.pop('antecedentes', [])
        try:
            usuario_obj = User.objects.get(pk=id_usuario)
        except User.DoesNotExist:
            raise serializers.ValidationError({"usuario_id": "El usuario no existe"})

        instance = Employee.objects.create(**validated_data)
        instance._history_user = usuario_obj
        instance.save()

        if vivienda_data:
            datos_vivienda.objects.create(empleado_id=instance, **vivienda_data)
        
        if salud_data:
            patologias = salud_data.pop('patologiaCronica', [])
            discapacidades = salud_data.pop('discapacidad', [])
            
            s_obj = perfil_salud.objects.create(empleado_id=instance, **salud_data)
            
            if patologias:
                s_obj.patologiaCronica.set(patologias)
            
            if discapacidades:
                s_obj.discapacidad.set(discapacidades)
                
         

        if fisico_data:
            perfil_fisico.objects.create(empleado_id=instance, **fisico_data)

        if academico_data:
            formacion_academica.objects.create(empleado_id=instance, **academico_data)
        
        for ant in antecedentes_data:
            antecedentes_servicio.objects.create(empleado_id=instance, **ant)
        return instance

    def update(self, instance, validated_data):
        id_usuario = validated_data.pop('usuario_id', None)

        vivienda_data = validated_data.pop('datos_vivienda', None)
        salud_data = validated_data.pop('perfil_salud', None)
        fisico_data = validated_data.pop('perfil_fisico', None)
        academico_data = validated_data.pop('formacion_academica', None)
        antecedentes_data = validated_data.pop('antecedentes', None)

        if id_usuario:
            try:
                instance._history_user = User.objects.get(pk=id_usuario)
            except User.DoesNotExist:
                raise serializers.ValidationError({"usuario_id": "El usuario no existe"})

        # Actualizar datos de vivienda si existen
        if vivienda_data:
            datos_vivienda.objects.update_or_create(empleado_id=instance, defaults=vivienda_data)
       
            
        if salud_data:
            
            patologias = salud_data.pop('patologiaCronica', None)
            discapacidades = salud_data.pop('discapacidad', None)

           
            s_obj, created = perfil_salud.objects.update_or_create(
                empleado_id=instance, 
                defaults=salud_data
            )

           
            if patologias is not None:
                s_obj.patologiaCronica.set(patologias)
            if discapacidades is not None:
                s_obj.discapacidad.set(discapacidades)
        
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
            "estado": EstadoSerializer(vivienda.estado_id).data,
            "municipio": MunicipioSerializer(vivienda.municipio_id).data,
            "parroquia": ParroquiaSerializer(vivienda.parroquia).data,
            "direccionExacta": vivienda.direccion_exacta,
            "condicion": vivienda.condicion_vivienda_id.condicion if vivienda.condicion_vivienda_id else ""
        }

    def get_perfil_salud(self, obj):
        salud = obj.perfil_salud_set.first()
        if not salud: return None
        return {
            "grupoSanguineo": GrupoSanguineoSerializer(salud.grupoSanguineo).data,
            "discapacidad": DiscapacidadSerializer(salud.discapacidad, many=True).data,
            "patologiasCronicas": PatologiasSerializer(salud.patologiaCronica, many=True).data
        }

    def get_perfil_fisico(self, obj):
        fisico = obj.perfil_fisico_set.first()
        if not fisico: return None
        return {
            "tallaCamisa": TallaCamisaSerializer(fisico.tallaCamisa).data,
            "tallaPantalon": Talla_PantalonSerializer(fisico.tallaPantalon).data,
            "tallaZapatos": Talla_ZapatosSerializer(fisico.tallaZapatos).data
        }

    def get_formacion_academica(self, obj):
        formacion = obj.formacion_academica_set.first()
        if not formacion: return None
        return {
            "nivelAcademico": NivelAcademicoSerializer(formacion.nivel_Academico_id).data,
            "institucion": formacion.institucion,
            "capacitacion": formacion.capacitacion,
            "carrera": CarrerasSerializer(formacion.carrera_id).data ,
            "mension": MencionSerializer(formacion.mencion_id).data
            
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        asignaciones_data = representation.get('asignaciones')
        if asignaciones_data is not None and len(asignaciones_data) == 0:
            pass
           
        for key, value in representation.items():
            if value is None:
                representation[key] = ''
        
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
            "estado": EstadoSerializer(vivienda.estado_id).data if vivienda.estado_id else "",
            "municipio": MunicipioSerializer(vivienda.municipio_id).data if vivienda.municipio_id else "",
            "parroquia": ParroquiaSerializer(vivienda.parroquia).data if vivienda.parroquia else "",
            "direccionExacta": vivienda.direccion_exacta,
            "condicion": vivienda.condicion_vivienda_id.condicion if vivienda.condicion_vivienda_id else ""
        }

    def get_perfil_salud(self, obj):
        salud = obj.perfil_salud_set.first()
        if not salud: return None
        return {
            "grupoSanguineo": GrupoSanguineoSerializer(salud.grupoSanguineo).data if salud.grupoSanguineo else "",
            "discapacidad": DiscapacidadSerializer(salud.discapacidad,many=True).data,
            "patologiasCronicas": PatologiasSerializer(salud.patologiaCronica, many=True).data
        }

    def get_perfil_fisico(self, obj):
        fisico = obj.perfil_fisico_set.first()
        if not fisico: return None
        return {
            "tallaCamisa": TallaCamisaSerializer(fisico.tallaCamisa).data if fisico.tallaCamisa else "",
            "tallaPantalon": Talla_PantalonSerializer(fisico.tallaPantalon).data if fisico.tallaPantalon else "",
            "tallaZapatos": Talla_ZapatosSerializer(fisico.tallaZapatos).data if fisico.tallaZapatos else ""
        }

    def get_formacion_academica(self, obj):
        formacion = obj.formacion_academica_set.first()
        if not formacion: return None
        return {
            "nivelAcademico": NivelAcademicoSerializer(formacion.nivel_Academico_id).data if formacion.nivel_Academico_id else "",
            "institucion": formacion.institucion,
            "capacitacion": formacion.capacitacion,
            "carrera": CarrerasSerializer(formacion.carrera_id).data if formacion.carrera_id else "",
            "mencion": MencionSerializer(formacion.mencion_id).data if formacion.mencion_id else ""
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        for key, value in representation.items():
            if value is None:
                representation[key] = ''
        return representation
# # -------------------------------
# serializer para asignar codigo 
# -------------------------------
class AsigCargoSerializer(serializers.ModelSerializer):
    usuario_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = AsigTrabajo
        fields = [
            'employee',
            'usuario_id'
        ]
    
    def update(self, instance, validated_data):
        #  obtiene el id del usuario para asignarlo en el historial 
        id_usuario = validated_data.pop('usuario_id')
        
        try:
            usuario_obj = User.objects.get(pk=id_usuario)
        except User.DoesNotExist:
            raise serializers.ValidationError({ "El usuario no existe"})
        
        #  Obteniene el estatus ACTIVO
        try:
            estatus_activo = Estatus.objects.get(estatus__iexact=ESTATUS_ACTIVO)
        except Estatus.DoesNotExist:
            raise serializers.ValidationError({
                "error": "El estatus ACTIVO no está configurado en el sistema."
            })

        #  actualiza las instancias 
        instance.employee = validated_data.get('employee', instance.employee)
        instance.estatusid = estatus_activo
        
        # inserta el usuario en el historial
        instance._history_user = usuario_obj
        
        try:
            instance.save()
            
            # Registrar el movimiento en el historial de personal 
            registrar_historial_movimiento(
                empleado=instance.employee,
                puesto=instance,
                tipo_movimiento='INGRESO',
                motivo="ASIGNACION DE CARGO",
                usuario=usuario_obj
            )
             
            return instance

        except Exception as e:
            raise serializers.ValidationError({
                "error": f"No se pudo actualizar el registro: {str(e)}"
            })
# -------------------------------
# serializer para asignar codigo autogenerable
# -------------------------------   
class RegisterCargoEspecialSerializer(serializers.ModelSerializer):
    usuario_id = serializers.IntegerField(write_only=True)
    class Meta: 
        model = AsigTrabajo
        exclude = ['Tipo_personal','estatusid', 'codigo','observaciones']
        
    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else data.copy()
        
        fk_fields = ['OrganismoAdscritoid', 'gradoid', 'Coordinacion', 'DireccionLinea']

        for field in fk_fields:
            if data.get(field) == 0 or data.get(field) == "0":
                data[field] = None
            
        return super().to_internal_value(data)
    
        # validacion para el tipo de nomina 
    def validate_tiponominaid(self,value):
        if not value.requiere_codig:
            raise serializers.ValidationError(
                'El registro de este tipo de nomina no es permitido'
            )
        return value
    
    # logica de creacion 
    
    def create(self,validated_data):
        
        id_del_usuario = validated_data.pop('usuario_id')
        
        try:
            usuario_obj = User.objects.get(pk=id_del_usuario)
        except User.DoesNotExist:
            raise serializers.ValidationError({"El usuario especificado no existe"})
        try:
          estatus_obj = Estatus.objects.get(estatus__iexact=ESTATUS_ACTIVO)
          validated_data['estatusid'] = estatus_obj
        except Estatus.DoesNotExist:
          raise serializers.ValidationError({
             "El estatus para la asginacion de este codigo no existe."
        })
        
        try:
          personal_obj = Tipo_personal.objects.get(tipo_personal__iexact=PERSONAL_ACTIVO)
          validated_data['Tipo_personal'] = personal_obj
        except Tipo_personal.DoesNotExist:
          raise serializers.ValidationError({
             "El tipo de personal para la asignacion de este codigo no existe"
        })
        # logica para el prefijo y la creacion de codigo 
        tipo_nomina = validated_data.get('tiponominaid')
  
        if not tipo_nomina or not tipo_nomina.nomina:
          raise serializers.ValidationError( "El tipo de nómina no tiene una descripción válida.")
      
        nombre_nomina = tipo_nomina.nomina.upper()
        palabras_ignorar = ['DE', 'LA', 'EL', 'Y', 'LOS', 'LAS', 'EN', 'PARA']
        palabras = [word for word in nombre_nomina.split() if word not in palabras_ignorar]
        if not palabras:
         raise serializers.ValidationError({ "No se pudo generar un prefijo desde el nombre de la nómina"})
        
         # Unimos las iniciales y agregamos el guion bajo
        prefix = "".join([word[0] for word in palabras]) + "_"
        validated_data['codigo'] = generador_codigos(prefix)
        
        
        
        try:
            
            instance = AsigTrabajo(**validated_data)
            instance._history_user = usuario_obj
            instance.save()

            # 3. REGISTRO EN EL HISTORIAL
            registrar_historial_movimiento(
                empleado=instance.employee, 
                puesto=instance,
                tipo_movimiento='INGRESO',
                motivo=f"REGISTRO INICIAL: {tipo_nomina.nomina}",
                usuario=usuario_obj
             )

            return instance
        except Exception as e:

         raise serializers.ValidationError({
            "error": f"No se pudo crear el registro: {str(e)}"
        })
         
         
         


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
        
class DireccionGeneralSerializer(serializers.ModelSerializer):
    class Meta:
        model = DireccionGeneral
        fields = '__all__' 
    
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
    usuario_id = serializers.IntegerField(write_only=True)
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
            if data.get(field) == 0 or data.get(field) == "0":
                data[field] = None  

        
        return super().to_internal_value(data)
    
     # validacion que el registro sea para un tipo de nomina permitido (es decir, que no sea de codigo autogenerable)
    def validate_tiponominaid(self,value):
        if  value.requiere_codig:
            raise serializers.ValidationError(
                'El registro de este tipo de nomina no es permitido'
            )
        return value
    
    
    # logica de creacion 
    def create(self, validated_data):
      id_usuario = validated_data.pop('usuario_id')
        
      try:
        
            usuario_obj = User.objects.get(pk=id_usuario)
      except User.DoesNotExist:
            raise serializers.ValidationError({"El usuario no existe"})
      
    #    para que se asigne como un codigo con estatus vacante 
      try:
        estatus_obj = Estatus.objects.get(estatus__iexact=ESTATUS_VACANTE)
        validated_data['estatusid'] = estatus_obj
      except Estatus.DoesNotExist:
        raise serializers.ValidationError({
             "El estatus para la asginacion de este codigo no existe"
        })
        
        # para identificar que el codigo pertece a un tipo de personal activo y no pasivo 
      try:
        personal_obj = Tipo_personal.objects.get(tipo_personal__iexact=PERSONAL_ACTIVO)
        validated_data['Tipo_personal'] = personal_obj
      except Tipo_personal.DoesNotExist:
        raise serializers.ValidationError({
             "El tipo de personal para la asignacion de este codigo no existe"
        })

      try:
            instance = AsigTrabajo(**validated_data)
            
            instance._history_user = usuario_obj
            
            instance.save()
            
            return instance
 
      except Exception as e:

        raise serializers.ValidationError({
            f"No se pudo crear el registro: {str(e)}"
        })
        
        
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
    
    def update(self, instance, validated_data):
        id_usuario = validated_data.pop('usuario_id')

        try:
            usuario_obj = User.objects.get(pk=id_usuario)
        except User.DoesNotExist:
            raise serializers.ValidationError({"El usuario no existe"})

        instance._history_user = usuario_obj

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
        
    def to_representation(self, instance):
        
        representation = super().to_representation(instance)
        
            
        for key, value in representation.items():
            if value is None:
                representation[key] = ''
        return representation
    
    
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
    usuario_id = serializers.IntegerField(write_only=True)
    

    datos_vivienda = DatosViviendaSerializer(required=False)
    perfil_salud = PerfilSaludSerializer(required=False)
    perfil_fisico = PerfilFisicoSerializer(required=False)
    formacion_academica = FormacionAcademicaSerializer(required=False)
    antecedentes = AntecedentesServicioSerializer(many=True, required=False)
    class Meta:
        model = Employee
        fields = '__all__'

  
    def validate_cedulaidentidad(self, value):
        if self.instance and self.instance.cedulaidentidad != value:
            raise serializers.ValidationError("La cedula es un campo permanente.")
        return value

    def validate_nombres(self, value): return value.upper() if value else value
    def validate_apellidos(self, value): return value.upper() if value else value

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else data
        

        def limp_ceros(dictionary):
            if not isinstance(dictionary, dict):
                return dictionary
            
            for key, value in dictionary.items():
                if isinstance(value, list):
                    dictionary[key] = [item for item in value if item != 0 ]

                elif value == 0:
                    dictionary[key] = None
                    
            return dictionary
        data = limp_ceros(data)

        nested_objects = [
            'datos_vivienda', 
            'perfil_salud', 
            'perfil_fisico', 
            'formacion_academica'
        ]
        
        for obj_key in nested_objects:
            if obj_key in data and isinstance(data[obj_key], dict):
                data[obj_key] = limp_ceros(data[obj_key])
                
        if 'antecedentes' in data and isinstance(data['antecedentes'], list):
            cleaned_antecedentes = []
            for item in data['antecedentes']:
                item = limp_ceros(item)
                # Limpiar fechas  de antecedentes
                ant_date_fields = ['fecha_ingreso', 'fecha_egreso']
                for f in ant_date_fields:
                    val = item.get(f)
                    if val and isinstance(val, str) and 'T' in val:
                        item[f] = val.split('T')[0]
                cleaned_antecedentes.append(item)
            data['antecedentes'] = cleaned_antecedentes

        if 'antecedentes' in data and isinstance(data['antecedentes'], list):
            data['antecedentes'] = [limp_ceros(item) for item in data['antecedentes']]

        date_fields = ['fecha_nacimiento', 'fechaingresoorganismo']
        for field in date_fields:
            value = data.get(field)
            if value and isinstance(value, str) and 'T' in value:
                data[field] = value.split('T')[0]

        return super().to_internal_value(data)

    def create(self, validated_data):
        id_usuario = validated_data.pop('usuario_id')
        vivienda_data = validated_data.pop('datos_vivienda', None)
        salud_data = validated_data.pop('perfil_salud', None)
        fisico_data = validated_data.pop('perfil_fisico', None)
        academico_data = validated_data.pop('formacion_academica', None)
        antecedentes_data = validated_data.pop('antecedentes', [])
        try:
            usuario_obj = User.objects.get(pk=id_usuario)
        except User.DoesNotExist:
            raise serializers.ValidationError({"usuario_id": "El usuario no existe"})

        instance = Employee.objects.create(**validated_data)
        instance._history_user = usuario_obj
        instance.save()

        if vivienda_data:
            datos_vivienda.objects.create(empleado_id=instance, **vivienda_data)
        
        if salud_data:
            patologias = salud_data.pop('patologiaCronica', [])
            discapacidades = salud_data.pop('discapacidad', [])
            
            s_obj = perfil_salud.objects.create(empleado_id=instance, **salud_data)
            
            if patologias:
                s_obj.patologiaCronica.set(patologias)
            
            if discapacidades:
                s_obj.discapacidad.set(discapacidades)
                
         

        if fisico_data:
            perfil_fisico.objects.create(empleado_id=instance, **fisico_data)

        if academico_data:
            formacion_academica.objects.create(empleado_id=instance, **academico_data)
        
        for ant in antecedentes_data:
            antecedentes_servicio.objects.create(empleado_id=instance, **ant)
        return instance

    def update(self, instance, validated_data):
        id_usuario = validated_data.pop('usuario_id', None)

        vivienda_data = validated_data.pop('datos_vivienda', None)
        salud_data = validated_data.pop('perfil_salud', None)
        fisico_data = validated_data.pop('perfil_fisico', None)
        academico_data = validated_data.pop('formacion_academica', None)
        antecedentes_data = validated_data.pop('antecedentes', None)

        if id_usuario:
            try:
                instance._history_user = User.objects.get(pk=id_usuario)
            except User.DoesNotExist:
                raise serializers.ValidationError({"usuario_id": "El usuario no existe"})

        # Actualizar datos de vivienda si existen
        if vivienda_data:
            datos_vivienda.objects.update_or_create(empleado_id=instance, defaults=vivienda_data)
       
            
        if salud_data:
            
            patologias = salud_data.pop('patologiaCronica', None)
            discapacidades = salud_data.pop('discapacidad', None)

           
            s_obj, created = perfil_salud.objects.update_or_create(
                empleado_id=instance, 
                defaults=salud_data
            )

           
            if patologias is not None:
                s_obj.patologiaCronica.set(patologias)
            if discapacidades is not None:
                s_obj.discapacidad.set(discapacidades)
        
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
            "estado": EstadoSerializer(vivienda.estado_id).data,
            "municipio": MunicipioSerializer(vivienda.municipio_id).data,
            "parroquia": ParroquiaSerializer(vivienda.parroquia).data,
            "direccionExacta": vivienda.direccion_exacta,
            "condicion": vivienda.condicion_vivienda_id.condicion if vivienda.condicion_vivienda_id else ""
        }

    def get_perfil_salud(self, obj):
        salud = obj.perfil_salud_set.first()
        if not salud: return None
        return {
            "grupoSanguineo": GrupoSanguineoSerializer(salud.grupoSanguineo).data,
            "discapacidad": DiscapacidadSerializer(salud.discapacidad, many=True).data,
            "patologiasCronicas": PatologiasSerializer(salud.patologiaCronica, many=True).data
        }

    def get_perfil_fisico(self, obj):
        fisico = obj.perfil_fisico_set.first()
        if not fisico: return None
        return {
            "tallaCamisa": TallaCamisaSerializer(fisico.tallaCamisa).data,
            "tallaPantalon": Talla_PantalonSerializer(fisico.tallaPantalon).data,
            "tallaZapatos": Talla_ZapatosSerializer(fisico.tallaZapatos).data
        }

    def get_formacion_academica(self, obj):
        formacion = obj.formacion_academica_set.first()
        if not formacion: return None
        return {
            "nivelAcademico": NivelAcademicoSerializer(formacion.nivel_Academico_id).data,
            "institucion": formacion.institucion,
            "capacitacion": formacion.capacitacion,
            "carrera": CarrerasSerializer(formacion.carrera_id).data ,
            "mension": MencionSerializer(formacion.mencion_id).data
            
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        asignaciones_data = representation.get('asignaciones')
        if asignaciones_data is not None and len(asignaciones_data) == 0:
            pass
           
        for key, value in representation.items():
            if value is None:
                representation[key] = ''
        
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
            "estado": EstadoSerializer(vivienda.estado_id).data if vivienda.estado_id else "",
            "municipio": MunicipioSerializer(vivienda.municipio_id).data if vivienda.municipio_id else "",
            "parroquia": ParroquiaSerializer(vivienda.parroquia).data if vivienda.parroquia else "",
            "direccionExacta": vivienda.direccion_exacta,
            "condicion": vivienda.condicion_vivienda_id.condicion if vivienda.condicion_vivienda_id else ""
        }

    def get_perfil_salud(self, obj):
        salud = obj.perfil_salud_set.first()
        if not salud: return None
        return {
            "grupoSanguineo": GrupoSanguineoSerializer(salud.grupoSanguineo).data if salud.grupoSanguineo else "",
            "discapacidad": DiscapacidadSerializer(salud.discapacidad,many=True).data,
            "patologiasCronicas": PatologiasSerializer(salud.patologiaCronica, many=True).data
        }

    def get_perfil_fisico(self, obj):
        fisico = obj.perfil_fisico_set.first()
        if not fisico: return None
        return {
            "tallaCamisa": TallaCamisaSerializer(fisico.tallaCamisa).data if fisico.tallaCamisa else "",
            "tallaPantalon": Talla_PantalonSerializer(fisico.tallaPantalon).data if fisico.tallaPantalon else "",
            "tallaZapatos": Talla_ZapatosSerializer(fisico.tallaZapatos).data if fisico.tallaZapatos else ""
        }

    def get_formacion_academica(self, obj):
        formacion = obj.formacion_academica_set.first()
        if not formacion: return None
        return {
            "nivelAcademico": NivelAcademicoSerializer(formacion.nivel_Academico_id).data if formacion.nivel_Academico_id else "",
            "institucion": formacion.institucion,
            "capacitacion": formacion.capacitacion,
            "carrera": CarrerasSerializer(formacion.carrera_id).data if formacion.carrera_id else "",
            "mencion": MencionSerializer(formacion.mencion_id).data if formacion.mencion_id else ""
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        for key, value in representation.items():
            if value is None:
                representation[key] = ''
        return representation
# # -------------------------------
# serializer para asignar codigo 
# -------------------------------
class AsigCargoSerializer(serializers.ModelSerializer):
    usuario_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = AsigTrabajo
        fields = [
            'employee',
            'usuario_id'
        ]
    
    def update(self, instance, validated_data):
        #  obtiene el id del usuario para asignarlo en el historial 
        id_usuario = validated_data.pop('usuario_id')
        
        try:
            usuario_obj = User.objects.get(pk=id_usuario)
        except User.DoesNotExist:
            raise serializers.ValidationError({ "El usuario no existe"})
        
        #  Obteniene el estatus ACTIVO
        try:
            estatus_activo = Estatus.objects.get(estatus__iexact=ESTATUS_ACTIVO)
        except Estatus.DoesNotExist:
            raise serializers.ValidationError({
                "error": "El estatus ACTIVO no está configurado en el sistema."
            })

        #  actualiza las instancias 
        instance.employee = validated_data.get('employee', instance.employee)
        instance.estatusid = estatus_activo
        
        # inserta el usuario en el historial
        instance._history_user = usuario_obj
        
        try:
            instance.save()
            
            # Registrar el movimiento en el historial de personal 
            registrar_historial_movimiento(
                empleado=instance.employee,
                puesto=instance,
                tipo_movimiento='INGRESO',
                motivo="ASIGNACION DE CARGO",
                usuario=usuario_obj
            )
             
            return instance

        except Exception as e:
            raise serializers.ValidationError({
                "error": f"No se pudo actualizar el registro: {str(e)}"
            })
# -------------------------------
# serializer para asignar codigo autogenerable
# -------------------------------   
class RegisterCargoEspecialSerializer(serializers.ModelSerializer):
    usuario_id = serializers.IntegerField(write_only=True)
    class Meta: 
        model = AsigTrabajo
        exclude = ['Tipo_personal','estatusid', 'codigo','observaciones']
        
    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else data.copy()
        
        fk_fields = ['OrganismoAdscritoid', 'gradoid', 'Coordinacion', 'DireccionLinea']

        for field in fk_fields:
            if data.get(field) == 0 or data.get(field) == "0":
                data[field] = None
            
        return super().to_internal_value(data)
    
        # validacion para el tipo de nomina 
    def validate_tiponominaid(self,value):
        if not value.requiere_codig:
            raise serializers.ValidationError(
                'El registro de este tipo de nomina no es permitido'
            )
        return value
    
    # logica de creacion 
    
    def create(self,validated_data):
        
        id_del_usuario = validated_data.pop('usuario_id')
        
        try:
            usuario_obj = User.objects.get(pk=id_del_usuario)
        except User.DoesNotExist:
            raise serializers.ValidationError({"El usuario especificado no existe"})
        try:
          estatus_obj = Estatus.objects.get(estatus__iexact=ESTATUS_ACTIVO)
          validated_data['estatusid'] = estatus_obj
        except Estatus.DoesNotExist:
          raise serializers.ValidationError({
             "El estatus para la asginacion de este codigo no existe."
        })
        
        try:
          personal_obj = Tipo_personal.objects.get(tipo_personal__iexact=PERSONAL_ACTIVO)
          validated_data['Tipo_personal'] = personal_obj
        except Tipo_personal.DoesNotExist:
          raise serializers.ValidationError({
             "El tipo de personal para la asignacion de este codigo no existe"
        })
        # logica para el prefijo y la creacion de codigo 
        tipo_nomina = validated_data.get('tiponominaid')
  
        if not tipo_nomina or not tipo_nomina.nomina:
          raise serializers.ValidationError( "El tipo de nómina no tiene una descripción válida.")
      
        nombre_nomina = tipo_nomina.nomina.upper()
        palabras_ignorar = ['DE', 'LA', 'EL', 'Y', 'LOS', 'LAS', 'EN', 'PARA']
        palabras = [word for word in nombre_nomina.split() if word not in palabras_ignorar]
        if not palabras:
         raise serializers.ValidationError({ "No se pudo generar un prefijo desde el nombre de la nómina"})
        
         # Unimos las iniciales y agregamos el guion bajo
        prefix = "".join([word[0] for word in palabras]) + "_"
        validated_data['codigo'] = generador_codigos(prefix)
        
        
        
        try:
            
            instance = AsigTrabajo(**validated_data)
            instance._history_user = usuario_obj
            instance.save()

            # 3. REGISTRO EN EL HISTORIAL
            registrar_historial_movimiento(
                empleado=instance.employee, 
                puesto=instance,
                tipo_movimiento='INGRESO',
                motivo=f"REGISTRO INICIAL: {tipo_nomina.nomina}",
                usuario=usuario_obj
             )

            return instance
        except Exception as e:

         raise serializers.ValidationError({
            "error": f"No se pudo crear el registro: {str(e)}"
        })
         
         
         


