"use server";
import z from "zod";
import { BasicInfoType } from "../schemas/schema-basic-info";
import { AcademyType } from "../schemas/schema-academic_training";
import { BackgroundType } from "../schemas/schema-background";
import { HealthType } from "../schemas/schema-health_profile";
import { PhysicalProfileType } from "../schemas/schema-physical_profile";
import { DwellingType } from "../schemas/schema-dwelling";
import { Values } from "@formity/react";
export async function registerEmployeeSteps(
  data: BasicInfoType &
    AcademyType &
    BackgroundType &
    HealthType &
    PhysicalProfileType &
    DwellingType,
) {
  setTimeout(() => {
    console.log("Register Employee Steps", data);
  }, 4000);
  return;
}
