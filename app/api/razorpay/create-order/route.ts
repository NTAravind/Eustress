// app/api/razorpay/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { workshopId, quantity } = await req.json();

    if (!workshopId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid request data" },
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

    // Check availability
    if (workshop.availableSeats < quantity) {
      return NextResponse.json(
        { error: "Not enough seats available" },
        { status: 400 }
      );
    }

    if (!workshop.isOpen) {
      return NextResponse.json(
        { error: "Registration is closed" },
        { status: 400 }
      );
    }

    // Calculate final price
    const finalPrice = workshop.price - (workshop.price * workshop.discount) / 100;
    const totalAmount = Math.round(finalPrice * quantity * 100); // Convert to paise

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: "INR",
      receipt: `ws-${Date.now()}`,
      notes: {
        workshopId,
        userId: session.user.id!,
        userEmail: session.user.email,
        quantity: quantity.toString(),
        workshopTitle: workshop.title,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: totalAmount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}