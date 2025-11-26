// app/api/admin/notify-new-workshop/route.ts
import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import prisma from "@/lib/prisma"

console.log("✅ notify-new-workshop route.ts file loaded")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Email template for new workshop
function generateNewWorkshopEmail(
  userName: string,
  workshopTitle: string,
  workshopDescription: string,
  workshopDate: Date,
  workshopTime: string,
  workshopLocation: string,
  workshopPrice: number,
  workshopDiscount: number,
  workshopId: string,
  availableSeats: number
) {
  const formattedDate = new Date(workshopDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const finalPrice = workshopPrice - (workshopPrice * workshopDiscount) / 100
  const registrationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/workshops/${workshopId}`

  return {
    subject: `NEW WORKSHOP: ${workshopTitle}`,
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
            .badge { border: 1px solid #dc2626; color: #dc2626; padding: 4px 8px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; display: inline-block; margin-top: 15px; }
            
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
            .value-highlight { color: #dc2626; }
            
            /* Description Box */
            .desc-box { background-color: #0a0a0a; padding: 20px; border-left: 2px solid #dc2626; margin-bottom: 30px; }
            .desc-text { color: #d4d4d4; font-size: 14px; line-height: 1.6; margin: 0; }

            /* Price Section */
            .price-container { text-align: center; margin: 30px 0; padding: 20px; border: 1px solid #333333; }
            .price-main { font-size: 36px; font-weight: 900; color: #ffffff; display: block; line-height: 1; }
            .price-original { font-size: 14px; color: #525252; text-decoration: line-through; display: block; margin-top: 5px; }
            
            /* CTA */
            .cta-button { display: block; background-color: #dc2626; color: #ffffff; padding: 18px 0; text-align: center; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; font-size: 14px; border: 0; transition: background 0.2s; }
            .cta-button:hover { background-color: #b91c1c; }
            
            .footer { border-top: 1px solid #333333; padding: 30px; text-align: center; color: #525252; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
            .footer a { color: #525252; text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">EUSTRESS<span>.</span></div>
              <br>
              <span class="badge">New Protocol Available</span>
            </div>

            <div class="content">
              <p class="label" style="margin-bottom: 10px;">Hello ${userName || "Athlete"}</p>
              <h1 class="hero-text">Push<br>Limits.</h1>
              <p class="intro">A new training opportunity has opened. Optimize your motion and performance.</p>
              
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
                      <span class="label">Capacity</span>
                      <span class="value ${availableSeats <= 5 ? 'value-highlight' : ''}">${availableSeats} Seats Left</span>
                    </td>
                  </tr>
                </table>
              </div>

              <div class="desc-box">
                <p class="desc-text">${workshopDescription}</p>
              </div>

              <div class="price-container">
                <span class="label">Registration Fee</span>
                <span class="price-main">
                  ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(finalPrice)}
                </span>
                ${workshopDiscount > 0 ? `
                  <span class="price-original">
                    ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(workshopPrice)}
                  </span>
                ` : ''}
              </div>

              <a href="${registrationUrl}" class="cta-button">
                Secure Your Spot
              </a>

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

NEW PROTOCOL AVAILABLE: ${workshopTitle}

PUSH LIMITS.
A new training opportunity has opened.

DETAILS:
Date: ${formattedDate}
Time: ${workshopTime}
Location: ${workshopLocation}
Capacity: ${availableSeats} Seats

BRIEF:
${workshopDescription}

FEE: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(finalPrice)}

SECURE YOUR SPOT:
${registrationUrl}

EUSTRESS PERFORMANCE ENGINEERING.
    `,
  }
}

export async function POST(request: NextRequest) {
  console.log("🚀 POST /api/admin/notify-new-workshop called")

  try {
    const body = await request.json()
    const { workshopId } = body

    if (!workshopId) return NextResponse.json({ error: "Workshop ID required" }, { status: 400 })

    const workshop = await prisma.workshop.findUnique({ where: { id: workshopId } })
    if (!workshop) return NextResponse.json({ error: "Workshop not found" }, { status: 404 })

    const users = await prisma.user.findMany({ select: { email: true, name: true } })
    if (users.length === 0) return NextResponse.json({ error: "No users found" }, { status: 404 })

    const emailPromises = users.map(async (user) => {
      const emailContent = generateNewWorkshopEmail(
        user.name || user.email,
        workshop.title,
        workshop.description,
        workshop.date,
        workshop.time,
        workshop.location,
        workshop.price,
        workshop.discount,
        workshop.id,
        workshop.availableSeats
      )

      try {
        await transporter.sendMail({
          from: `"Eustress Team" <${process.env.GMAIL_USER}>`,
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        })
        return { success: true, email: user.email }
      } catch (error) {
        return { success: false, email: user.email, error: error }
      }
    })

    const results = await Promise.all(emailPromises)
    const successful = results.filter((r) => r.success).length

    return NextResponse.json({
      message: `Notifications sent to ${successful}/${users.length} users`,
      successful,
      total: users.length,
      workshopTitle: workshop.title,
    })
  } catch (error) {
    console.error("❌ Error sending notifications:", error)
    return NextResponse.json(
      { error: "Failed to send notifications", details: error },
      { status: 500 }
    )
  }
}