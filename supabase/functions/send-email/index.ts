// Email Notification Edge Function
// Sends transactional emails for appointments

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'ishflow <bildirim@ishflow.ai>'

interface EmailPayload {
  type: 'appointment_created' | 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_reminder'
  to: string
  data: {
    customerName?: string
    businessName?: string
    serviceName?: string
    date?: string
    time?: string
    price?: number
    address?: string
    phone?: string
  }
}

const templates = {
  appointment_created: (data: EmailPayload['data']) => ({
    subject: `Randevu Talebiniz Alındı - ${data.businessName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 24px; font-weight: 700; color: #6366f1; }
    .card { background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    .title { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
    .subtitle { color: #64748b; margin-bottom: 24px; }
    .detail { display: flex; margin-bottom: 12px; }
    .detail-label { color: #64748b; width: 100px; }
    .detail-value { font-weight: 500; }
    .status { display: inline-block; padding: 6px 12px; background: #fef3c7; color: #d97706; border-radius: 20px; font-size: 14px; font-weight: 500; }
    .footer { text-align: center; color: #94a3b8; font-size: 14px; margin-top: 32px; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ishflow</div>
    </div>
    
    <h1 class="title">Randevu Talebiniz Alındı! 📅</h1>
    <p class="subtitle">Merhaba ${data.customerName}, randevu talebiniz işletmeye iletildi.</p>
    
    <div class="card">
      <div class="detail">
        <span class="detail-label">İşletme</span>
        <span class="detail-value">${data.businessName}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Hizmet</span>
        <span class="detail-value">${data.serviceName}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Tarih</span>
        <span class="detail-value">${data.date}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Saat</span>
        <span class="detail-value">${data.time}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Ücret</span>
        <span class="detail-value">₺${data.price}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Durum</span>
        <span class="status">Onay Bekliyor</span>
      </div>
    </div>
    
    <p>İşletme randevunuzu onayladığında size bildirim göndereceğiz.</p>
    
    <div class="footer">
      <p>Bu e-posta ishflow.ai tarafından gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  appointment_confirmed: (data: EmailPayload['data']) => ({
    subject: `Randevunuz Onaylandı! ✅ - ${data.businessName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 24px; font-weight: 700; color: #6366f1; }
    .card { background: #f0fdf4; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #bbf7d0; }
    .title { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #166534; }
    .subtitle { color: #64748b; margin-bottom: 24px; }
    .detail { display: flex; margin-bottom: 12px; }
    .detail-label { color: #64748b; width: 100px; }
    .detail-value { font-weight: 500; }
    .status { display: inline-block; padding: 6px 12px; background: #dcfce7; color: #166534; border-radius: 20px; font-size: 14px; font-weight: 500; }
    .address-card { background: #f8fafc; border-radius: 12px; padding: 16px; margin-top: 16px; }
    .footer { text-align: center; color: #94a3b8; font-size: 14px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ishflow</div>
    </div>
    
    <div class="card">
      <h1 class="title">✅ Randevunuz Onaylandı!</h1>
    </div>
    
    <p class="subtitle">Merhaba ${data.customerName}, randevunuz onaylandı. Sizi bekliyoruz!</p>
    
    <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <div class="detail">
        <span class="detail-label">İşletme</span>
        <span class="detail-value">${data.businessName}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Hizmet</span>
        <span class="detail-value">${data.serviceName}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Tarih</span>
        <span class="detail-value">${data.date}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Saat</span>
        <span class="detail-value">${data.time}</span>
      </div>
      ${data.address ? `
      <div class="address-card">
        <strong>📍 Adres</strong><br>
        ${data.address}
      </div>
      ` : ''}
      ${data.phone ? `
      <div style="margin-top: 12px;">
        <strong>📞 Telefon:</strong> ${data.phone}
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p>Görüşmek üzere! 👋</p>
      <p>Bu e-posta ishflow.ai tarafından gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  appointment_cancelled: (data: EmailPayload['data']) => ({
    subject: `Randevunuz İptal Edildi - ${data.businessName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 24px; font-weight: 700; color: #6366f1; }
    .card { background: #fef2f2; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #fecaca; }
    .title { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #dc2626; }
    .subtitle { color: #64748b; margin-bottom: 24px; }
    .detail { display: flex; margin-bottom: 12px; }
    .detail-label { color: #64748b; width: 100px; }
    .detail-value { font-weight: 500; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; margin-top: 16px; }
    .footer { text-align: center; color: #94a3b8; font-size: 14px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ishflow</div>
    </div>
    
    <div class="card">
      <h1 class="title">❌ Randevunuz İptal Edildi</h1>
    </div>
    
    <p class="subtitle">Merhaba ${data.customerName}, aşağıdaki randevunuz iptal edilmiştir.</p>
    
    <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <div class="detail">
        <span class="detail-label">İşletme</span>
        <span class="detail-value">${data.businessName}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Hizmet</span>
        <span class="detail-value">${data.serviceName}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Tarih</span>
        <span class="detail-value">${data.date}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Saat</span>
        <span class="detail-value">${data.time}</span>
      </div>
    </div>
    
    <p>Yeni bir randevu almak için aşağıdaki butona tıklayabilirsiniz.</p>
    
    <a href="https://ishflow.ai/search" class="btn">Yeni Randevu Al</a>
    
    <div class="footer">
      <p>Bu e-posta ishflow.ai tarafından gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  appointment_reminder: (data: EmailPayload['data']) => ({
    subject: `⏰ Hatırlatma: Yarın Randevunuz Var - ${data.businessName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 24px; font-weight: 700; color: #6366f1; }
    .card { background: #f0f4ff; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #e0e7ff; }
    .title { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #6366f1; }
    .subtitle { color: #64748b; margin-bottom: 24px; }
    .detail { display: flex; margin-bottom: 12px; }
    .detail-label { color: #64748b; width: 100px; }
    .detail-value { font-weight: 500; }
    .address-card { background: #f8fafc; border-radius: 12px; padding: 16px; margin-top: 16px; }
    .footer { text-align: center; color: #94a3b8; font-size: 14px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ishflow</div>
    </div>
    
    <div class="card">
      <h1 class="title">⏰ Randevu Hatırlatması</h1>
      <p style="margin: 0; color: #4f46e5;">Yarın randevunuz var, unutmayın!</p>
    </div>
    
    <p class="subtitle">Merhaba ${data.customerName}, yarınki randevunuzu hatırlatmak istedik.</p>
    
    <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <div class="detail">
        <span class="detail-label">İşletme</span>
        <span class="detail-value">${data.businessName}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Hizmet</span>
        <span class="detail-value">${data.serviceName}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Tarih</span>
        <span class="detail-value">${data.date}</span>
      </div>
      <div class="detail">
        <span class="detail-label">Saat</span>
        <span class="detail-value">${data.time}</span>
      </div>
      ${data.address ? `
      <div class="address-card">
        <strong>📍 Adres</strong><br>
        ${data.address}
      </div>
      ` : ''}
      ${data.phone ? `
      <div style="margin-top: 12px;">
        <strong>📞 Telefon:</strong> ${data.phone}
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p>Görüşmek üzere! 👋</p>
      <p>Bu e-posta ishflow.ai tarafından gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>
    `,
  }),
}

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }),
  })
  return response.json()
}

serve(async (req) => {
  try {
    // CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    
    // Support both direct call and webhook format
    // Webhook format: { type: 'INSERT', table: 'email_queue', record: {...} }
    // Direct format: { to, type, data }
    let to: string
    let type: string
    let data: any
    
    if (body.type === 'INSERT' && body.record) {
      // Database webhook format
      to = body.record.to_email
      type = body.record.template
      data = body.record.data
    } else if (body.to_email && body.template) {
      // Queue record format (from pg_net)
      to = body.to_email
      type = body.template
      data = body.data
    } else {
      // Direct call format
      to = body.to
      type = body.type
      data = body.data
    }

    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing to or type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const template = templates[type as keyof typeof templates]
    if (!template) {
      return new Response(
        JSON.stringify({ error: `Invalid email type: ${type}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { subject, html } = template(data)
    const result = await sendEmail(to, subject, html)

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
