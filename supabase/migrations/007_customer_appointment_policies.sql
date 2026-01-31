-- Allow customers to cancel their own appointments
-- Customer can only update status to 'cancelled'

DROP POLICY IF EXISTS "Customers can cancel own appointments" ON appointments;
CREATE POLICY "Customers can cancel own appointments" ON appointments
  FOR UPDATE USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
    AND status = 'cancelled'
  );

-- Allow customers to view their own appointments
DROP POLICY IF EXISTS "Customers can view own appointments" ON appointments;
CREATE POLICY "Customers can view own appointments" ON appointments
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );
