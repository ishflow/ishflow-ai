// Telegram Bot Webhook Handler
// Handles incoming messages from Telegram users

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!)

interface TelegramUpdate {
  message?: {
    chat: { id: number }
    text?: string
    from?: { first_name?: string; username?: string }
  }
}

async function sendMessage(chatId: number, text: string, options: any = {}) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      ...options,
    }),
  })
}

async function handleStart(chatId: number, firstName?: string) {
  const welcomeText = `
👋 Merhaba${firstName ? ` ${firstName}` : ''}!

*ishflow.ai* bildirim botuna hoş geldiniz!

🔔 Bu bot ile:
• Yeni randevu bildirimleri
• Randevu onay/iptal bildirimleri  
• Randevu hatırlatmaları

alabilirsiniz.

📱 *Hesabınızı bağlamak için:*
1. ishflow.ai'ye giriş yapın
2. Ayarlar > Telegram Bildirimleri
3. "Telegram Bağla" butonuna tıklayın
4. Size verilen kodu buraya gönderin

Örnek: \`/baglanti ABC123\`
`
  await sendMessage(chatId, welcomeText)
}

async function handleLink(chatId: number, code: string) {
  if (!code) {
    await sendMessage(chatId, '❌ Lütfen bağlantı kodunu girin.\n\nÖrnek: `/baglanti ABC123`')
    return
  }

  // Find verification record
  const { data: verification, error } = await supabase
    .from('telegram_verifications')
    .select('*')
    .eq('verification_code', code.toUpperCase())
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !verification) {
    await sendMessage(chatId, '❌ Geçersiz veya süresi dolmuş kod. Lütfen yeni bir kod alın.')
    return
  }

  // Update notification settings with telegram chat ID
  const { error: updateError } = await supabase
    .from('notification_settings')
    .upsert({
      user_id: verification.user_id,
      telegram_chat_id: chatId.toString(),
      user_type: 'partner', // Will be determined by the app
    })

  if (updateError) {
    await sendMessage(chatId, '❌ Bir hata oluştu. Lütfen tekrar deneyin.')
    return
  }

  // Delete verification record
  await supabase
    .from('telegram_verifications')
    .delete()
    .eq('id', verification.id)

  await sendMessage(chatId, `
✅ *Hesabınız başarıyla bağlandı!*

Artık randevu bildirimlerini bu chat'ten alacaksınız.

Bildirimleri yönetmek için ishflow.ai'deki Ayarlar sayfasını ziyaret edin.
`)
}

async function handleHelp(chatId: number) {
  const helpText = `
📚 *Komutlar:*

/start - Botu başlat
/baglanti [KOD] - Hesabınızı bağlayın
/durum - Bağlantı durumunu kontrol edin
/yardim - Bu mesajı göster

🔗 *Hesap Bağlama:*
ishflow.ai'de Ayarlar > Telegram bölümünden kod alıp buraya gönderin.

❓ *Sorun mu var?*
destek@ishflow.ai adresinden bize ulaşın.
`
  await sendMessage(chatId, helpText)
}

async function handleStatus(chatId: number) {
  const { data: settings } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('telegram_chat_id', chatId.toString())
    .single()

  if (!settings) {
    await sendMessage(chatId, '❌ Bu Telegram hesabı henüz bir ishflow hesabına bağlı değil.\n\n/start yazarak nasıl bağlayacağınızı öğrenin.')
    return
  }

  await sendMessage(chatId, `
✅ *Hesabınız bağlı!*

📬 Bildirim Ayarları:
• Yeni randevu: ${settings.notify_new_appointment ? '✅' : '❌'}
• Onay/İptal: ${settings.notify_appointment_confirmed ? '✅' : '❌'}
• Hatırlatma: ${settings.notify_appointment_reminder ? '✅' : '❌'}

Ayarları değiştirmek için ishflow.ai'yi ziyaret edin.
`)
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('OK', { status: 200 })
    }

    const update: TelegramUpdate = await req.json()
    
    if (!update.message?.text) {
      return new Response('OK', { status: 200 })
    }

    const chatId = update.message.chat.id
    const text = update.message.text.trim()
    const firstName = update.message.from?.first_name

    // Parse command
    const [command, ...args] = text.split(' ')

    switch (command.toLowerCase()) {
      case '/start':
        await handleStart(chatId, firstName)
        break
      case '/baglanti':
      case '/bagla':
      case '/link':
        await handleLink(chatId, args.join(''))
        break
      case '/durum':
      case '/status':
        await handleStatus(chatId)
        break
      case '/yardim':
      case '/help':
        await handleHelp(chatId)
        break
      default:
        // Check if it looks like a verification code
        if (/^[A-Z0-9]{6}$/i.test(text)) {
          await handleLink(chatId, text)
        } else {
          await sendMessage(chatId, 'Komutu anlamadım. /yardim yazarak kullanılabilir komutları görebilirsiniz.')
        }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Error', { status: 500 })
  }
})
