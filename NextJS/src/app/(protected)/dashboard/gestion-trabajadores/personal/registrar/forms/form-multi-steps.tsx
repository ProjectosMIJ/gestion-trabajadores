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
import { useCallback, useTransition } from "react";
import { BasicInfoType } from "../schemas/schema-basic-info";
import { AcademyType } from "../schemas/schema-academic_training";
import { BackgroundType } from "../schemas/schema-background";
import { HealthType } from "../schemas/schema-health_profile";
import { PhysicalProfileType } from "../schemas/schema-physical_profile";
import { DwellingType } from "../schemas/schema-dwelling";
import { registerEmployeeSteps } from "../actions/formStepActions";
import { FamilyEmployeeType } from "../schemas/schema-family_employee";
import { FormFamilyEmployee } from "./form-family";
type Values = [
  FormFormity<BasicInfoType>,
  FormFormity<AcademyType>,
  FormFormity<BackgroundType>,
  FormFormity<HealthType>,
  FormFormity<PhysicalProfileType>,
  FormFormity<DwellingType>,
  FormFormity<FamilyEmployeeType>,
  ReturnFormity<
    BasicInfoType &
      AcademyType &
      BackgroundType &
      HealthType &
      PhysicalProfileType &
      DwellingType &
      FamilyEmployeeType
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
        file: [null as unknown as File, []],
        fecha_nacimiento: [new Date(), []],
        fechaingresoorganismo: [new Date(), []],
        n_contrato: ["", []],
        sexoid: [0, []],
        estadoCivil: [0, []],
      }),
      render: ({ values, onNext }) => (
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
            carrera_id: undefined,
            mencion_id: undefined,
            capacitacion: undefined,
            institucion: undefined,
          },
          [],
        ],
      }),
      render: ({ values, onNext }) => (
        <FormAcademyLevel defaultValues={values} onSubmit={onNext} />
      ),
    },
  },
  {
    form: {
      values: () => ({
        fechaingresoorganismo: [new Date(), []],
        antecedentes: [
          [
            {
              institucion: undefined as unknown as string,
              fecha_ingreso: undefined as unknown as Date,
              fecha_egreso: undefined as unknown as Date,
            },
          ],
          [],
        ],
      }),
      render: ({ values, onNext }) => (
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
      render: ({ values, onNext }) => (
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
      render: ({ values, onNext }) => (
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
      render: ({ values, onNext }) => (
        <FormDwelling defaultValues={values} onSubmit={onNext} />
      ),
    },
  },
  {
    form: {
      values: () => ({
        familys: [[], []],
      }),
      render: ({ values, onNext }) => {
        return <FormFamilyEmployee defaultValues={values} onSubmit={onNext} />;
      },
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

  const onReturn = useCallback<OnReturn<Values>>((output) => {
    startTransition(async () => {
      const message = await registerEmployeeSteps(output);
      if (message.success) {
        toast.success(message.message);
      } else {
        toast.error(message.message);
      }
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
