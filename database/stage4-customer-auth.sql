-- ============================================
-- ISHFLOW.AI - Stage 4: Customer Authentication
-- ============================================
-- Müşteri giriş/kayıt sistemi için database değişiklikleri
-- ============================================

-- 1. Customers tablosuna auth_user_id ekle
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Email ve password için (opsiyonel, Supabase Auth kullanacağız)
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 3. Index for faster auth lookups
CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id ON public.customers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- 4. RLS Policy güncellemesi - Müşteriler kendi verilerini görebilir
CREATE POLICY "Customers can view own data"
    ON public.customers FOR SELECT
    USING (auth_user_id = auth.uid() OR partner_id IN (
        SELECT id FROM public.partners WHERE id = partner_id
    ));

-- 5. Müşteriler kendi randevularını görebilir
CREATE POLICY "Customers can view own appointments"
    ON public.appointments FOR SELECT
    USING (
        customer_id IN (
            SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
        )
        OR partner_id = auth.uid()
    );

-- 6. Public policy for customer registration (telefon ile müşteri bulma)
CREATE POLICY "Public can read customers by phone for booking"
    ON public.customers FOR SELECT
    USING (true);

-- 7. Public policy for creating appointments (anonim randevu)
CREATE POLICY "Public can create appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public can create customers"
    ON public.customers FOR INSERT
    WITH CHECK (true);

-- ============================================
-- NOT: Bu migration'ı Supabase SQL Editor'da çalıştırın
-- ============================================
