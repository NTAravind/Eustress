"use server";

import prisma  from "@/lib/prisma"; // Adjust your prisma import path
import { workshopSchema } from "@/lib/validations/workshop";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type ActionState = {
  message: string;
  errors?: Record<string, string[]>;
  status: "success" | "error" | "idle";
};

export async function upsertWorkshop(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Construct object from FormData
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    date: new Date(formData.get("date") as string),
    time: formData.get("time"),
    location: formData.get("location"),
    totalSeats: formData.get("totalSeats"),
    price: formData.get("price"),
    discount: formData.get("discount"),
    thumbnail: formData.get("thumbnail"),
    isOpen: formData.get("isOpen") === "true",
  };

  const workshopId = formData.get("id") as string | null;

  // 2. Validate with Zod
  const validatedFields = workshopSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      status: "error",
      message: "Invalid fields",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = validatedFields.data;

  try {
    if (workshopId) {
      // --- UPDATE ---
      await prisma.workshop.update({
        where: { id: workshopId },
        data: {
          ...data,
          // Note: We usually don't reset availableSeats automatically on edit
          // unless you have specific logic for it.
          updatedAt: new Date(),
        },
      });
    } else {
      // --- CREATE ---
      // Since your schema ID doesn't have a default, we generate one or rely on DB
      // Usually Prisma schemas use @default(cuid()). Assuming uuid here:
      await prisma.workshop.create({
        data: {
          id: crypto.randomUUID(),
          ...data,
          availableSeats: data.totalSeats, // Default available = total
          updatedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("Database Error:", error);
    return {
      status: "error",
      message: "Failed to save workshop. Please try again.",
    };
  }

  revalidatePath("/workshops");
  redirect("/workshops");
}
export async function getWorkshops() {
  try {
    const workshops = await prisma.workshop.findMany({
      include: {
        _count: {
          select: {
            Registration: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return workshops
  } catch (error) {
    console.error("Failed to fetch workshops:", error)
    throw new Error("Failed to fetch workshops")
  }
}