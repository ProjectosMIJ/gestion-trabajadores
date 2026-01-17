from rest_framework import serializers
from ..models.family_personal_models import Employeefamily, Parentesco
from ..models.personal_models import *
from USER.models.user_models import cuenta as User
from datetime import date
from ..serializers.personal_serializers import (
 
    CarrerasSerializer,
    MencionSerializer,
    GrupoSanguineoSerializer,
    DiscapacidadSerializer,
    PatologiasSerializer,
    TallaCamisaSerializer,
    Talla_PantalonSerializer,
    Talla_ZapatosSerializer,
    PerfilSaludSerializer,
    PerfilFisicoSerializer,
    NivelAcademicoSerializer,
    FormacionAcademicaSerializer,
    EstadoCivilSerializer,
    SexoSerializer

)

class FamilyCreateSerializer(serializers.ModelSerializer):
    cedulaFamiliar = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    usuario_id = serializers.IntegerField(write_only=True)
    
    perfil_salud = PerfilSaludSerializer(required=False)
    perfil_fisico = PerfilFisicoSerializer(required=False)
    formacion_academica = FormacionAcademicaSerializer(required=False)

    class Meta:
        model = Employeefamily
        fields = [
            'employeecedula', 'cedulaFamiliar', 'primer_nombre', 'segundo_nombre',
            'primer_apellido', 'segundo_apellido', 'parentesco', 'fechanacimiento',
            'sexo', 'estadoCivil', 'observaciones', 'usuario_id', 'mismo_ente',
            'heredero', 'perfil_salud', 'perfil_fisico', 'formacion_academica'
        ]

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else data
        
        def limp_ceros(dictionary):
            if not isinstance(dictionary, dict): 
                return dictionary
            for key, value in dictionary.items():
                if not isinstance(value, bool):
                    if value == 0 or value == "0":
                        dictionary[key] = None
            return dictionary

        data = limp_ceros(data)
        for obj_key in ['perfil_salud', 'perfil_fisico', 'formacion_academica']:
            if obj_key in data and isinstance(data[obj_key], dict):
                data[obj_key] = limp_ceros(data[obj_key])

        value = data.get('fechanacimiento')
        if value and isinstance(value, str) and 'T' in value:
            data['fechanacimiento'] = value.split('T')[0]
            
        return super().to_internal_value(data)

    def validate(self, data):
        heredero = data.get('heredero', False)
        empleado = data.get('employeecedula')

        if heredero and empleado:
            queryset = Employeefamily.objects.filter(
                employeecedula=empleado,
                heredero=True
            )

            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)

            if queryset.exists():
                raise serializers.ValidationError({
                    "heredero": "Este trabajador ya posee un familiar registrado como heredero"
                })

        return data

    def create(self, validated_data):
        id_usuario = validated_data.pop('usuario_id')
        salud_data = validated_data.pop('perfil_salud', None)
        fisico_data = validated_data.pop('perfil_fisico', None)
        academico_data = validated_data.pop('formacion_academica', None)
        
        try:
            usuario_obj = User.objects.get(pk=id_usuario)
        except User.DoesNotExist:
            raise serializers.ValidationError({"usuario_id": "El usuario no existe"})

        try:
            instance = Employeefamily.objects.create(**validated_data)
            instance._history_user = usuario_obj 
            instance.save()

            if salud_data:
                patologias = salud_data.pop('patologiaCronica', [])
                s_obj = perfil_salud.objects.create(familiar_id=instance, **salud_data)
                if patologias: s_obj.patologiaCronica.set(patologias)

            if fisico_data:
                perfil_fisico.objects.create(familiar_id=instance, **fisico_data)
                
            if academico_data:
                formacion_academica.objects.create(familiar_id=instance, **academico_data)

            return instance
        except Exception as e:
            raise serializers.ValidationError(f"Error al guardar: {str(e)}")

    def update(self, instance, validated_data):
        id_usuario = validated_data.pop('usuario_id', None)
        salud_data = validated_data.pop('perfil_salud', None)
        fisico_data = validated_data.pop('perfil_fisico', None)
        academico_data = validated_data.pop('formacion_academica', None)

        if id_usuario:
            try:
                usuario_obj = User.objects.get(pk=id_usuario)
                instance._history_user = usuario_obj
            except User.DoesNotExist:
                pass

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if salud_data:
            patologias = salud_data.pop('patologiaCronica', None)
            s_obj, _ = perfil_salud.objects.update_or_create(familiar_id=instance, defaults=salud_data)
            if patologias is not None: s_obj.patologiaCronica.set(patologias)

        if fisico_data:
            perfil_fisico.objects.update_or_create(familiar_id=instance, defaults=fisico_data)

        if academico_data:
            formacion_academica.objects.update_or_create(familiar_id=instance, defaults=academico_data)

        return instance
class ParentescoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parentesco
        fields = ('id', 'descripcion_parentesco')



class FamilyListSerializer(serializers.ModelSerializer):
    parentesco = ParentescoSerializer(read_only=True)
    sexo = SexoSerializer(read_only=True)
    estadoCivil = EstadoCivilSerializer(read_only=True)
    
    perfil_salud = serializers.SerializerMethodField()
    perfil_fisico = serializers.SerializerMethodField()
    formacion_info = serializers.SerializerMethodField()

    class Meta:
        model = Employeefamily
        fields = [
            'id', 
            'cedulaFamiliar', 
            'primer_nombre', 
            'segundo_nombre', 
            'primer_apellido', 
            'segundo_apellido',
            'parentesco', 
            'fechanacimiento', 
            'sexo', 
            'estadoCivil', 
            'mismo_ente', 
            'heredero', 
            'perfil_salud', 
            'perfil_fisico', 
            'formacion_info',
            'observaciones', 
            'createdat', 
            'updatedat'
        ]

    def get_perfil_salud(self, obj):
        salud = obj.perfil_salud_set.first()
        if not salud: return None
        return {
            "grupoSanguineo": GrupoSanguineoSerializer(salud.grupoSanguineo).data if salud.grupoSanguineo else "",
            "discapacidad": DiscapacidadSerializer(salud.discapacidad).data if salud.discapacidad else "",
            "patologiaCronica": PatologiasSerializer(salud.patologiaCronica, many=True).data if salud.patologiaCronica else []
        }

    def get_perfil_fisico(self, obj):
        fisico = obj.perfil_fisico_set.first()
        if not fisico: return None
        return {
            "tallaCamisa": TallaCamisaSerializer(fisico.tallaCamisa).data if fisico.tallaCamisa else "",
            "tallaPantalon": Talla_PantalonSerializer(fisico.tallaPantalon).data if fisico.tallaPantalon else "",
            "tallaZapatos": Talla_ZapatosSerializer(fisico.tallaZapatos).data if fisico.tallaZapatos else ""
        }

    def get_formacion_info(self, obj):
        formacion = obj.formacion_academica_set.first()
        if not formacion: return None
        return {
            "nivelAcademico": NivelAcademicoSerializer(formacion.nivel_Academico_id).data if formacion.nivel_Academico_id else "",
            "institucion": formacion.institucion or "",
            "capacitacion": formacion.capacitacion or "",
            "carrera": CarrerasSerializer(formacion.carrera_id).data if formacion.carrera_id else "",
            "mencion": MencionSerializer(formacion.mencion_id).data if formacion.mencion_id else ""
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        for key, value in representation.items():
            if value is None:
                representation[key] = ''
        return representation