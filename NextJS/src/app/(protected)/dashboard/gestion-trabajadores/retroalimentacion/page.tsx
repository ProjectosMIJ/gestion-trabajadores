"use client";

import InputForm from "@/components/input-form";
import PageLayout from "@/components/layout/page-layout";
import { SelectForm } from "@/components/select-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import { getCategory } from "../api/getInfoRac";
import {
  disabilityCreateActions,
  disabilityGroup,
} from "./actions/actionsDisability";
import { AdsType } from "./schemas/schemaAds";
import { AllergiesSchema, schemaAllergies } from "./schemas/schemaAllergies";
import { CategoryGroup, schemaCategory } from "./schemas/schemaCategory";
import { DisabitySchema, schemaDisability } from "./schemas/schemaDisability";
import { PatologySchema, schemaPatologys } from "./schemas/schemaPatologys";
import {
  patologyCreateActions,
  patologyGroup,
} from "./actions/actionsPatologys";
import {
  allergiesCreateActions,
  allergiesGroup,
} from "./actions/actionsAllergies";
export default function FeedBack() {
  const { data: disabilityCategory, isLoading: isLoadingDisabilityCategory } =
    useSWR("disabiltyCategory", async () => getCategory("discapacidad"));
  const { data: patologyCategory, isLoading: isLoadingPatologyCategory } =
    useSWR("patologyCategory", async () => getCategory("patologias"));
  const { data: allergiesCategory, isLoading: isLoadingAllergiesCategory } =
    useSWR("allergiesCategory", async () => getCategory("alergias"));
  const formAds = useForm<AdsType>({
    defaultValues: {
      Organismoadscrito: undefined,
    },
  });
  const formDisabilityGroup = useForm<CategoryGroup>({
    defaultValues: {
      nombre_categoria: undefined,
    },
    resolver: zodResolver(schemaCategory),
  });

  const formPatology = useForm<PatologySchema>({
    defaultValues: {
      categoria_id: 0,
      patologia: undefined,
    },
    resolver: zodResolver(schemaPatologys),
  });
  const formPatologyGroup = useForm<CategoryGroup>({
    defaultValues: {
      nombre_categoria: undefined,
    },
    resolver: zodResolver(schemaCategory),
  });
  const formAllergiesGroup = useForm<CategoryGroup>({
    defaultValues: {
      nombre_categoria: undefined,
    },
    resolver: zodResolver(schemaCategory),
  });
  const formAllergies = useForm<AllergiesSchema>({
    defaultValues: {
      categoria_id: 0,
      alergia: undefined,
    },
    resolver: zodResolver(schemaAllergies),
  });
  const formDisability = useForm<DisabitySchema>({
    defaultValues: {
      categoria_id: 0,
      discapacidad: undefined,
    },
    resolver: zodResolver(schemaDisability),
  });
  const onSubmitAds = (values: AdsType) => {
    startTransition(async () => {});
  };
  const onSubmitDisability = (values: DisabitySchema) => {
    startTransition(async () => {
      const response = await disabilityCreateActions(values);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  };
  const onSubmitDisabilityGroup = (values: CategoryGroup) => {
    startTransition(async () => {
      const response = await disabilityGroup(values);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  };
  const onSubmitPatology = (values: PatologySchema) => {
    startTransition(async () => {
      const response = await patologyCreateActions(values);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  };
  const onSubmitPatologyGroup = (values: CategoryGroup) => {
    startTransition(async () => {
      const response = await patologyGroup(values);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  };
  const onSubmitAllergiesGroup = (values: CategoryGroup) => {
    startTransition(async () => {
      const response = await allergiesGroup(values);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  };
  const onSubmitAllergies = (values: AllergiesSchema) => {
    startTransition(async () => {
      const response = await allergiesCreateActions(values);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  };
  return (
    <PageLayout
      title="Retroalimentación"
      description="Registre Nueva Información Para Mantener El Sistema"
    >
      <Tabs defaultValue="ads" className=" m-auto">
        <TabsList className="gap-4">
          <TabsTrigger value="ads">Organismo Adscrito</TabsTrigger>
          <TabsTrigger value="dis">Discapacidades</TabsTrigger>
          <TabsTrigger value="pat">Patologias</TabsTrigger>
          <TabsTrigger value="aler">Alergias</TabsTrigger>
        </TabsList>
        <TabsContent value="ads">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Organismo Adscrito</h2>
            </CardHeader>
            <CardContent>
              <Form {...formAds}>
                <form
                  onSubmit={formAds.handleSubmit(onSubmitAds)}
                  className="space-y-3"
                >
                  <InputForm
                    form={formAds}
                    label="Agregar Nuevo Organismo Adscrito"
                    nameInput="Organismoadscrito"
                    type="text"
                  />
                  <Button type="submit" className="w-full">
                    Agregar Nuevo Organismo Ads
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dis">
          <div className=" flex gap-2">
            <Card className="grow">
              <CardHeader>
                <h2 className="text-2xl font-bold">
                  Agregar Nuevas Categoria de Discapidades
                </h2>
              </CardHeader>
              <CardContent>
                <Form {...formDisabilityGroup}>
                  <form
                    onSubmit={formDisabilityGroup.handleSubmit(
                      onSubmitDisabilityGroup,
                    )}
                    className="space-y-3 flex flex-col justify-between"
                  >
                    <InputForm
                      form={formDisabilityGroup}
                      label="Nueva Categoria de Discapacidad"
                      nameInput="nombre_categoria"
                      type="text"
                    />
                    <Button type="submit" className="w-full">
                      Agregar Nueva Categoria
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            <Card className="grow">
              <CardHeader>
                <h2 className="text-2xl font-bold">
                  Agregar Nuevas Dispacidades
                </h2>
              </CardHeader>
              <CardContent>
                <Form {...formDisability}>
                  <form
                    onSubmit={formDisability.handleSubmit(onSubmitDisability)}
                    className="space-y-3"
                  >
                    <SelectForm
                      Formlabel="Categoria"
                      SelectLabelItem="Categoria"
                      form={formDisability}
                      isLoading={isLoadingDisabilityCategory}
                      options={disabilityCategory?.data ?? []}
                      labelKey="nombre_categoria"
                      valueKey="id"
                      nameSalect="categoria_id"
                      placeholder="Seleccione una categoria"
                    />
                    <InputForm
                      form={formDisability}
                      label="Nueva Discapacidad"
                      nameInput="discapacidad"
                      type="text"
                    />

                    <Button type="submit" className="w-full">
                      Agregar Discapacidad
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="pat">
          <div className=" flex gap-2">
            <Card className="grow">
              <CardHeader>
                <h2 className="text-2xl font-bold">
                  Agregar Nuevas Categoria de Patologias
                </h2>
              </CardHeader>
              <CardContent>
                <Form {...formPatologyGroup}>
                  <form
                    onSubmit={formPatologyGroup.handleSubmit(
                      onSubmitPatologyGroup,
                    )}
                    className="space-y-3 "
                  >
                    <InputForm
                      form={formPatologyGroup}
                      label="Nueva Categoria de Patologia"
                      nameInput="nombre_categoria"
                      type="text"
                    />
                    <Button type="submit" className="w-full">
                      Agregar Nueva Categoria
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            <Card className="grow">
              <CardHeader>
                <h2 className="text-2xl font-bold">
                  Agregar Nuevas Patologias
                </h2>
              </CardHeader>
              <CardContent>
                <Form {...formPatology}>
                  <form
                    onSubmit={formPatology.handleSubmit(onSubmitPatology)}
                    className="space-y-3"
                  >
                    <SelectForm
                      Formlabel="Categoria"
                      SelectLabelItem="Categoria"
                      form={formPatology}
                      isLoading={isLoadingPatologyCategory}
                      options={patologyCategory?.data ?? []}
                      labelKey="nombre_categoria"
                      valueKey="id"
                      nameSalect="categoria_id"
                      placeholder="Seleccione una categoria"
                    />
                    <InputForm
                      form={formPatology}
                      label="Nueva Patologia"
                      nameInput="patologia"
                      type="text"
                    />

                    <Button type="submit" className="w-full">
                      Agregar Patologia
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="aler">
          <div className=" flex gap-2">
            <Card className="grow">
              <CardHeader>
                <h2 className="text-2xl font-bold">
                  Agregar Nuevas Categoria de Alergias
                </h2>
              </CardHeader>
              <CardContent>
                <Form {...formAllergiesGroup}>
                  <form
                    onSubmit={formAllergiesGroup.handleSubmit(
                      onSubmitAllergiesGroup,
                    )}
                    className="space-y-3 "
                  >
                    <InputForm
                      form={formAllergiesGroup}
                      label="Nueva Categoria de Alergias"
                      nameInput="nombre_categoria"
                      type="text"
                    />
                    <Button type="submit" className="w-full">
                      Agregar Nueva Categoria
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            <Card className="grow">
              <CardHeader>
                <h2 className="text-2xl font-bold">Agregar Nuevas Alergias</h2>
              </CardHeader>
              <CardContent>
                <Form {...formAllergies}>
                  <form
                    onSubmit={formAllergies.handleSubmit(onSubmitAllergies)}
                    className="space-y-3"
                  >
                    <SelectForm
                      Formlabel="Categoria"
                      SelectLabelItem="Categoria"
                      form={formAllergies}
                      isLoading={isLoadingAllergiesCategory}
                      options={allergiesCategory?.data ?? []}
                      labelKey="nombre_categoria"
                      valueKey="id"
                      nameSalect="categoria_id"
                      placeholder="Seleccione una categoria"
                    />
                    <InputForm
                      form={formAllergies}
                      label="Nueva Alergia"
                      nameInput="alergia"
                      type="text"
                    />

                    <Button type="submit" className="w-full">
                      Agregar Alergia
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
