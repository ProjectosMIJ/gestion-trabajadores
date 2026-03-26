
from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from ..models.personal_models import *
from RAC.serializers.personal_activo_serializers import *


class CodigosCreateUpdatePassiveSerializer(CleanZerosMixin, serializers.ModelSerializer):
    usuario_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)     
    
    class Meta:
        model = AsigTrabajo   
        fields = [
            'usuario_id',
            'codigo',
            'denominacioncargoid',
            'denominacioncargoespecificoid',
            'OrganismoAdscritoid',
            'tiponominaid',
            
        ]
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance:
            self.fields['codigo'].read_only = True

             
    def validate_tiponominaid(self, value):
        if not self.instance or self.instance.tiponominaid != value:
            if value.es_activo:
               raise serializers.ValidationError('Tipo de nómina no permitido')
        return value 
    
    def validate(self, attrs):
        try:
            if not getattr(self, 'instance', None):
               attrs['estatusid'] = Estatus.objects.get(estatus__iexact=ESTATUS_VACANTE)
            attrs['Tipo_personal'] = Tipo_personal.objects.get(tipo_personal__iexact=PERSONAL_PASIVO)
            attrs['Dependencia'] = Dependencias.objects.get(dependencia__iexact="MINISTERIO")
            attrs['DireccionGeneral'] =  DireccionGeneral.objects.get(direccion_general__iexact="OFICINA DE GESTION HUMANA")
        except (Estatus.DoesNotExist, Tipo_personal.DoesNotExist,Dependencias.DoesNotExist,DireccionGeneral.DoesNotExist) as e:
            raise serializers.ValidationError(f"Error de datos: {str(e)}")     
        
        codigo = attrs.get('codigo', getattr(self.instance, 'codigo', None))
        tiponominaid = attrs.get('tiponominaid', getattr(self.instance, 'tiponominaid', None))

        if codigo and tiponominaid:
            queryset = AsigTrabajo.objects.filter(codigo=codigo, tiponominaid=tiponominaid)
            
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError(
                     f"Ya existe el código {codigo} para este tipo de nómina"
                )
        return attrs


    @transaction.atomic
    def create(self, validated_data):
        usuario = validated_data.pop('usuario_id')
        instance = AsigTrabajo.objects.create(**validated_data)
      
        instance._history_user = usuario
        instance.save()
            
        return instance
    
    @transaction.atomic
    def update(self, instance, validated_data):
        usuario = validated_data.pop('usuario_id')
        instance._history_user = usuario
        return super().update(instance, validated_data)
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
    
   
# GESTION DE HEREDERO 

class SobrevivienteItemSerializer(serializers.Serializer):
    cedula_familiar = serializers.CharField(
        help_text="Cédula del familiar que recibirá la pensión",
        required=True
    )
    codigo_nuevo = serializers.CharField(
        help_text="Código para el nuevo puesto del pensionado sobreviviente",
        required=True,
        max_length=50
    )

