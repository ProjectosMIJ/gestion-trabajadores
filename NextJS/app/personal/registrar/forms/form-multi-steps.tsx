"use client";
import {
  type Schema as SchemaFormity,
  type Form as FormFormity,
  type Return as ReturnFormity,
  OnReturn,
  Formity,
} from "@formity/react";

import FormAcademyLevel from "./form-academic_training";
import FormPhysical from "./form-physical_profile";
import FormDwelling from "./form-dwelling";
import FormHealth from "./form-health_profile";
import { FormBasicInfo } from "./form-basic-info";
import FormBackground from "./form-background";

import { toast } from "sonner";
import { useCallback, useState, useTransition } from "react";
import { BasicInfoType } from "../schemas/schema-basic-info";
import { AcademyType } from "../schemas/schema-academic_training";
import { BackgroundType } from "../schemas/schema-background";
import { HealthType } from "../schemas/schema-health_profile";
import { PhysicalProfileType } from "../schemas/schema-physical_profile";
import { DwellingType } from "../schemas/schema-dwelling";
import { registerEmployeeSteps } from "../actions/formStepActions";
type Values = [
  FormFormity<BasicInfoType>,
  FormFormity<AcademyType>,
  FormFormity<BackgroundType>,
  FormFormity<HealthType>,
  FormFormity<PhysicalProfileType>,
  FormFormity<DwellingType>,
  ReturnFormity<
    BasicInfoType &
      AcademyType &
      BackgroundType &
      HealthType &
      PhysicalProfileType &
      DwellingType
  >,
];

const schema: SchemaFormity<Values> = [
  {
    form: {
      values: () => ({
        usuario_id: [0, []],
        cedulaidentidad: ["", []],
        nombres: ["", []],
        apellidos: ["", []],
        file: [null, []],
        fecha_nacimiento: [new Date(), []],
        fechaingresoorganismo: [new Date(), []],
        n_contrato: ["", []],
        sexoid: [0, []],
        estadoCivil: [0, []],
      }),
      render: ({ values, onNext, onBack }) => (
        <FormBasicInfo defaultValues={values} onSubmit={onNext} />
      ),
    },
  },

  {
    form: {
      values: () => ({
        formacion_academica: [
          {
            nivel_Academico_id: 0,
            carrera_id: 0,
            mencion_id: 0,
            capacitacion: "",
            institucion: "",
          },
          [],
        ],
      }),
      render: ({ values, onNext, onBack }) => (
        <FormAcademyLevel defaultValues={values} onSubmit={onNext} />
      ),
    },
  },
  {
    form: {
      values: () => ({
        antecedentes: [
          [
            {
              institucion: "",
              fecha_ingreso: new Date(),
              fecha_egreso: new Date(),
            },
          ],
          [],
        ],
      }),
      render: ({ values, onNext, onBack }) => (
        <FormBackground defaultValues={values} onSubmit={onNext} />
      ),
    },
  },
  {
    form: {
      values: () => ({
        perfil_salud: [
          {
            grupoSanguineo: 0,
            discapacidad: [],
            patologiaCronica: [],
          },
          [],
        ],
      }),
      render: ({ values, onNext, onBack }) => (
        <FormHealth defaultValues={values} onSubmit={onNext} />
      ),
    },
  },
  {
    form: {
      values: () => ({
        perfil_fisico: [
          {
            tallaCamisa: 0,

            tallaPantalon: 0,
            tallaZapatos: 0,
          },
          [],
        ],
      }),
      render: ({ values, onNext, onBack }) => (
        <FormPhysical defaultValues={values} onSubmit={onNext} />
      ),
    },
  },
  {
    form: {
      values: () => ({
        datos_vivienda: [
          {
            direccion_exacta: "",
            estado_id: 0,
            municipio_id: 0,
            parroquia: 0,

            condicion_vivienda_id: 0,
          },
          [],
        ],
      }),
      render: ({ values, onNext, onBack }) => (
        <FormDwelling defaultValues={values} onSubmit={onNext} />
      ),
    },
  },
  {
    return: (data) => {
      return data;
    },
  },
];
export default function MultiStepForm() {
  const [isPending, startTransition] = useTransition();
  const [output, setOutput] = useState<
    | (BasicInfoType &
        AcademyType &
        BackgroundType &
        HealthType &
        PhysicalProfileType &
        DwellingType)
    | null
  >(null);
  const onReturn = useCallback<OnReturn<Values>>((output) => {
    startTransition(async () => {
      await registerEmployeeSteps(output);
    });
  }, []);
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <p className="animate-pulse text-lg font-bold">
          Procesando información de defensa...
        </p>
      </div>
    );
  }

  return <Formity schema={schema} onReturn={onReturn} />;
}
