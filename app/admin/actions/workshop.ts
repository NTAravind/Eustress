"use server";

import prisma from "@/lib/prisma";
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

      // Revalidate specific workshop detail page
      revalidatePath(`/workshops/${workshopId}`);
    } else {
      // --- CREATE ---
      const newWorkshop = await prisma.workshop.create({
        data: {
          id: crypto.randomUUID(),
          ...data,
          availableSeats: data.totalSeats, // Default available = total
          updatedAt: new Date(),
        },
      });

      // Revalidate the newly created workshop detail page
      revalidatePath(`/workshops/${newWorkshop.id}`);
    }
  } catch (error) {
    console.error("Database Error:", error);
    return {
      status: "error",
      message: "Failed to save workshop. Please try again.",
    };
  }

  // Revalidate workshops listing page
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
    });
    return workshops;
  } catch (error) {
    console.error("Failed to fetch workshops:", error);
    throw new Error("Failed to fetch workshops");
  }
}

// Optional: Add delete action with revalidation
export async function deleteWorkshop(workshopId: string): Promise<ActionState> {
  try {
    await prisma.workshop.delete({
      where: { id: workshopId },
    });

    // Revalidate both listing and the deleted workshop page
    revalidatePath("/workshops");
    revalidatePath(`/workshops/${workshopId}`);

    return {
      status: "success",
      message: "Workshop deleted successfully",
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      status: "error",
      message: "Failed to delete workshop. Please try again.",
    };
  }
}

// Optional: Toggle workshop open/closed status
export async function toggleWorkshopStatus(
  workshopId: string,
  isOpen: boolean
): Promise<ActionState> {
  try {
    await prisma.workshop.update({
      where: { id: workshopId },
      data: {
        isOpen,
        updatedAt: new Date(),
      },
    });

    // Revalidate both listing and specific workshop page
    revalidatePath("/workshops");
    revalidatePath(`/workshops/${workshopId}`);

    return {
      status: "success",
      message: `Workshop ${isOpen ? "opened" : "closed"} successfully`,
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      status: "error",
      message: "Failed to update workshop status. Please try again.",
    };
  }
}