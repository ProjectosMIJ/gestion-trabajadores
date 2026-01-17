from django.urls import path
from . import views

app_name = 'Registro de asignacion de cargos'
urlpatterns = [
    # crear empleado (datos personales)
    path('employees_register/',views.register_employee, name='employee-register'),
    # actulizacion de datos personales
    path('employes-actualizar/<int:id>/', views.editar_empleado, name='actualizar-empleado'),
 # CREACION  Y DE LOS CARGOS
    # registrar nuevo codigo 
     path('empleados-codigo/', views.register_codigo, name='registrar-codigo'),
     
      # editar codigo
    path('codigos/<int:id>/', views.editar_codigo, name='codigos-edit'),
    
# ASIGNACON DE CARGOS AL EMPLEADO

     # asignar codigo a empleado 
    path('asignar_codigo/<int:id>/', views.asignar_cargo, name='asignacion-cargo'),
    
    # asignar codigo especial (tipos de nomina que requieren que el codigo sea autogenerable)
    path('asignacion_CodigoEspecia/',views.Cargo_Especial, name='asignacion-cargo-especial'),
    
    # crear organismos adscrito
   path('register-organismoAdscrito/',views.register_organismoAdscrito, name= "registro-organismo-Adscrito"),
   

   
#  DEPENDENCIAS 

#     creacion  de direccion general
    path('register-direccionGeneral/', views.register_DireccionGeneral, name= "registro-direccion-general"),
    #  Actualizacion de dirccion general
    path('update_direccionGeneral/<int:id>/',views.Actualizar_DireccionGeneral, name= "actualizar-direccion-general"),
    #  creacion de direccion de linea 
    path('register-direccionLinea/', views.register_DireccionLinea, name= "registro-direccion-linea"),  
#    actualizacion de direccion de linea
    path('update-direccionLinea/<int:id>/', views.Actualizar_DireccionLinea, name= "actualizar-direccion-linea "),
    
    # creacion de coordinacion 
    path('register-Coordinacion/', views.register_Coordinacion, name= "registro-coordinacion"),  
#    actualizacion de coordinacion
    path('update-coordinacion/<int:id>/', views.Actualizar_Coordinacion, name= "actualizar-coordinacion "),
# ------------------
# Gestion del codigo
# -------------------   
   
#     # listar codigo  tanto activos como vacantes
    path('codigos_lister/', views.Codigos_generales, name='lista de codigos generales'),
    

#     # lista unicamente los codigos vacantes
    path('listar-codigos/', views.Codigos_Vacantes, name='lista de codigos vacantes'),
    
    path('cargo_DreccionGeneral/<int:direccioGenealid>/', views.Cargos_Vacantes_DireccionGeneral, name='lista cargos por las direcciones generales '),
    
    path('cargo_DreccionLinea/<int:direccioLineaId>/', views.Cargos_Vacantes_direccionLinea, name='lista cargos por las direcciones de linea'),
    path('cargo_coordinacion/<int:cooridnacionoId>/', views.Cargos_Vacantes_coordinacion, name='lista  cargos por las coordinaciones'),

# solo sus datos personales 
    path('listar-data-empleados/<str:cedulaidentidad>/', views.listar_empleadosData, name='listar-data-empleados'),
# con su cargo 
#       # listar empleados con su cargo
    path('empleados-listar/', views.listar_empleados, name='empleados-listar'),
    
    # D
    path('empleados/', views.EmployeeViewSet.as_view({'get': 'list'}), name='empleado-list-create'),

    
#     # BUSCA EMPLEADOS POR CEDULA 
    path('empleados-cedula/<str:cedulaidentidad>/', views.listar_empleadosCedula, name='empleado-por-cedula'),
    
    # D
    path('empleados/<str:cedulaidentidad>/', views.EmployeeViewSet.as_view({'get': 'retrieve'}), name='empleado-detail'),

#   #  LISTAR PASIVOS 
#       path('empleados-pasivos/', listar_pasivos, name='empleados-pasivos'), 
#       # path('empleados-pasivos/<str:cedulaidentidad>/', empleado_por_cedula, name='empleado-por-cedula'),
    
    #  sexo
    path('listar-sexo/',views.listar_sexo, name='listar-sexo'),
    
    # estado civil
    path('listar-estadoCivil/',views.listar_EstadoCivil, name='listar-estadoCivil'),
    
    # nivel academico 
    path('listar-nivel-academico/', views.listar_nivelAcademico, name='listar-nivel-academico'),
    
    # grupo sanguineo
    path('listar-grupoSanguineos/', views.listar_GrupoSanguineo, name='listar-grupoSanguineo'),
    
    # categorias de las patologias 
    path('categorias-patologias/', views.categorias_Patologias, name='listar-categorias-patologias '),
    #  patologias
    path('listar-patologias/<int:categoria_id>/', views.Patologias, name='listar-patologias'),
    # categorias de las discapacidades 
    path('categorias-discapacidad/', views.listar_Categorias_Discapacidades, name='listar-categorias-discapacidades'),
    # discapacidades
    path('discapacidades/<int:categoria_id>/', views.listar_Discapacidades, name='listar-discapacidades'),
    
    path('Menciones/<int:carrera_id>/', views.Menciones_carreras, name='listar-menciones'),
    path('carreras/', views.Carreras, name='listar-carreras'),
    
    path('condicion_vivienda/', views.CondicionVivienda, name='listar-condiciones-vivienda'),
    # tallas de camisas 
    path('listar-tallasCamisas/', views.listar_TallasCamisas, name='listar tallas de camisa'),
    
    # tallas de pantalones
    path('listar-tallaPantalones/',views.listar_TallasPantalones, name='listar tallas de pantalones'),
    
    # tallas de zapatos 
    path('listar-tallaZapatos/', views.listar_TallasZapatos, name='listar tallas de Zapatos'),

    # denominacion de cargo 
    path('listar-denominacion-cargo/', views.listar_denominacion_cargo, name='lista de denominacion de cargo'),
    
    # denominacion de cargo especifico 
    path('listar-denominacion-cargo-especifico/', views.listar_denominacion_cargo_especifico, name='listar-denominacion-cargo-especifico'),
    
    # organismos adscritos 
    path('organismos-adscritos/', views.listar_Organismo_adscrito, name='lista de organismos adscritos'),
    
    # grados 
    path('listar-grado/', views.listar_grado, name='lista de grados'), 
    
    
    path('listar-nomina-general/', views.listar_nominaGeneral, name='lista de tipos de nominas generales'),
    
    #  tipos de nominas
    
    path('listar-nominaPasivo/', views.listar_tipo_nomina_pasivos, name='lista de tipos de nominas para personal pasivo'),
    path('listar-tipo-nomina/', views.listar_tipo_nomina, name='lista de tipos de nominas sin CS Y HP'),
    
    # tipo de nominas con asignacion de codigo autogenerables (CS y HP)
    
    path('listar-nomina-especial/', views.listar_tipo_nominaEspeciales, name='lista de tipos de nominas solo CS Y HP'),

    
    # direccion general 
    path('listar-DireccionGeneral/', views.listar_DireecionGeneral, name='lista las direcciones de linea'),
    
    # direcciones de linea 
    path('listar-DireccionLinea/<int:direccionGeneral>/',views.direccion_lineal, name='lista las direcciones generales'),
    
    #  Coordinaciones
    path('listar-Coordinacion/<int:direccionLinea>/', views.listar_Coordinaciones, name='lista de las coordinaciones'),
     
     
    #  estatus de gestion (BLOQUEADO, SUSPENDIDO,ACTIVO)
    
    path('estatus-gestion/',  views.listar_estatus_Gestion, name='lista de estatus para la gestion de cambio de estatus'),
    
   #  estatus de egreso (EGRESADO, PASIVO)
    
    path('estatus/',  views.listar_estatus_Egresos, name='lista de estatus para egresar'),
    

    #path para la ubicacion del personal


    path('estados/', views.get_estados, name='estados'),    
    path('municipios/<int:estadoid>/', views.get_municipios, name='municipios_por_estado'),
    path('parroquias/<int:municipioid>/', views.get_parroquias, name='parroquias'),
    # registrar
    path('estadoregister/',views.estado_create_many),
    path('municipios/crear/', views.municipio_create_many, name='municipio-create-many'),
    # Parroquia: POST /api/parroquias/crear/
    path('parroquias/crear/', views.parroquia_create_many, name='parroquia-create-many'),

# # RUTAS HISTORIAL DE EMPLEADOS
#  # cambio de cargo 
    path('cargo-movimiento/<int:cargo_id>/', views.cambiar_cargo, name='cargo-movimiento'),
    
# # #     #  egreso de un empleado (cambiar nombre)
    path('egreso/<str:cedulaidentidad>/', views.gestion_egreso_pasivo, name='empleado-egreso'),


# #         # Estatus
    path('Estatus/<int:cargo_id>/',views.gestionar_estatus_puesto, name='gestion-puestos'),
# # #     # historial de un empleado
    path('historial/<str:cedulaidentidad>/', views.listar_historial_cargo, name='historial-por-cedula'),

#   listar egresado por cedula 
    path('listar-egresados/<str:cedulaidentidad>/', views.listar_empleado_Egresado, name='egresados-detail'),

   
#   reporte
    path('reporte-movimiento/',views.reporte_movimientos, name='reporte-movimiento'),
   
### urls de familiares
    path('create-empleadoFamiliar/', views.registrar_familiar, name='creacion-empleadoFamiliar'),
    path('familiares/<str:cedula_empleado>/',views.listar_familiares, name='listar-familiares-por-cedula'),
    path('listar-parentesco/', views.listar_parentesco, name="listar-parentesco")


]