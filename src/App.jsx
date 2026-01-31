import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'

// Loading component
const PageLoader = () => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #e5e7eb',
      borderTopColor: '#6366f1',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

// Lazy load pages for better performance
// Public
const Home = lazy(() => import('./pages/Home'))
const Search = lazy(() => import('./pages/Search'))
const BusinessProfile = lazy(() => import('./pages/BusinessProfile'))
const BookAppointment = lazy(() => import('./pages/BookAppointment'))

// Partner
const PartnerLogin = lazy(() => import('./pages/partner/Login'))
const PartnerRegister = lazy(() => import('./pages/partner/Register'))
const PartnerDashboard = lazy(() => import('./pages/partner/Dashboard'))
const PartnerServices = lazy(() => import('./pages/partner/Services'))
const PartnerServiceForm = lazy(() => import('./pages/partner/ServiceForm'))
const PartnerStaff = lazy(() => import('./pages/partner/Staff'))
const PartnerStaffForm = lazy(() => import('./pages/partner/StaffForm'))
const PartnerAppointments = lazy(() => import('./pages/partner/Appointments'))
const PartnerCustomers = lazy(() => import('./pages/partner/Customers'))
const PartnerSettings = lazy(() => import('./pages/partner/Settings'))

// Customer
const CustomerLogin = lazy(() => import('./pages/customer/Login'))
const CustomerRegister = lazy(() => import('./pages/customer/Register'))
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'))
const CustomerAppointments = lazy(() => import('./pages/customer/Appointments'))
const CustomerFavorites = lazy(() => import('./pages/customer/Favorites'))
const CustomerProfile = lazy(() => import('./pages/customer/Profile'))
const CustomerSearch = lazy(() => import('./pages/customer/Search'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '72px', marginBottom: '16px' }}>404</div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
          Sayfa Bulunamadı
        </h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Aradığınız sayfa mevcut değil
        </p>
        <a 
          href="/" 
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          Ana Sayfaya Dön
        </a>
      </div>
    </div>
  )
}

export default App
