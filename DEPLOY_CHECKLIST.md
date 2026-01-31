# ishflow.ai Deploy Checklist

## 🗄️ Supabase Migrations (Önce yapılmalı)

Supabase Dashboard > SQL Editor'da çalıştır:

### 1. Customer Favorites Table
```sql
-- supabase/migrations/002_customer_favorites.sql içeriğini kopyala-yapıştır
```

### 2. Telegram Integration Tables
```sql
-- supabase/migrations/003_telegram_integration.sql içeriğini kopyala-yapıştır
```

## 🤖 Telegram Bot Kurulumu

1. **BotFather'dan bot oluştur:**
   - Telegram'da @BotFather'a git
   - `/newbot` komutunu gönder
   - Bot adı: `ishflow Bildirim` (veya istediğin)
   - Bot username: `ishflow_bot` (veya benzeri)
   - Token'ı kaydet!

2. **Supabase Edge Functions deploy:**
   ```bash
   cd supabase
   supabase functions deploy telegram-notify
   supabase functions deploy telegram-webhook
   ```

3. **Environment variables (Supabase Dashboard > Edge Functions > Secrets):**
   - `TELEGRAM_BOT_TOKEN`: BotFather'dan aldığın token

4. **Webhook ayarla:**
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=<SUPABASE_FUNCTIONS_URL>/telegram-webhook
   ```

## 🚀 Netlify Deploy

1. **Netlify login:**
   ```bash
   netlify login
   ```

2. **Site oluştur ve deploy:**
   ```bash
   netlify init
   netlify deploy --prod
   ```

3. **Domain bağla (opsiyonel):**
   - Netlify Dashboard > Domain Management
   - Custom domain ekle: ishflow.ai

## ✅ Test Checklist

- [ ] Partner kayıt/login çalışıyor
- [ ] Müşteri kayıt/login çalışıyor
- [ ] Randevu oluşturma çalışıyor
- [ ] Favorilere ekleme çalışıyor
- [ ] Telegram bağlantısı çalışıyor
- [ ] Bildirimler geliyor
- [ ] Mobile responsive

## 📝 Environment Variables

### Netlify'da ekle:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anon key

---
Son güncelleme: 31 Ocak 2026
