-- ============================================
-- ISHFLOW.AI - Stage 2: Core Business Tables
-- ============================================
-- Run this in Supabase SQL Editor
-- Requires: partners table from Stage 1
-- ============================================

-- ============================================
-- 1. SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster partner queries
CREATE INDEX IF NOT EXISTS idx_services_partner_id ON public.services(partner_id);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policy: Partners can only see their own services
CREATE POLICY "Partners can view own services"
    ON public.services FOR SELECT
    USING (partner_id = auth.uid());

CREATE POLICY "Partners can insert own services"
    ON public.services FOR INSERT
    WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can update own services"
    ON public.services FOR UPDATE
    USING (partner_id = auth.uid())
    WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can delete own services"
    ON public.services FOR DELETE
    USING (partner_id = auth.uid());

-- ============================================
-- 2. STAFF TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(100) DEFAULT 'staff',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_partner_id ON public.staff(partner_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);

-- Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Policy: Partners can only see their own staff
CREATE POLICY "Partners can view own staff"
    ON public.staff FOR SELECT
    USING (partner_id = auth.uid());

CREATE POLICY "Partners can insert own staff"
    ON public.staff FOR INSERT
    WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can update own staff"
    ON public.staff FOR UPDATE
    USING (partner_id = auth.uid())
    WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can delete own staff"
    ON public.staff FOR DELETE
    USING (partner_id = auth.uid());

-- ============================================
-- 3. CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_partner_id ON public.customers(partner_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policy: Partners can only see their own customers
CREATE POLICY "Partners can view own customers"
    ON public.customers FOR SELECT
    USING (partner_id = auth.uid());

CREATE POLICY "Partners can insert own customers"
    ON public.customers FOR INSERT
    WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can update own customers"
    ON public.customers FOR UPDATE
    USING (partner_id = auth.uid())
    WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can delete own customers"
    ON public.customers FOR DELETE
    USING (partner_id = auth.uid());

-- ============================================
-- 4. APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure end_time is after start_time
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_partner_id ON public.appointments(partner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON public.appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id ON public.appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Partners can only see their own appointments
CREATE POLICY "Partners can view own appointments"
    ON public.appointments FOR SELECT
    USING (partner_id = auth.uid());

CREATE POLICY "Partners can insert own appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can update own appointments"
    ON public.appointments FOR UPDATE
    USING (partner_id = auth.uid())
    WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can delete own appointments"
    ON public.appointments FOR DELETE
    USING (partner_id = auth.uid());

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE public.services IS 'Services offered by partners';
COMMENT ON TABLE public.staff IS 'Staff members of partners';
COMMENT ON TABLE public.customers IS 'Customers of partners';
COMMENT ON TABLE public.appointments IS 'Appointment bookings';

COMMENT ON COLUMN public.appointments.status IS 'Status: pending, confirmed, completed, cancelled, no_show';

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify tables were created:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('services', 'staff', 'customers', 'appointments');
