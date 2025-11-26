// app/admin/registrations/actions.ts
"use server"
import prisma from "@/lib/prisma"

export async function getRegistrations() {
  try {
    const registrations = await prisma.registration.findMany({
      include: {
        User: {
          select: {
            id: true,
            email: true,
            name: true,
            phoneno: true,
          },
        },
        Workshop: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            price: true,
          },
        },
      },
      orderBy: {
        registeredAt: "desc",
      },
    })

    return registrations
  } catch (error) {
    console.error("Failed to fetch registrations:", error)
    throw new Error("Failed to fetch registrations")
  }
}

export async function getRegistrationById(id: string) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        User: true,
        Workshop: true,
      },
    })

    if (!registration) {
      throw new Error("Registration not found")
    }

    return registration
  } catch (error) {
    console.error("Failed to fetch registration:", error)
    throw new Error("Failed to fetch registration")
  }
}

export async function updatePaymentStatus(
  id: string,
  data: {
    paid?: boolean
    paymentStatus?: string
    paymentMethod?: string
  }
) {
  try {
    const registration = await prisma.registration.update({
      where: { id },
      data,
    })

    return registration
  } catch (error) {
    console.error("Failed to update payment status:", error)
    throw new Error("Failed to update payment status")
  }
}
export async function getWorkshopsWithRegistrationCount() {
  const workshops = await prisma.workshop.findMany({
    include: {
      _count: {
        select: {
          Registration: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  })

  return workshops
}

export async function getWorkshopRegistrations(workshopId: string) {
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  })

  if (!workshop) {
    throw new Error("Workshop not found")
  }

  const registrations = await prisma.registration.findMany({
    where: {
      workshopId: workshopId,
    },
    include: {
      User: true,
    },
    orderBy: {
      registeredAt: 'desc',
    },
  })

  return {
    workshop,
    registrations,
  }
}

