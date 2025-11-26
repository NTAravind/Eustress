// app/api/admin/send-reminder/route.ts
import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import prisma from "@/lib/prisma"

console.log("✅ send-reminder route.ts file loaded")

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Email template for workshop reminder
function generateReminderEmail(
  userName: string,
  workshopTitle: string,
  workshopDate: Date,
  workshopTime: string,
  workshopLocation: string,
  seats: number
) {
  const formattedDate = new Date(workshopDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return {
    subject: `REMINDER: ${workshopTitle}`,
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
            .badge { background: #ffffff; color: #000000; padding: 4px 8px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; display: inline-block; margin-top: 15px; }
            
            .content { padding: 40px 30px; }
            .hero-text { font-size: 42px; font-weight: 900; text-transform: uppercase; line-height: 0.9; color: #ffffff; margin: 0 0 20px 0; letter-spacing: -2px; }
            .intro { color: #a3a3a3; font-size: 16px; margin-bottom: 40px; font-weight: 300; }
            
            /* Data Grid */
            .grid-box { border: 1px solid #333333; margin-bottom: 30px; }
            .grid-row { border-bottom: 1px solid #333333; }
            .grid-row:last-child { border-bottom: none; }
            .grid-cell { padding: 15px; width: 50%; vertical-align: top; border-right: 1px solid #333333; }
            .grid-cell:last-child { border-right: none; }
            
            .label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #525252; font-weight: bold; display: block; margin-bottom: 5px; }
            .value { font-size: 14px; color: #ffffff; font-weight: bold; text-transform: uppercase; }
            
            /* Checklist Box */
            .checklist-box { border: 1px solid #dc2626; background-color: #1a0505; padding: 20px; margin-bottom: 30px; }
            .checklist-title { color: #dc2626; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 15px 0; letter-spacing: 2px; }
            .checklist-item { color: #ffffff; font-size: 14px; padding: 5px 0; border-bottom: 1px solid #330000; }
            .checklist-item:last-child { border-bottom: none; }

            .footer { border-top: 1px solid #333333; padding: 30px; text-align: center; color: #525252; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">EUSTRESS<span>.</span></div>
              <br>
              <span class="badge">Session Incoming</span>
            </div>

            <div class="content">
              <p class="label" style="margin-bottom: 10px;">Attention ${userName || "Athlete"}</p>
              <h1 class="hero-text">Prepare.<br>Execute.</h1>
              <p class="intro">Your scheduled session is approaching. Review your protocol details below.</p>
              
              <div class="grid-box">
                <table cellpadding="0" cellspacing="0">
                  <tr class="grid-row">
                    <td class="grid-cell" colspan="2" style="border-right: none;">
                      <span class="label">Workshop</span>
                      <span class="value" style="font-size: 18px;">${workshopTitle}</span>
                    </td>
                  </tr>
                  <tr class="grid-row">
                    <td class="grid-cell">
                      <span class="label">Date</span>
                      <span class="value">${formattedDate}</span>
                    </td>
                    <td class="grid-cell">
                      <span class="label">Time</span>
                      <span class="value">${workshopTime}</span>
                    </td>
                  </tr>
                  <tr class="grid-row">
                    <td class="grid-cell">
                      <span class="label">Location</span>
                      <span class="value">${workshopLocation}</span>
                    </td>
                    <td class="grid-cell">
                      <span class="label">Reservation</span>
                      <span class="value">${seats} Seats Confirmed</span>
                    </td>
                  </tr>
                </table>
              </div>

              <div class="checklist-box">
                <h3 class="checklist-title">Mandatory Gear</h3>
                <div class="checklist-item">Valid ID for Verification</div>
                <div class="checklist-item">Notebook & Pen for Protocol Notes</div>
                <div class="checklist-item">Proper Training Attire</div>
              </div>

              <p style="color: #a3a3a3; font-size: 12px;">
                Arrive 15 minutes early to complete check-in procedures.
              </p>

            </div>

            <div class="footer">
              <p>Train with purpose.<br>Recover smarter.</p>
              <p style="margin-top: 20px;">Eustress Performance Engineering</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
EUSTRESS.

SESSION INCOMING: ${workshopTitle}

PREPARE. EXECUTE.
Your scheduled session is approaching.

DETAILS:
Date: ${formattedDate}
Time: ${workshopTime}
Location: ${workshopLocation}
Reservation: ${seats} Seats

MANDATORY GEAR:
- Valid ID
- Notebook & Pen
- Training Attire

Arrive 15 minutes early for check-in.

EUSTRESS PERFORMANCE ENGINEERING.
    `,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workshopId, registrationIds, reminderType } = body

    // Validate input
    if (!workshopId) {
      return NextResponse.json(
        { error: "Workshop ID is required" },
        { status: 400 }
      )
    }

    // Fetch registrations based on the request
    let registrations
    if (registrationIds && registrationIds.length > 0) {
      // Send to specific registrations
      registrations = await prisma.registration.findMany({
        where: {
          id: { in: registrationIds },
          workshopId: workshopId,
        },
        include: {
          User: true,
          Workshop: true,
        },
      })
    } else {
      // Send to all paid registrations for this workshop
      registrations = await prisma.registration.findMany({
        where: {
          workshopId: workshopId,
          paid: true,
          paymentStatus: "completed",
        },
        include: {
          User: true,
          Workshop: true,
        },
      })
    }

    if (registrations.length === 0) {
      return NextResponse.json(
        { error: "No registrations found" },
        { status: 404 }
      )
    }

    // Send emails
    const emailPromises = registrations.map(async (registration) => {
      const emailContent = generateReminderEmail(
        registration.User.name || registration.User.email,
        registration.Workshop.title,
        registration.Workshop.date,
        registration.Workshop.time,
        registration.Workshop.location,
        registration.seats
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
        console.error(`Failed to send email to ${registration.User.email}:`, error)
        return { success: false, email: registration.User.email, error: error }
      }
    })

    const results = await Promise.all(emailPromises)
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success)

    return NextResponse.json({
      message: `Emails sent successfully to ${successful} out of ${registrations.length} recipients`,
      successful,
      total: registrations.length,
      failed: failed.length > 0 ? failed : undefined,
    })
  } catch (error) {
    console.error("Error sending reminder emails:", error)
    return NextResponse.json(
      { error: "Failed to send reminder emails", details: error },
      { status: 500 }
    )
  }
}