class MigracionSobrevivienteSerializer(serializers.Serializer):
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        write_only=True,
        required=True
    )
    sobrevivientes = SobrevivienteItemSerializer(many=True, allow_empty=False)

    def validate(self, data):
        try:
            nomina_pension = Tiponomina.objects.get(nomina__iexact="PENSIONADO SOBREVIVIENTE")
        except ObjectDoesNotExist:
            raise serializers.ValidationError("El tipo de nómina 'PENSIONADO SOBREVIVIENTE' no está configurado.")

        sobrevivientes_data = data.get('sobrevivientes', [])
        codigos_ingresados = []
        familiares_validados = []

        for item in sobrevivientes_data:
            ced_fam = item['cedula_familiar']
            cod_nuevo = item['codigo_nuevo']

            familiar = Employeefamily.objects.filter(cedulaFamiliar=ced_fam).first()

            if not familiar:
                raise serializers.ValidationError(f"No se encontró ningún familiar registrado con la cédula {ced_fam}.")

            empleado_origen = familiar.employeecedula

            if Employee.objects.filter(cedulaidentidad=ced_fam).exists():
                raise serializers.ValidationError(f"El familiar {ced_fam} ya está registrado en el sistema como personal.")

            if cod_nuevo in codigos_ingresados:
                raise serializers.ValidationError(f"El código {cod_nuevo} está duplicado en la petición.")
            codigos_ingresados.append(cod_nuevo)
            if AsigTrabajo.objects.filter(codigo=cod_nuevo, tiponominaid=nomina_pension).exists():
                raise serializers.ValidationError(f"Ya existe el código {cod_nuevo} para la nómina de pensión sobreviviente.")

            familiares_validados.append({
                'familiar_obj': familiar,
                'empleado_origen': empleado_origen, 
                'codigo_nuevo': cod_nuevo
            })

        data['nomina_pension'] = nomina_pension
        data['familiares_validados'] = familiares_validados
        
        return data

    @transaction.atomic
    def save(self):
        nomina_pension = self.validated_data['nomina_pension']
        usuario = self.validated_data['usuario_id']
        familiares_validados = self.validated_data['familiares_validados']

        try:
            estatus_activo = Estatus.objects.get(estatus__iexact="ACTIVO")
            tipo_pasivo = Tipo_personal.objects.get(tipo_personal__iexact="PASIVO")
            dependencia = Dependencias.objects.get(dependencia__iexact="MINISTERIO")
            dg_humana = DireccionGeneral.objects.get(direccion_general__iexact="OFICINA DE GESTION HUMANA")
            denominacion_pasivo = Denominacioncargo.objects.get(cargo__iexact="PERSONAL PASIVO")
            especifico_pasivo = Denominacioncargoespecifico.objects.get(cargo__iexact="PERSONAL PASIVO")
            motivo_ingreso = Tipo_movimiento.objects.get(movimiento__iexact="PENSION POR SOBREVIVIENTE")
        except ObjectDoesNotExist as e:
            raise serializers.ValidationError(f"Error de configuración del sistema: {str(e)}")

        empleados_creados = []

        for item in familiares_validados:
            familiar = item['familiar_obj']
            empleado_origen = item['empleado_origen']
            codigo_nuevo = item['codigo_nuevo']

            nuevo_empleado = Employee.objects.create(
                cedulaidentidad=familiar.cedulaFamiliar,
                nombres=f"{familiar.primer_nombre or ''} {familiar.segundo_nombre or ''}".strip(),
                apellidos=f"{familiar.primer_apellido or ''} {familiar.segundo_apellido or ''}".strip(),
                fecha_nacimiento=familiar.fechanacimiento,
                sexoid=familiar.sexo,
                estadoCivil=familiar.estadoCivil,
                fechaingresoorganismo=timezone.now().date(),
            )
            nuevo_empleado._history_user = usuario
            nuevo_empleado.save()

            salud_fam = perfil_salud.objects.filter(familiar_id=familiar).first()
            if salud_fam and (salud_fam.grupoSanguineo or salud_fam.patologiaCronica.exists() or salud_fam.discapacidad.exists() or salud_fam.alergias.exists()):
                nuevo_salud = perfil_salud.objects.create(
                    empleado_id=nuevo_empleado,
                    grupoSanguineo=salud_fam.grupoSanguineo  
                )
                nuevo_salud.patologiaCronica.set(salud_fam.patologiaCronica.all())
                nuevo_salud.discapacidad.set(salud_fam.discapacidad.all())
                nuevo_salud.alergias.set(salud_fam.alergias.all())

            fisico_fam = perfil_fisico.objects.filter(familiar_id=familiar).first()
            if fisico_fam and any([fisico_fam.tallaCamisa, fisico_fam.tallaPantalon, fisico_fam.tallaZapatos]):
                perfil_fisico.objects.create(
                    empleado_id=nuevo_empleado,
                    tallaCamisa=fisico_fam.tallaCamisa,
                    tallaPantalon=fisico_fam.tallaPantalon,
                    tallaZapatos=fisico_fam.tallaZapatos
                )

            academico_fam = formacion_academica.objects.filter(familiar_id=familiar).first()
            if academico_fam and any([academico_fam.nivel_Academico_id, academico_fam.carrera_id, academico_fam.mencion_id, academico_fam.institucion, academico_fam.capacitacion]):
               formacion_academica.objects.create(
                    empleado_id=nuevo_empleado,
                    nivel_Academico_id=academico_fam.nivel_Academico_id,
                    carrera_id=academico_fam.carrera_id,
                    mencion_id=academico_fam.mencion_id,
                    institucion=academico_fam.institucion,
                    capacitacion=academico_fam.capacitacion
                )

            nueva_asig = AsigTrabajo.objects.create(
                employee=nuevo_empleado,
                codigo=codigo_nuevo,
                denominacioncargoid=denominacion_pasivo,
                denominacioncargoespecificoid=especifico_pasivo,
                tiponominaid=nomina_pension,
                estatusid=estatus_activo,
                Tipo_personal=tipo_pasivo,
                Dependencia=dependencia,
                DireccionGeneral=dg_humana,
                observaciones=f"Pensión de sobreviviente derivada del trabajador C.I. {empleado_origen.cedulaidentidad}"
            )
            nueva_asig._history_user = usuario
            nueva_asig.save()

            registrar_historial_movimiento(
                empleado=nuevo_empleado,
                puesto=nueva_asig,
                tipo_movimiento='INGRESO',
                motivo=motivo_ingreso,
                usuario=usuario
            )

        return empleados_creados