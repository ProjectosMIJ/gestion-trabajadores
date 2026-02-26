
from rest_framework import serializers

from ..models.personal_models import *
from RAC.serializers.personal_activo_serializers import *








class ListerCodigosPassiveSerializer(serializers.ModelSerializer):

    denominacioncargo = denominacionCargoSerializer(
        source='denominacioncargoid', read_only=True
    )
    denominacioncargoespecifico = denominacionCargoEspecificoSerializer(
        source='denominacioncargoespecificoid', read_only=True
    )
    tiponomina =TipoNominaSerializer(source='tiponominaid', read_only=True)
    OrganismoAdscrito = OrganismoAdscritoSerializer(
        source='OrganismoAdscritoid', read_only=True
    )
    
    DireccionGeneral = DireccionGeneralSerializer(read_only=True)
    
    estatusid = EstatusSerializer(read_only=True)

    class Meta:
        model = AsigTrabajo
        fields = [
            'id',
            'codigo',
            'denominacioncargo',
            'denominacioncargoespecifico',
            'tiponomina',
            'OrganismoAdscrito',
            'DireccionGeneral',
            'estatusid',
            'observaciones',
            'fecha_actualizacion',
        ]
   



class EmployeePasiveDetailSerializer(serializers.ModelSerializer):

    sexo = SexoSerializer(source='sexoid', read_only=True)
    estadoCivil = EstadoCivilSerializer(read_only=True)
    datos_vivienda = serializers.SerializerMethodField()
    perfil_salud = serializers.SerializerMethodField()
    contacto_emergencia = serializers.SerializerMethodField()
    perfil_fisico = serializers.SerializerMethodField()
    formacion_academica = serializers.SerializerMethodField()
    anos_apn = serializers.IntegerField(source='total_anos_apn', read_only=True)
    antecedentes = AntecedentesServicioSerializer(
        source='antecedentes_servicio_set', many=True,read_only=True)

    asignaciones = ListerCodigosPassiveSerializer(source='assignments',many=True,read_only=True)

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
            'correo',
            'telefono_habitacion',
            'telefono_movil',
            'datos_vivienda', 
            'perfil_salud',
            'contacto_emergencia',
            'perfil_fisico', 
            'formacion_academica',
            'antecedentes',
            'anos_apn', 
            'fecha_actualizacion', 
            'asignaciones'
        ]
    
    def get_datos_vivienda(self, obj):
        vivienda = obj.datos_vivienda_set.first()
        return DatosViviendaSerializer(vivienda).data if vivienda else None

    def get_perfil_salud(self, obj):
        salud = obj.perfil_salud_set.first()
        return PerfilSaludSerializer(salud).data if salud else None
    
    def get_contacto_emergencia(self, obj):
        emergencia = obj.contacto_emergencia_set.first()
        return ContactoEmergenciaSerializer(emergencia).data if emergencia else None

    def get_perfil_fisico(self, obj):
        fisico = obj.perfil_fisico_set.first()
        return PerfilFisicoSerializer(fisico).data if fisico else None
    

    def get_formacion_academica(self, obj):
        academica = obj.formacion_academica_set.first()
        return FormacionAcademicaSerializer(academica).data if academica else None
    
    
    
    # ..........................................................
    
   