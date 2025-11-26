// app/(clientside)/actions/workshops.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function GetActiveWorkshops() {
  try {
    const workshops = await prisma.workshop.findMany({
      where: {
        isOpen: true,
        date: {
          gte: new Date(),
        },
      },
      orderBy: {
        date: "asc",
      },
    });
    return workshops;
  } catch (error) {
    console.error("Error fetching workshops:", error);
    return [];
  }
}

export async function GetWorkshopById(id: string) {
  try {
    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: {
        _count: {
          select: { Registration: true },
        },
      },
    });
    return workshop;
  } catch (error) {
    console.error("Error fetching workshop:", error);
    return null;
  }
}

export async function CheckUserRegistration(email: string, workshopId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    const registration = await prisma.registration.findUnique({
      where: {
        userId_workshopId: {
          userId: user.id,
          workshopId,
        },
      },
    });

    return registration;
  } catch (error) {
    console.error("Error checking registration:", error);
    return null;
  }
}

// For pickup payment method only
export async function RegisterForWorkshop(
  workshopId: string,
  paymentMethod: "pickup",
  quantity: number
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: session.user.id || crypto.randomUUID(),
          email: session.user.email,
          name: session.user.name,
          updatedAt: new Date(),
        },
      });
    }

    // Check if already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_workshopId: {
          userId: user.id,
          workshopId,
        },
      },
    });

    if (existingRegistration) {
      return { success: false, error: "Already registered for this workshop" };
    }

    // Check availability
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
    });

    if (!workshop) {
      return { success: false, error: "Workshop not found" };
    }

    if (workshop.availableSeats < quantity) {
      return { success: false, error: "Not enough seats available" };
    }

    if (!workshop.isOpen) {
      return { success: false, error: "Registration is closed" };
    }

    const finalPrice =
      workshop.price - (workshop.price * workshop.discount) / 100;
    const totalAmount = finalPrice * quantity;

    // Create registration
    const registration = await prisma.$transaction(async (tx) => {
      const newRegistration = await tx.registration.create({
        data: {
          userId: user.id,
          workshopId,
          seats: quantity,
          paymentMethod,
          pricePaid: totalAmount,
          paymentStatus: "pending",
          paid: false,
        },
      });

      // Decrease available seats
      await tx.workshop.update({
        where: { id: workshopId },
        data: {
          availableSeats: {
            decrement: quantity,
          },
        },
      });

      return newRegistration;
    });

    revalidatePath(`/workshops/${workshopId}`);
    revalidatePath("/workshops");

    return { success: true, registration };
  } catch (error) {
    console.error("Error registering for workshop:", error);
    return { success: false, error: "Failed to register" };
  }
}

export async function CancelRegistration(workshopId: string) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get registration to get seats count
    const registration = await prisma.registration.findUnique({
      where: {
        userId_workshopId: {
          userId: user.id,
          workshopId,
        },
      },
    });

    if (!registration) {
      return { success: false, error: "Registration not found" };
    }

    // Delete registration and increment seats
    await prisma.$transaction(async (tx) => {
      await tx.registration.delete({
        where: {
          userId_workshopId: {
            userId: user.id,
            workshopId,
          },
        },
      });

      await tx.workshop.update({
        where: { id: workshopId },
        data: {
          availableSeats: {
            increment: registration.seats,
          },
        },
      });
    });

    revalidatePath(`/workshops/${workshopId}`);
    revalidatePath("/workshops");

    return { success: true };
  } catch (error) {
    console.error("Error canceling registration:", error);
    return { success: false, error: "Failed to cancel registration" };
  }
}