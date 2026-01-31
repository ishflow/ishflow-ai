// Telegram Notification Edge Function
// This function sends notifications to users via Telegram

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

interface NotificationPayload {
  type: 'new_appointment' | 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_reminder'
  chatId: string
  data: {
    customerName?: string
    businessName?: string
    serviceName?: string
    date?: string
    time?: string
    price?: number
  }
}

const templates = {
  new_appointment: (data: NotificationPayload['data']) => `
🆕 *Yeni Randevu!*

👤 Müşteri: ${data.customerName}
💇 Hizmet: ${data.serviceName}
📅 Tarih: ${data.date}
⏰ Saat: ${data.time}
💰 Ücret: ₺${data.price}

Randevuyu onaylamak için panele gidin.
`,

  appointment_confirmed: (data: NotificationPayload['data']) => `
✅ *Randevunuz Onaylandı!*

🏪 İşletme: ${data.businessName}
💇 Hizmet: ${data.serviceName}
📅 Tarih: ${data.date}
⏰ Saat: ${data.time}

Görüşmek üzere! 👋
`,

  appointment_cancelled: (data: NotificationPayload['data']) => `
❌ *Randevu İptal Edildi*

🏪 İşletme: ${data.businessName}
💇 Hizmet: ${data.serviceName}
📅 Tarih: ${data.date}

Yeni randevu almak için uygulamayı ziyaret edin.
`,

  appointment_reminder: (data: NotificationPayload['data']) => `
⏰ *Randevu Hatırlatması*

Yarın randevunuz var!

🏪 İşletme: ${data.businessName}
💇 Hizmet: ${data.serviceName}
📅 Tarih: ${data.date}
⏰ Saat: ${data.time}

Görüşmek üzere! 🙌
`,
}

async function sendTelegramMessage(chatId: string, text: string) {
  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
    }),
  })
  return response.json()
}

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    if (!TELEGRAM_BOT_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const payload: NotificationPayload = await req.json()
    
    if (!payload.chatId || !payload.type) {
      return new Response(
        JSON.stringify({ error: 'Missing chatId or type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const template = templates[payload.type]
    if (!template) {
      return new Response(
        JSON.stringify({ error: 'Invalid notification type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const message = template(payload.data)
    const result = await sendTelegramMessage(payload.chatId, message)

    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
