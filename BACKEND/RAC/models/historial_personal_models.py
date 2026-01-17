from django.db import models
from .personal_models import *
from USER.models.user_models import cuenta

class EmployeeMovementHistory(models.Model):
   
    TIPO_MOVIMIENTO_CHOICES = [
        ('INGRESO', 'Ingreso inicial'),
        ('TRASLADO', 'Traslado administrativo'),
        ('EGRESO', 'Egreso/Desincorporación'),
        ('CAMBIO DE ESTATUS', ' (ver observaciones)'),
    ]

    empleado = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='movimientos'
    )
    
    codigo_puesto = models.CharField(max_length=100)
    denominacioncargo = models.ForeignKey(Denominacioncargo, on_delete=models.PROTECT)
    denominacioncargoespecifico = models.ForeignKey(Denominacioncargoespecifico, on_delete=models.PROTECT)
    gradoid = models.ForeignKey(Grado, on_delete=models.PROTECT, null=True)
    tiponomina = models.ForeignKey(Tiponomina, on_delete=models.PROTECT)
    estatus = models.ForeignKey(Estatus, on_delete=models.PROTECT)
    tipo_personal = models.ForeignKey(Tipo_personal, on_delete=models.PROTECT)
    
    DireccionGeneralid = models.ForeignKey(DireccionGeneral, on_delete=models.PROTECT, null=True)
    DireccionLineaid = models.ForeignKey(DireccionLinea, on_delete=models.PROTECT, null=True)
    Coordinacionid = models.ForeignKey(Coordinaciones, on_delete=models.PROTECT, null=True)

    # Datos del Movimiento
    tipo_movimiento = models.CharField(max_length=20, choices=TIPO_MOVIMIENTO_CHOICES)
    motivo = models.TextField(blank=True, null=True)
    fecha_movimiento = models.DateTimeField(auto_now_add=True)
    ejecutado_por = models.ForeignKey(cuenta, on_delete=models.PROTECT)

    class Meta:
        db_table = 'EmployeeMovementHistory'
        ordering = ['-fecha_movimiento']
        app_label = 'RAC'
        
    
class EmployeeEgresado(models.Model):

    employee = models.ForeignKey(Employee, on_delete=models.PROTECT, to_field='cedulaidentidad',related_name='historial_egreso', db_column='employeeCedula',null=True, blank=True)

    nombres = models.TextField(max_length=255)
    apellidos = models.TextField(max_length=255)
    codigo = models.TextField(blank=True, null=True) 
    
    fechaingresoorganismo = models.DateField(db_column='fechaIngresoOrganismo')
   
    fecha_egreso = models.DateTimeField(auto_now_add=True)

    denominacioncargoid = models.ForeignKey(Denominacioncargo, models.DO_NOTHING, db_column='denominacionCargoId')
    denominacioncargoespecificoid = models.ForeignKey(Denominacioncargoespecifico, models.DO_NOTHING, db_column='denominacionCargoEspecificoId')
    gradoid = models.ForeignKey(Grado, models.DO_NOTHING, db_column='gradoId', blank=True, null=True)
    tiponominaid = models.ForeignKey(Tiponomina, models.DO_NOTHING, db_column='tipoNominaId')

    DireccionGeneral = models.ForeignKey(DireccionGeneral, models.DO_NOTHING, db_column='direccionGeneralId', null=True)
    DireccionLinea = models.ForeignKey(DireccionLinea, models.DO_NOTHING, db_column='direccionLineaId', null=True)
    Coordinacion = models.ForeignKey(Coordinaciones, models.DO_NOTHING, db_column='coordinacionId', null=True)
    OrganismoAdscritoid = models.ForeignKey(OrganismoAdscrito, models.DO_NOTHING, db_column='organismoAdscritoId', null=True)

    motivo_egreso = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'EmployeeEgresado'
        ordering = ['-fecha_egreso']
        app_label = 'RAC'