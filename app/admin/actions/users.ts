// app/admin/users/actions.ts
"use server"

import prisma from "@/lib/prisma"

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        Registration: {
          include: {
            Workshop: {
              select: {
                title: true,
                date: true,
              },
            },
          },
        },
        _count: {
          select: {
            Registration: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return users
  } catch (error) {
    console.error("Failed to fetch users:", error)
    throw new Error("Failed to fetch users")
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        Registration: {
          include: {
            Workshop: true,
          },
          orderBy: {
            registeredAt: "desc",
          },
        },
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    return user
  } catch (error) {
    console.error("Failed to fetch user:", error)
    throw new Error("Failed to fetch user")
  }
}