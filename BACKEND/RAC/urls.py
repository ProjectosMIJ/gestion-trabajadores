
from django.urls import path
from . import views

app_name = 'Registro de asignacion de cargos'
urlpatterns = [
    # --------------------
    #  DATOS PERSONALES 
    # --------------------
    
    
    # crear empleado (datos personales)
    path('employees_register/',views.create_employee, name='employee-register'),
    # actulizacion de datos personales
    path('Employee/<int:id>/', views.update_employee, name='actualizar-empleado'),
    # solo sus datos personales 
    path('listar-data-empleados/<str:cedulaidentidad>/', views.retrieve_employee, name='listar-data-empleados'),
    
    
    
    # --------------------
    # DATOS DE SALUD 
    # --------------------
    
     # grupo sanguineo
    path('listar-grupoSanguineos/', views.list_blood_types, name='listar-grupoSanguineo'),
    path('categorias-patologias/', views.list_pathology_categories, name='listar-categorias-patologias '),
    path('Patologias/', views.list_chronic_pathologies, name='listar-patologias'),
    path('categorias-discapacidad/', views.list_disability_categories, name='listar-categorias-discapacidades'),
    path('Discapacidades/', views.list_disabilities, name='listar-discapacidades'),
    
    # --------------------
    # DATOS DE VESTIMENTA
    # --------------------

    path('listar-tallasCamisas/', views.list_shirt_sizes, name='listar tallas de camisa'),
    path('listar-tallaPantalones/',views.list_pant_sizes, name='listar tallas de pantalones'),
    path('listar-tallaZapatos/', views.list_shoe_sizes, name='listar tallas de Zapatos'),
    
    
    # --------------------
    # DATOS DE ACADEMICOS
    # --------------------
    path('listar-nivel-academico/', views.list_academic_levels, name='listar-nivel-academico'),
    path('Menciones/<int:carrera_id>/', views.list_career_specializations, name='listar-menciones'),
    path('carreras/', views.list_careers, name='listar-carreras'),
    
    
    # --------------------
    # UBICACION DEL VIVIENDA
    # --------------------
     #path para la ubicacion del personal

    path('direccion/estados/', views.get_estados, name='estados'),    
    path('direccion/municipios/<int:estadoid>/', views.get_municipios, name='municipios_por_estado'),
    path('direccion/parroquias/<int:municipioid>/', views.get_parroquias, name='parroquias'),
    path('condicion_vivienda/', views.list_housing_conditions, name='listar-condiciones-vivienda'),
    
    
     # --------------------
    # DATOS PERFIL
    # --------------------
    path('listar-sexo/',views.list_genders, name='listar-sexo'),
    path('listar-estadoCivil/',views.list_marital_statuses, name='listar-estadoCivil'),
    
  
   # --------------------
    # DEPENDENCIAS
    # --------------------

     
       #  CREACION 
    path('register-direccionGeneral/', views.create_general_directorate, name= "registro-direccion-general"),
    path('register-direccionLinea/', views.create_line_directorate, name= "registro-direccion-linea"),  
    path('register-Coordinacion/', views.create_coordination, name= "registro-coordinacion"), 
    
       #  ACTUALIZACION
    # path('DireccionGeneral/<int:id>/',views.Actualizar_DireccionGeneral, name= "actualizar-direccion-general"),
    # path('DireccionLinea/<int:id>/', views.Actualizar_DireccionLinea, name= "actualizar-direccion-linea "),
    # path('Coordinaciones/<int:id>/', views.Actualizar_Coordinacion, name= "actualizar-coordinacion "),
        
        #  LISTAR
    path('listar-DireccionGeneral/', views.list_general_directorates, name='lista las direcciones de linea'),
    path('listar-DireccionLinea/<int:general_id>/',views.list_line_directorates_by_general, name='lista las direcciones generales'),
    path('listar-Coordinacion/<int:line_id>/', views.list_coordinations_by_line, name='lista de las coordinaciones'),
      
# ------------------
# Gestion del codigo
# -------------------   
   
    path('empleados-codigo/', views.create_position, name='registrar-codigo'),
      # editar codigo
    path('codigos/<int:id>/', views.update_position, name='codigos-edit'),
#     # listar codigo  tanto activos como vacantes
    path('codigos_lister/', views.list_general_work_codes, name='lista de codigos generales'),
#     # lista unicamente los codigos vacantes
    path('listar-codigos/', views.list_vacant_work_codes, name='lista de codigos vacantes'),
    path('cargo_DreccionGeneral/<int:general_id>/', views.list_vacant_codes_by_general_directorate, name='lista cargos por las direcciones generales '),
    path('cargo_DreccionLinea/<int:general_id>/', views.list_vacant_codes_by_line_directorate, name='lista cargos por las direcciones de linea'),
    path('cargo_coordinacion/<int:coordination_id>/', views.list_vacant_codes_by_coordination, name='lista  cargos por las coordinaciones'),


# ------------------
# ASIGNACION DE CARGO
# -------------------

    path('asignar_codigo/<int:id>/', views.assign_employee, name='asignacion-cargo'),
    # asignar codigo especial (tipos de nomina que requieren que el codigo sea autogenerable)
    path('asignacion_CodigoEspecia/',views.assign_employee_special, name='asignacion-cargo-especial'),
    # listar empleados con su cargo
    path('Employee/cargos/', views.list_employees_active, name='empleados-listar'),
    #   # D
    # path('empleados/', views.list_employees_active, name='empleado-list-create'),
#     # BUSCA EMPLEADOS POR CEDULA 
    path('empleados-cedula/<str:cedulaidentidad>/', views.get_employee_by_id, name='empleado-por-cedula'),
    # # D
    # path('empleados/<str:cedulaidentidad>/', views.get_employee_by_id, name='empleado-detail'),
    
# ------------------
# DATOS PARA EL CARGO 
# -------------------

    # denominacion de cargo 
    path('listar-denominacion-cargo/', views.list_position_denominations, name='lista de denominacion de cargo'),
    path('listar-denominacion-cargo-especifico/', views.list_specific_position_denominations, name='listar-denominacion-cargo-especifico'),
     
    path('listar-grado/', views.list_job_grades, name='lista de grados'), 
    path('nomina/general/', views.list_payroll_types, name='lista de tipos de nominas generales'),
    path('listar-nominaPasivo/', views.list_retired_payroll_types, name='lista de tipos de nominas para personal pasivo'),
    path('listar-tipo-nomina/', views.list_active_payroll_types, name='lista de tipos de nominas sin CS Y HP'),
    # tipo de nominas con asignacion de codigo autogenerables (CS y HP)
    path('listar-nomina-especial/', views.list_special_payroll_types, name='lista de tipos de nominas solo CS Y HP'),
    
    #  estatus de gestion (BLOQUEADO, SUSPENDIDO,ACTIVO)
    path('estatus-gestion/',  views.list_management_statuses, name='lista de estatus para la gestion de cambio de estatus'),
   #  estatus de egreso (EGRESADO, PASIVO)
    path('estatus/',  views.list_exit_statuses, name='lista de estatus para egresar'),

# ---------------
# ORGANISMOS ADSCRITOS 
# ------------------- 
   path('OrganismoAdscrito/',views.create_subsidiary_organism, name= "registro-organismo-Adscrito"),
   path('organismos-adscritos/', views.list_subsidiary_organisms, name='lista de organismos adscritos'),
    
  
# ------------------
# RUTAS HISTORIAL DE EMPLEADOS
# -------------------  
    path('EmployeeMovementHistory/<str:cedulaidentidad>/', views.listar_historial_cargo, name='historial-por-cedula'),
    #   listar egresado por cedula 
    path('EmployeeEgresado/<str:cedulaidentidad>/', views.listar_empleado_Egresado, name='egresados-detail'),
    
# ------------------
# MOVIMIENTO DE PERSONAL Y ESTATUS
# ------------------- 
    path('historyEmployee/cargo-movimiento/<int:cargo_id>/', views.cambiar_cargo, name='cargo-movimiento'),
    path('historyEmployee/egreso/<str:cedulaidentidad>/', views.gestion_egreso_pasivo, name='empleado-egreso'),
    path('historyEmployee/Estatus/<int:cargo_id>/',views.gestionar_estatus_puesto, name='gestion-puestos'),
   
       
    path('motivos/egreso/', views.listar_motivos_egreso, name='api-motivos-egreso'),
    path('motivos/movimiento/', views.listar_motivos_internos, name='api-motivos-internos'),
    path('motivos/estatus/', views.listar_suspendido, name='api-motivos-suspendido'),

# ------------------
# GESTION DE FAMILIARES
# ------------------- 
    path('Employeefamily/', views.registrar_familiar, name='creacion-empleadoFamiliar'),
    path('Employeefamily/masivo/', views.registrar_familiares_masivo, name='creacion-masiva-empleadoFamiliar'),
    path('Employeefamily/<str:cedula_empleado>/',views.listar_familiares, name='listar-familiares-por-cedula'),
    path('Parentesco/', views.listar_parentesco, name="listar-parentesco"),


   

   
#   reporte
    path('EmployeeMovementHistory/reporte/',views.reporte_movimientos, name='reporte-movimiento'),
    
    
   
   
    # path('reportes/categias/', views.ReportCategoryListView.as_view(), name='reportes_categorias'),
    path('employee/reports/config/', views.EmployeeReportConfigView.as_view(), name='configuraciones_empleados'),
    path('family/reports/config/', views.FamilyReportConfigView.as_view(), name='configuraciones_familiares'),
    path('graduate/reports/config/', views.GraduateReportConfigView.as_view(), name='configuraciones_egresados'),
    path('reports/types/', views.ReportTypesConfigView.as_view(), name='tipos_reporte'),
    path('reports/', views.generate_dynamic_report, name='reporte_generico'),
]