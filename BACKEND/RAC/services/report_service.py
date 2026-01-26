MAPA_REPORTES = {
    "empleados": {
        "modelo": "Employee",
        "campos_permitidos": {
            "dependencia": "assignments__DireccionGeneral__dependenciaId__dependencia",
            "direccion_general": "assignments__DireccionGeneral__direccion_general",
            "cod_direccion": "assignments__DireccionGeneral__Codigo",
            "direccion_linea": "assignments__DireccionLinea__direccion_linea",
            "coordinacion": "assignments__Coordinacion__coordinacion",
            "sexo": "sexoid__sexo",
            "estado_civil": "estadoCivil__estadoCivil",
            "talla_camisa": "perfil_fisico__tallaCamisa__talla",
            "talla_pantalon": "perfil_fisico__tallaPantalon__talla",
            "talla_zapatos": "perfil_fisico__tallaZapatos__talla",
            "grupo_sanguineo": "perfil_salud__grupoSanguineo__GrupoSanguineo",
            "discapacidades": "perfil_salud__discapacidad__discapacidad",
            "patologias": "perfil_salud__patologiaCronica__patologia",
            "nivel_academico": "formacion_academica__nivel_Academico_id__nivelacademico",
            "carrera": "formacion_academica__carrera_id__nombre_carrera",
            "tipo_nomina": "assignments__tiponominaid__nomina",
            "estatus": "assignments__estatusid__estatus",
        },
        "filtros_permitidos": {
            "dependencia_id": "assignments__DireccionGeneral__dependenciaId",
            "direccion_general_id": "assignments__DireccionGeneral",
            "direccion_linea_id": "assignments__DireccionLinea",
            "coordinacion_id": "assignments__Coordinacion",
            "sexo_id": "sexoid",
            "discapacidad_id": "perfil_salud__discapacidad",
            "patologia_id": "perfil_salud__patologiaCronica",
            "nomina_id": "assignments__tiponominaid",
            "grado_id": "assignments__gradoid",
            "cargo_id": "assignments__denominacioncargoid",
            "estatus_id": "assignments__estatusid",
            "tipo_personal": "assignments__Tipo_personal__tipo_personal",
        }
    },
    "familiares": {
       "modelo": "Employee",
        "campos_permitidos": {
            "parentesco": "carga_familiar__parentesco__descripcion_parentesco",
            "sexo": "carga_familiar__sexo__sexo",
            "estado_civil": "carga_familiar__estadoCivil__estadoCivil",
            "talla_camisa": "carga_familiar__perfil_fisico_set__tallaCamisa__talla",
            "grupo_sanguineo": "carga_familiar__perfil_salud_set__grupoSanguineo__GrupoSanguineo",
            "discapacidades": "carga_familiar__perfil_salud_set__discapacidad__discapacidad",
            "patologias": "carga_familiar__perfil_salud_set__patologiaCronica__patologia",
            "tipo_nomina": "assignments__tiponominaid__nomina",
            "dependencia": "assignments__DireccionGeneral__dependenciaId__dependencia",
            "direccion_general": "assignments__DireccionGeneral__direccion_general",
            "direccion_linea": "assignments__DireccionLinea__direccion_linea",
            "coordinacion": "assignments__Coordinacion__coordinacion",
        },
        "filtros_permitidos": {
            "parentesco_id": "carga_familiar__parentesco",
            "sexo_id": "carga_familiar__sexo",
            "edad_max": "carga_familiar__fechanacimiento__gte", 
            "nomina_id": "assignments__tiponominaid",
            "direccion_general_id": "assignments__DireccionGeneral",
            "direccion_linea_id": "assignments__DireccionLinea",
            "coordinacion_id": "assignments__Coordinacion",
        }
    },
    "egresados": {
        "modelo": "EmployeeEgresado",
        "campos_permitidos": {
            "motivo": "motivo_egreso__movimiento",
            "direccion_general": "DireccionGeneral__direccion_general",
            "direccion_linea": "DireccionLinea__direccion_linea",
            "coordinacion": "Coordinacion__coordinacion",
            "cargo": "denominacioncargoid__cargo",
            "cargo_especifico": "denominacioncargoespecificoid__cargo",
            "grado": "gradoid__grado",
            "tipo_nomina": "tiponominaid__nomina",
            "organismo": "OrganismoAdscritoid__Organismoadscrito", 
        },
        "filtros_permitidos": {
            "motivo_id": "motivo_egreso",
            "cargo_id": "denominacioncargoid",
            "cargo_especifico_id": "denominacioncargoespecificoid",
            "grado_id": "gradoid",
            "nomina_id": "tiponominaid",
            "direccion_general_id": "DireccionGeneral",
            "direccion_linea_id": "DireccionLinea",
            "coordinacion_id": "Coordinacion",
            "organismo_id": "OrganismoAdscritoid",
            "fecha_egreso_inicio": "fecha_egreso__gte",
            "fecha_egreso_fin": "fecha_egreso__lte",
        }
    }
}
def obtener_configuracion_reportes():
    config_frontend = {}
    for cat_nombre, cat_data in MAPA_REPORTES.items():
        config_frontend[cat_nombre] = {
            "agrupaciones": list(cat_data["campos_permitidos"].keys()),
            "filtros": list(cat_data["filtros_permitidos"].keys())
        }
    return config_frontend