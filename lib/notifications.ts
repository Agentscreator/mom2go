import nodemailer from 'nodemailer'

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})


export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}


export async function sendEmail(options: EmailOptions) {
  try {
    if (!process.env.SMTP_HOST) {
      console.log('Email not configured, skipping:', options.subject)
      return { success: false, error: 'Email not configured' }
    }

    const result = await emailTransporter.sendMail({
      from: `"Moms-2GO" <${process.env.SMTP_FROM || 'noreply@moms2go.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}


// Email templates
export const emailTemplates = {
  rideBooked: (data: { passengerName: string; pickupAddress: string; destinationAddress: string; scheduledTime: string; fareAmount: string }) => ({
    subject: 'Ride Confirmed - Moms-2GO',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Ride Confirmed</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0070f3, #0051cc); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .ride-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { background: #0070f3; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Ride Confirmed!</h1>
              <p>Your safe journey is scheduled</p>
            </div>
            <div class="content">
              <p>Dear ${data.passengerName},</p>
              <p>Your ride with Moms-2GO has been confirmed. Our certified drivers will ensure your safe and comfortable journey.</p>
              
              <div class="ride-details">
                <h3>Ride Details</h3>
                <p><strong>From:</strong> ${data.pickupAddress}</p>
                <p><strong>To:</strong> ${data.destinationAddress}</p>
                <p><strong>Scheduled Time:</strong> ${new Date(data.scheduledTime).toLocaleString()}</p>
                <p><strong>Estimated Fare:</strong> $${data.fareAmount}</p>
              </div>

              <p>We'll notify you once a driver accepts your ride. You can track your ride in real-time through our app.</p>
              
              <p><strong>Emergency Contact:</strong> (555) 911-MOMS</p>
              
              <p>Thank you for choosing Moms-2GO for your safe transportation needs.</p>
            </div>
            <div class="footer">
              <p>Moms-2GO - Safe rides for life's precious moments</p>
              <p>Available 24/7 for your peace of mind</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Ride Confirmed - Moms-2GO\n\nDear ${data.passengerName},\n\nYour ride has been confirmed:\nFrom: ${data.pickupAddress}\nTo: ${data.destinationAddress}\nTime: ${new Date(data.scheduledTime).toLocaleString()}\nFare: $${data.fareAmount}\n\nEmergency: (555) 911-MOMS\n\nThank you for choosing Moms-2GO!`
  }),

  rideAccepted: (data: { passengerName: string; driverName: string; vehicleInfo: string; eta: string }) => ({
    subject: 'Driver On The Way - Moms-2GO',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Driver On The Way</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .driver-info { background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Driver On The Way!</h1>
              <p>Your certified driver is coming to pick you up</p>
            </div>
            <div class="content">
              <p>Dear ${data.passengerName},</p>
              <p>Great news! Your ride has been accepted and your driver is on the way.</p>
              
              <div class="driver-info">
                <h3>Your Driver</h3>
                <p><strong>Driver:</strong> ${data.driverName}</p>
                <p><strong>Vehicle:</strong> ${data.vehicleInfo}</p>
                <p><strong>Estimated Arrival:</strong> ${data.eta}</p>
              </div>

              <p>Your driver will contact you when they arrive. Please be ready at your pickup location.</p>
              
              <p><strong>For any issues, call:</strong> (555) 123-MOMS</p>
              <p><strong>Emergency:</strong> (555) 911-MOMS</p>
            </div>
            <div class="footer">
              <p>Moms-2GO - Safe rides for life's precious moments</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Driver On The Way!\n\nDear ${data.passengerName},\n\nYour driver ${data.driverName} is on the way in a ${data.vehicleInfo}.\nETA: ${data.eta}\n\nSupport: (555) 123-MOMS\nEmergency: (555) 911-MOMS`
  }),

  driverApplication: (data: { driverName: string; email: string }) => ({
    subject: 'Driver Application Received - Moms-2GO',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Driver Application Received</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .info-box { background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Received!</h1>
              <p>Thank you for applying to be a Moms-2GO driver</p>
            </div>
            <div class="content">
              <p>Dear ${data.driverName},</p>
              <p>Thank you for your interest in joining the Moms-2GO family as a certified driver.</p>
              
              <div class="info-box">
                <h3>Next Steps</h3>
                <p>1. <strong>Background Check:</strong> We'll verify your driving record and conduct a comprehensive background check.</p>
                <p>2. <strong>Vehicle Inspection:</strong> Your vehicle will be inspected for safety and cleanliness standards.</p>
                <p>3. <strong>Training:</strong> Complete our specialized maternal care and CPR certification training.</p>
                <p>4. <strong>Approval:</strong> Once all requirements are met, you'll be approved to start accepting rides.</p>
              </div>

              <p>The approval process typically takes 3-5 business days. We'll keep you updated throughout the process.</p>
              
              <p>If you have any questions, please contact our driver support team at drivers@moms2go.com or call (555) 123-MOMS.</p>
              
              <p>We look forward to welcoming you to our team of dedicated professionals!</p>
            </div>
            <div class="footer">
              <p>Moms-2GO Driver Support</p>
              <p>Building trust through safe, reliable service</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Driver Application Received!\n\nDear ${data.driverName},\n\nThank you for applying to be a Moms-2GO driver. Your application is being reviewed.\n\nNext steps:\n1. Background check\n2. Vehicle inspection\n3. Training completion\n4. Final approval\n\nTimeline: 3-5 business days\n\nQuestions? Contact drivers@moms2go.com or (555) 123-MOMS`
  })
}

