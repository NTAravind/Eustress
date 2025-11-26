// app/api/admin/cancel-workshop/route.ts
import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import prisma from "@/lib/prisma"

console.log("✅ cancel-workshop route.ts file loaded")

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

console.log("✅ Nodemailer transporter created for workshop cancellation")

// Email template for workshop cancellation
function generateCancellationEmail(
  userName: string,
  workshopTitle: string,
  workshopDate: Date,
  workshopTime: string,
  workshopLocation: string,
  seats: number,
  userEmail: string
) {
  const formattedDate = new Date(workshopDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return {
    subject: `CANCELED: ${workshopTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; background-color: #000000; font-family: Helvetica, Arial, sans-serif; color: #ffffff; }
            table { border-collapse: collapse; width: 100%; }
            .container { max-width: 600px; margin: 0 auto; background-color: #000000; border: 1px solid #333333; }
            .header { padding: 40px 20px; text-align: center; border-bottom: 1px solid #333333; }
            .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; color: #ffffff; text-decoration: none; display: inline-block; }
            .logo span { color: #dc2626; }
            .badge { background: #dc2626; color: #ffffff; padding: 4px 8px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; display: inline-block; margin-top: 15px; }
            .content { padding: 40px 30px; }
            .title-large { font-size: 32px; font-weight: 900; text-transform: uppercase; line-height: 1; margin: 0 0 20px 0; letter-spacing: -1px; }
            .text-body { color: #a3a3a3; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
            
            /* Workshop Details Box */
            .workshop-box { border: 1px solid #333333; margin: 30px 0; }
            .workshop-row { border-bottom: 1px solid #333333; }
            .workshop-row:last-child { border-bottom: none; }
            .workshop-cell { padding: 15px; width: 50%; vertical-align: top; }
            .label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #525252; font-weight: bold; display: block; margin-bottom: 5px; }
            .value { font-size: 14px; color: #ffffff; font-weight: bold; text-transform: uppercase; }

            /* Refund Box */
            .refund-box { border: 1px solid #dc2626; background-color: #1a0505; padding: 20px; margin: 30px 0; }
            .refund-title { color: #dc2626; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 0; letter-spacing: 1px; }
            
            /* CTA Button */
            .cta-button { display: block; background-color: #ffffff; color: #000000; padding: 15px 0; text-align: center; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; margin-top: 20px; border: 1px solid #ffffff; }
            
            .footer { border-top: 1px solid #333333; padding: 30px; text-align: center; color: #525252; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
            .footer a { color: #525252; text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="logo">EUSTRESS<span>.</span></div>
              <br>
              <span class="badge">Notice of Cancellation</span>
            </div>

            <!-- Content -->
            <div class="content">
              <p class="text-body" style="color: #dc2626; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Attention ${userName || "Participant"},</p>
              
              <h1 class="title-large">We have canceled<br>this session.</h1>
              
              <p class="text-body">
                Due to unforeseen circumstances, the following scheduled workshop will not take place. We apologize for the disruption to your training schedule.
              </p>

              <!-- Grid Layout for Details -->
              <div class="workshop-box">
                <table cellpadding="0" cellspacing="0">
                  <tr class="workshop-row">
                    <td class="workshop-cell" colspan="2">
                      <span class="label">Workshop</span>
                      <span class="value" style="font-size: 18px;">${workshopTitle}</span>
                    </td>
                  </tr>
                  <tr class="workshop-row">
                    <td class="workshop-cell" style="border-right: 1px solid #333333;">
                      <span class="label">Date</span>
                      <span class="value">${formattedDate}</span>
                    </td>
                    <td class="workshop-cell">
                      <span class="label">Time</span>
                      <span class="value">${workshopTime}</span>
                    </td>
                  </tr>
                  <tr class="workshop-row">
                    <td class="workshop-cell" colspan="2">
                      <span class="label">Location</span>
                      <span class="value">${workshopLocation}</span>
                    </td>
                  </tr>
                  <tr class="workshop-row">
                     <td class="workshop-cell" colspan="2">
                      <span class="label">Your Seats</span>
                      <span class="value">${seats}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Refund Section -->
              <div class="refund-box">
                <h3 class="refund-title">Refund Protocol</h3>
                <p class="text-body" style="margin-bottom: 0;">
                  A full refund has been initiated to your original payment method.<br><br>
                  <span style="color: #ffffff;">• Card:</span> 5-7 Days<br>
                  <span style="color: #ffffff;">• UPI:</span> 3-5 Days
                </p>
              </div>

              <p class="text-body">
                We encourage you to maintain your momentum. View our calendar for alternative sessions.
              </p>

              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/workshops" class="cta-button">
                View Schedule →
              </a>
              
              <div style="margin-top: 30px; border-top: 1px solid #333333; padding-top: 20px;">
                 <span class="label">Support</span>
                 <p class="text-body" style="margin: 5px 0;">${process.env.GMAIL_USER}</p>
              </div>

            </div>

            <!-- Footer -->
            <div class="footer">
              <p>Eustress Performance Engineering<br>Bangalore, India</p>
              <p>Registration: ${userEmail}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
CANCELLATION NOTICE

ATTENTION ${userName || "Participant"},

WE HAVE CANCELED THIS SESSION: ${workshopTitle}

DETAILS:
Date: ${formattedDate}
Time: ${workshopTime}
Location: ${workshopLocation}

REFUND PROTOCOL:
A full refund has been initiated to your original payment method.
- Card: 5-7 Days
- UPI: 3-5 Days

We apologize for the disruption.

VIEW SCHEDULE:
${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/workshops

Support: ${process.env.GMAIL_USER}

EUSTRESS PERFORMANCE.
    `,
  }
}

export async function POST(request: NextRequest) {
  console.log("🚀 POST /api/admin/cancel-workshop called")
  
  try {
    const body = await request.json()
    const { workshopId } = body

    if (!workshopId) {
      return NextResponse.json({ error: "Workshop ID is required" }, { status: 400 })
    }

    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      include: {
        Registration: {
          where: { paid: true, paymentStatus: "completed" },
          include: { User: true }
        }
      }
    })

    if (!workshop) {
      return NextResponse.json({ error: "Workshop not found" }, { status: 404 })
    }

    // --- DELETION LOGIC START ---
    // 1. Delete all registrations first to avoid foreign key constraint errors
    await prisma.registration.deleteMany({
      where: { workshopId: workshopId }
    })

    // 2. Delete the workshop itself
    await prisma.workshop.delete({
      where: { id: workshopId }
    })
    
    console.log(`✅ Workshop ${workshopId} and its registrations have been deleted.`)
    // --- DELETION LOGIC END ---

    if (workshop.Registration.length === 0) {
      return NextResponse.json({
        message: "Workshop canceled and deleted successfully (no registrations)",
        successful: 0,
        total: 0,
        workshopTitle: workshop.title,
      })
    }

    // Send emails using the fetched data (since DB records are now gone)
    const emailPromises = workshop.Registration.map(async (registration) => {
      const emailContent = generateCancellationEmail(
        registration.User.name || registration.User.email,
        workshop.title,
        workshop.date,
        workshop.time,
        workshop.location,
        registration.seats,
        registration.User.email
      )

      try {
        await transporter.sendMail({
          from: `"Eustress Team" <${process.env.GMAIL_USER}>`,
          to: registration.User.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        })
        return { success: true, email: registration.User.email }
      } catch (error) {
        return { success: false, email: registration.User.email, error: error }
      }
    })

    const results = await Promise.all(emailPromises)
    const successful = results.filter((r) => r.success).length

    return NextResponse.json({
      message: `Workshop deleted and cancellations sent`,
      successful,
      total: workshop.Registration.length,
      workshopTitle: workshop.title,
    })
  } catch (error) {
    console.error("❌ Error canceling workshop:", error)
    return NextResponse.json(
      { error: "Failed to cancel workshop", details: error },
      { status: 500 }
    )
  }
}