import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, Search, BusinessProfile, PartnerLogin, PartnerRegister, PartnerDashboard, PartnerServices, PartnerServiceForm, PartnerStaff, PartnerStaffForm, PartnerAppointments, PartnerCustomers, PartnerSettings, BookAppointment, CustomerLogin, CustomerRegister, CustomerDashboard, CustomerAppointments, CustomerFavorites, CustomerProfile, CustomerSearch } from './pages'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/business/:id" element={<BusinessProfile />} />
        
        {/* Partner Routes */}
        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route path="/partner/register" element={<PartnerRegister />} />
        <Route path="/partner/dashboard" element={<PartnerDashboard />} />
        <Route path="/partner/services" element={<PartnerServices />} />
        <Route path="/partner/services/new" element={<PartnerServiceForm />} />
        <Route path="/partner/services/:id/edit" element={<PartnerServiceForm />} />
        <Route path="/partner/staff" element={<PartnerStaff />} />
        <Route path="/partner/staff/new" element={<PartnerStaffForm />} />
        <Route path="/partner/staff/:id/edit" element={<PartnerStaffForm />} />
        <Route path="/partner/appointments" element={<PartnerAppointments />} />
        <Route path="/partner/customers" element={<PartnerCustomers />} />
        <Route path="/partner/settings" element={<PartnerSettings />} />
        
        {/* Customer/Booking Routes */}
        <Route path="/book/:businessId" element={<BookAppointment />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegister />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/appointments" element={<CustomerAppointments />} />
        <Route path="/customer/favorites" element={<CustomerFavorites />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/customer/search" element={<CustomerSearch />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

// Placeholder Components
function ComingSoon({ title }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">{title}</h1>
        <p className="text-text-secondary mb-4">Bu sayfa yakında aktif olacak</p>
        <a href="/" className="text-primary hover:underline">Ana sayfaya dön</a>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">404</div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Sayfa Bulunamadı</h1>
        <p className="text-text-secondary mb-4">Aradığınız sayfa mevcut değil</p>
        <a href="/" className="text-primary hover:underline">Ana sayfaya dön</a>
      </div>
    </div>
  )
}

export default App
