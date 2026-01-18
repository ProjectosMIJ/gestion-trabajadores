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
    orden_hijo = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    perfil_salud = PerfilSaludSerializer(required=False)
    perfil_fisico = PerfilFisicoSerializer(required=False)
    formacion_academica = FormacionAcademicaSerializer(required=False)

    class Meta:
        model = Employeefamily
        fields = [
            'employeecedula', 'cedulaFamiliar', 'primer_nombre', 'segundo_nombre',
            'primer_apellido', 'segundo_apellido', 'parentesco', 'fechanacimiento',
            'sexo', 'estadoCivil', 'observaciones', 'usuario_id', 'mismo_ente',
            'heredero', 'perfil_salud', 'perfil_fisico', 'formacion_academica',
            'orden_hijo'
        ]

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else data
        
        
        for campo in ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido']:
            if data.get(campo):
                data[campo] = str(data[campo]).strip().upper()

        def limp_ceros(dictionary):
            if not isinstance(dictionary, dict): return dictionary
            for key, value in dictionary.items():
                if isinstance(value, bool): continue
                if isinstance(value, list):
                    dictionary[key] = [item for item in value if item != 0]
                elif value == 0:
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
        cedula_fam = data.get('cedulaFamiliar')
        parentesco_obj = data.get('parentesco')
        fecha_nac = data.get('fechanacimiento')
        empleado = data.get('employeecedula')
        orden_manual = data.get('orden_hijo')

        if not cedula_fam or str(cedula_fam).strip().lower() in ["", "string", "null"]:
            if parentesco_obj and fecha_nac and empleado:
                nombre_p = str(parentesco_obj.descripcion_parentesco).upper().strip()
                if nombre_p == "HIJO (A)":
                    today = date.today()
                    edad = today.year - fecha_nac.year - (
                        (today.month, today.day) < (fecha_nac.month, fecha_nac.day)
                    )
                    if edad < 9:
                        cedula_trabajador = str(empleado.cedulaidentidad)
                        
                        if orden_manual is not None:
                            numero_final = orden_manual
                        else:
                            hijos_con_escolar = Employeefamily.objects.filter(
                                employeecedula=empleado,
                                cedulaFamiliar__startswith=f"{cedula_trabajador}-"
                            ).count()
                            numero_final = hijos_con_escolar + 1
                        
                        nueva_cedula = f"{cedula_trabajador}-{numero_final}"

                        check_exists = Employeefamily.objects.filter(
                            employeecedula=empleado,
                            cedulaFamiliar=nueva_cedula
                        )
                        if self.instance:
                            check_exists = check_exists.exclude(pk=self.instance.pk)
                        
                        if check_exists.exists():
                            raise serializers.ValidationError({
                                "El trabajador ya tiene un hijo registrado con el orden ingresado"
                            })
                        
                        data['cedulaFamiliar'] = nueva_cedula

        heredero = data.get('heredero', False)
        if heredero and empleado:
            queryset = Employeefamily.objects.filter(employeecedula=empleado, heredero=True)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError({ "Este trabajador ya posee un familiar registrado como heredero"})
        
        return data

    def create(self, validated_data):
        validated_data.pop('orden_hijo', None)
        id_usuario = validated_data.pop('usuario_id')
        salud_data = validated_data.pop('perfil_salud', None)
        fisico_data = validated_data.pop('perfil_fisico', None)
        academico_data = validated_data.pop('formacion_academica', None)
        
        try:
            usuario_obj = User.objects.get(pk=id_usuario)
        except User.DoesNotExist:
            raise serializers.ValidationError({ "El usuario no existe"})
            
        try:
            instance = Employeefamily.objects.create(**validated_data)
            instance._history_user = usuario_obj 
            instance.save()
            if salud_data:
                patologias = salud_data.pop('patologiaCronica', [])
                discapacidades = salud_data.pop('discapacidad', [])
                s_obj = perfil_salud.objects.create(familiar_id=instance, **salud_data)
                if patologias: s_obj.patologiaCronica.set(patologias)
                if discapacidades: s_obj.discapacidad.set(discapacidades)
            if fisico_data:
                perfil_fisico.objects.create(familiar_id=instance, **fisico_data)
            if academico_data:
                formacion_academica.objects.create(familiar_id=instance, **academico_data)
            return instance
        except Exception as e:
            raise serializers.ValidationError(f"Error al guardar: {str(e)}")

    def update(self, instance, validated_data):
        validated_data.pop('orden_hijo', None)
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
            discapacidades = salud_data.pop('discapacidad', None)
            s_obj, _ = perfil_salud.objects.update_or_create(familiar_id=instance, defaults=salud_data)
            if patologias is not None: s_obj.patologiaCronica.set(patologias)
            if discapacidades is not None: s_obj.discapacidad.set(discapacidades)
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
            "discapacidad": DiscapacidadSerializer(salud.discapacidad, many=True).data if salud.discapacidad else [],
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