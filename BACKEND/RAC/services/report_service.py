
MAPA_REPORTES = {
    "empleados": {
        "modelo": "Employee",
        "campos_permitidos": {
            "dependencia": "assignments__DireccionGeneral__dependenciaId__dependencia",
            "direcciongeneral": "assignments__DireccionGeneral__direccion_general",
            "cod_direccion": "assignments__DireccionGeneral__Codigo",
            "direccionlinea": "assignments__DireccionLinea__direccion_linea",
            "coordinaciones": "assignments__Coordinacion__coordinacion",
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
        },
        "filtros_permitidos": {
            "dependencia_id": "assignments__DireccionGeneral__dependenciaId",
            "direcciongeneral_id": "assignments__DireccionGeneral",
            "sexo_id": "sexoid",
            "discapacidad_id": "perfil_salud__discapacidad",
            "patologia_id": "perfil_salud__patologiaCronica",
            "nomina_id": "assignments__tiponominaid",
        }
    },
    "familiares": {
        "modelo": "Employeefamily",
        "campos_permitidos": {
            "parentesco": "parentesco__descripcion_parentesco",
            "sexo": "sexo__sexo",
            "discapacidades": "perfil_salud__discapacidad__discapacidad",
            "patologias": "perfil_salud__patologiaCronica__patologia",
            "dependencia_titular": "employeecedula__assignments__DireccionGeneral__dependenciaId__dependencia",
        },
        "filtros_permitidos": {
            "parentesco_id": "parentesco",
            "sexo_id": "sexo",
            "edad_max": "fechanacimiento__gte",
            "discapacidad_id": "perfil_salud__discapacidad",
            "patologia_id": "perfil_salud__patologiaCronica",
            "dependencia_id": "employeecedula__assignments__DireccionGeneral__dependenciaId",
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