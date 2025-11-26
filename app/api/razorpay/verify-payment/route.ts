// app/api/razorpay/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      workshopId,
      quantity,
    } = await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Already registered for this workshop" },
        { status: 400 }
      );
    }

    // Get workshop details
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
    });

    if (!workshop) {
      return NextResponse.json(
        { error: "Workshop not found" },
        { status: 404 }
      );
    }

    if (workshop.availableSeats < quantity) {
      return NextResponse.json(
        { error: "Not enough seats available" },
        { status: 400 }
      );
    }

    // Calculate final price
    const finalPrice = workshop.price - (workshop.price * workshop.discount) / 100;
    const totalAmount = finalPrice * quantity;

    // Create registration and update seats in transaction
    const registration = await prisma.$transaction(async (tx) => {
      const newRegistration = await tx.registration.create({
        data: {
          userId: user.id,
          workshopId,
          seats: quantity,
          paymentMethod: "razorpay",
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          pricePaid: totalAmount,
          paymentStatus: "completed",
          paid: true,
        },
      });

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

    return NextResponse.json({
      success: true,
      registration,
      message: "Payment verified and registration completed",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}