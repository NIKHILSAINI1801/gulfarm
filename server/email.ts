import nodemailer from 'nodemailer';

export interface EnquiryEmailPayload {
  referenceCode: string;
  type: string;
  shopName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  city: string;
  state: string;
  gstNumber?: string;
  totalQuantity: number;
  customLabel: boolean;
  notes?: string;
  items: Array<{
    productName: string;
    colour: string;
    quantity: number;
    sizeSplit: Record<string, number>;
  }>;
}

export async function sendEnquiryNotifications(payload: EnquiryEmailPayload): Promise<void> {
  const notifyTo = process.env.NOTIFY_EMAIL || process.env.ADMIN_EMAIL || '';
  const subject = `[MAGESTIC THREADs] New B2B ${payload.type.toUpperCase()} (${payload.referenceCode}) - ${payload.shopName}`;
  const itemsText =
    payload.items.length > 0
      ? payload.items
          .map(
            (i) =>
              `- ${i.productName} (${i.colour}) x ${i.quantity} pcs | Sizes: ${JSON.stringify(i.sizeSplit)}`
          )
          .join('\n')
      : 'General wholesale enquiry (no individual designs attached)';

  const textBody = [
    `Reference: ${payload.referenceCode}`,
    `Type: ${payload.type}`,
    `Shop Name: ${payload.shopName}`,
    `Contact: ${payload.contactPerson}`,
    `Phone / WhatsApp: ${payload.phone}`,
    `Email: ${payload.email || 'Not provided'}`,
    `Location: ${payload.city}, ${payload.state}`,
    `GSTIN: ${payload.gstNumber || 'Not provided'}`,
    `Total Quantity: ${payload.totalQuantity} pcs`,
    `Private Label / Customisation: ${payload.customLabel ? 'Yes' : 'No'}`,
    `Notes: ${payload.notes || 'None'}`,
    '',
    'Selected Designs:',
    itemsText,
  ].join('\n');

  // Option 1: Resend API
  if (process.env.RESEND_API_KEY && notifyTo) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'MAGESTIC THREADs <enquiries@magesticthreads.in>',
          to: [notifyTo],
          subject,
          text: textBody,
        }),
      });
      if (payload.email) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'MAGESTIC THREADs <enquiries@magesticthreads.in>',
            to: [payload.email],
            subject: `Wholesale Enquiry Received (${payload.referenceCode}) — MAGESTIC THREADs`,
            text: `Dear ${payload.contactPerson},\n\nThank you for your wholesale enquiry for ${payload.shopName}. Your reference is ${payload.referenceCode}. Our Seelampur wholesale desk will send price slabs and availability within 4 business hours.\n\nSelected summary:\n${itemsText}`,
          }),
        });
      }
      return;
    } catch (err) {
      console.error('Resend notification failed, falling back to log:', err);
    }
  }

  // Option 2: Nodemailer SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && notifyTo) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT || 587) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: notifyTo,
        subject,
        text: textBody,
      });
      if (payload.email) {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: payload.email,
          subject: `Wholesale Enquiry Received (${payload.referenceCode}) — MAGESTIC THREADs`,
          text: `Dear ${payload.contactPerson},\n\nYour wholesale enquiry (${payload.referenceCode}) has been received by MAGESTIC THREADs, Seelampur, Delhi. Our desk will respond with wholesale slabs shortly.`,
        });
      }
      return;
    } catch (err) {
      console.error('SMTP notification failed, falling back to log:', err);
    }
  }

  // Option 3: Structured console log fallback in dev
  console.info(`[EMAIL FALLBACK] ${subject}\n${textBody}`);
}
