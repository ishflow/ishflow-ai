import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { auth } from '../../lib/supabase'

// Menu items
const menuItems = [
  { path: '/partner/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { path: '/partner/services', label: 'Servisler', icon: ServicesIcon },
  { path: '/partner/staff', label: 'Personel', icon: StaffIcon },
  { path: '/partner/appointments', label: 'Randevular', icon: AppointmentsIcon },
  { path: '/partner/customers', label: 'Müşteriler', icon: CustomersIcon },
  { path: '/partner/settings', label: 'Ayarlar', icon: SettingsIcon },
]

export default function Sidebar({ user, isOpen, onClose }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await auth.signOut()
    navigate('/partner/login')
  }

  const companyName = user?.user_metadata?.company_name || 'İşletme'
  const userEmail = user?.email || ''

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-[280px] bg-white border-r border-[#E4E7EC]
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 px-6 flex items-center border-b border-[#E4E7EC]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1570EF] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">İ</span>
            </div>
            <span className="text-xl font-semibold text-[#101828]">ishflow.</span>
          </div>
          {/* Mobile close button */}
          <button 
            className="ml-auto lg:hidden p-2 text-[#667085] hover:text-[#101828]"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    font-medium text-sm transition-all duration-150
                    ${isActive 
                      ? 'bg-[#EFF8FF] text-[#1570EF]' 
                      : 'text-[#667085] hover:bg-[#F9FAFB] hover:text-[#101828]'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon active={isActive} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[#E4E7EC]">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F9FAFB]">
            <div className="w-10 h-10 bg-[#1570EF] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {companyName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#101828] truncate">
                {companyName}
              </p>
              <p className="text-xs text-[#667085] truncate">
                {userEmail}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-[#667085] hover:text-[#F04438] hover:bg-white rounded-lg transition-colors"
              title="Çıkış Yap"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

// Icons
function DashboardIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M7.5 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V8.33333C2.5 8.79357 2.8731 9.16667 3.33333 9.16667H7.5C7.96024 9.16667 8.33333 8.79357 8.33333 8.33333V3.33333C8.33333 2.8731 7.96024 2.5 7.5 2.5Z" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M16.6667 2.5H12.5C12.0398 2.5 11.6667 2.8731 11.6667 3.33333V5.83333C11.6667 6.29357 12.0398 6.66667 12.5 6.66667H16.6667C17.1269 6.66667 17.5 6.29357 17.5 5.83333V3.33333C17.5 2.8731 17.1269 2.5 16.6667 2.5Z" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M16.6667 10H12.5C12.0398 10 11.6667 10.3731 11.6667 10.8333V16.6667C11.6667 17.1269 12.0398 17.5 12.5 17.5H16.6667C17.1269 17.5 17.5 17.1269 17.5 16.6667V10.8333C17.5 10.3731 17.1269 10 16.6667 10Z" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M7.5 12.5H3.33333C2.8731 12.5 2.5 12.8731 2.5 13.3333V16.6667C2.5 17.1269 2.8731 17.5 3.33333 17.5H7.5C7.96024 17.5 8.33333 17.1269 8.33333 16.6667V13.3333C8.33333 12.8731 7.96024 12.5 7.5 12.5Z" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ServicesIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M17.5 10H2.5M17.5 5H2.5M17.5 15H2.5" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StaffIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M13.3333 17.5V15.8333C13.3333 14.9493 12.9821 14.1014 12.357 13.4763C11.7319 12.8512 10.8841 12.5 10 12.5H5C4.11595 12.5 3.2681 12.8512 2.64298 13.4763C2.01786 14.1014 1.66667 14.9493 1.66667 15.8333V17.5" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M7.5 9.16667C9.34095 9.16667 10.8333 7.67428 10.8333 5.83333C10.8333 3.99238 9.34095 2.5 7.5 2.5C5.65905 2.5 4.16667 3.99238 4.16667 5.83333C4.16667 7.67428 5.65905 9.16667 7.5 9.16667Z" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M18.3333 17.5V15.8333C18.3328 15.0948 18.087 14.3773 17.6345 13.7936C17.182 13.2099 16.5484 12.793 15.8333 12.6083" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M13.3333 2.60833C14.0503 2.79192 14.6858 3.20892 15.1396 3.79359C15.5935 4.37827 15.8398 5.09736 15.8398 5.8375C15.8398 6.57764 15.5935 7.29673 15.1396 7.88141C14.6858 8.46608 14.0503 8.88308 13.3333 9.06667" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AppointmentsIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M15.8333 3.33333H4.16667C3.24619 3.33333 2.5 4.07952 2.5 5V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V5C17.5 4.07952 16.7538 3.33333 15.8333 3.33333Z" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M13.3333 1.66667V5" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M6.66667 1.66667V5" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M2.5 8.33333H17.5" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CustomersIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M16.6667 17.5V15.8333C16.6667 14.9493 16.3155 14.1014 15.6904 13.4763C15.0652 12.8512 14.2174 12.5 13.3333 12.5H6.66667C5.78262 12.5 4.93477 12.8512 4.30965 13.4763C3.68453 14.1014 3.33333 14.9493 3.33333 15.8333V17.5" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M10 9.16667C11.841 9.16667 13.3333 7.67428 13.3333 5.83333C13.3333 3.99238 11.841 2.5 10 2.5C8.15905 2.5 6.66667 3.99238 6.66667 5.83333C6.66667 7.67428 8.15905 9.16667 10 9.16667Z" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SettingsIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M16.1667 12.5C16.0557 12.7513 16.0226 13.0302 16.0716 13.3005C16.1207 13.5708 16.2495 13.8203 16.4417 14.0167L16.4917 14.0667C16.6466 14.2214 16.7695 14.4053 16.8534 14.6076C16.9373 14.8099 16.9805 15.0268 16.9805 15.2458C16.9805 15.4649 16.9373 15.6817 16.8534 15.884C16.7695 16.0863 16.6466 16.2702 16.4917 16.425C16.3369 16.5799 16.153 16.7028 15.9507 16.7867C15.7484 16.8706 15.5315 16.9138 15.3125 16.9138C15.0935 16.9138 14.8766 16.8706 14.6743 16.7867C14.472 16.7028 14.2881 16.5799 14.1333 16.425L14.0833 16.375C13.887 16.1828 13.6375 16.054 13.3672 16.0049C13.0969 15.9559 12.818 15.989 12.5667 16.1C12.3203 16.2056 12.1124 16.3833 11.9704 16.6102C11.8284 16.8371 11.7588 17.1026 11.7708 17.3708V17.5C11.7708 17.942 11.5952 18.3659 11.2826 18.6785C10.97 18.9911 10.5461 19.1667 10.1042 19.1667C9.66221 19.1667 9.23829 18.9911 8.92573 18.6785C8.61316 18.3659 8.4375 17.942 8.4375 17.5V17.4292C8.42299 17.1533 8.34344 16.8837 8.18964 16.6577C8.03584 16.4316 7.81511 16.2599 7.55833 16.1667C7.30707 16.0557 7.02814 16.0226 6.75786 16.0716C6.48757 16.1207 6.23806 16.2495 6.04167 16.4417L5.99167 16.4917C5.83689 16.6466 5.65295 16.7695 5.45068 16.8534C5.24841 16.9373 5.03155 16.9805 4.8125 16.9805C4.59345 16.9805 4.37659 16.9373 4.17432 16.8534C3.97205 16.7695 3.78811 16.6466 3.63333 16.4917C3.47844 16.3369 3.35553 16.153 3.27162 15.9507C3.18772 15.7484 3.14448 15.5315 3.14448 15.3125C3.14448 15.0935 3.18772 14.8766 3.27162 14.6743C3.35553 14.472 3.47844 14.2881 3.63333 14.1333L3.68333 14.0833C3.87552 13.887 4.00432 13.6375 4.05336 13.3672C4.10241 13.0969 4.06925 12.818 3.95833 12.5667C3.85279 12.3203 3.67498 12.1124 3.44812 11.9704C3.22126 11.8284 2.95577 11.7588 2.6875 11.7708H2.5C2.05797 11.7708 1.63405 11.5952 1.32149 11.2826C1.00893 10.97 0.833334 10.5461 0.833334 10.1042C0.833334 9.66221 1.00893 9.23829 1.32149 8.92573C1.63405 8.61316 2.05797 8.4375 2.5 8.4375H2.57083C2.8467 8.42299 3.11636 8.34344 3.34239 8.18964C3.56843 8.03584 3.74017 7.81511 3.83333 7.55833C3.94425 7.30707 3.97741 7.02814 3.92836 6.75786C3.87932 6.48757 3.75052 6.23806 3.55833 6.04167L3.50833 5.99167C3.35344 5.83689 3.23053 5.65295 3.14663 5.45068C3.06272 5.24841 3.01948 5.03155 3.01948 4.8125C3.01948 4.59345 3.06272 4.37659 3.14663 4.17432C3.23053 3.97205 3.35344 3.78811 3.50833 3.63333C3.66311 3.47844 3.84705 3.35553 4.04932 3.27162C4.25159 3.18772 4.46845 3.14448 4.6875 3.14448C4.90655 3.14448 5.12341 3.18772 5.32568 3.27162C5.52795 3.35553 5.71189 3.47844 5.86667 3.63333L5.91667 3.68333C6.11306 3.87552 6.36257 4.00432 6.63286 4.05336C6.90314 4.10241 7.18207 4.06925 7.43333 3.95833H7.5C7.74645 3.85279 7.95426 3.67498 8.09627 3.44812C8.23828 3.22126 8.30788 2.95577 8.29583 2.6875V2.5C8.29583 2.05797 8.47143 1.63405 8.78399 1.32149C9.09656 1.00893 9.52047 0.833334 9.9625 0.833334C10.4045 0.833334 10.8284 1.00893 11.141 1.32149C11.4536 1.63405 11.6292 2.05797 11.6292 2.5V2.57083C11.6171 2.8391 11.6867 3.10459 11.8287 3.33145C11.9708 3.55831 12.1785 3.73612 12.425 3.84167C12.6762 3.95259 12.9552 3.98575 13.2255 3.9367C13.4957 3.88766 13.7453 3.75886 13.9417 3.56667L13.9917 3.51667C14.1464 3.36177 14.3304 3.23886 14.5327 3.15496C14.7349 3.07106 14.9518 3.02782 15.1708 3.02782C15.3899 3.02782 15.6068 3.07106 15.809 3.15496C16.0113 3.23886 16.1952 3.36177 16.35 3.51667C16.5049 3.67145 16.6278 3.85538 16.7117 4.05765C16.7956 4.25992 16.8388 4.47678 16.8388 4.69583C16.8388 4.91489 16.7956 5.13175 16.7117 5.33402C16.6278 5.53629 16.5049 5.72022 16.35 5.875L16.3 5.925C16.1078 6.12139 15.979 6.3709 15.93 6.64119C15.8809 6.91148 15.9141 7.1904 16.025 7.44167V7.5C16.1305 7.74645 16.3083 7.95426 16.5352 8.09627C16.7621 8.23828 17.0276 8.30788 17.2958 8.29583H17.5C17.942 8.29583 18.3659 8.47143 18.6785 8.78399C18.9911 9.09656 19.1667 9.52047 19.1667 9.9625C19.1667 10.4045 18.9911 10.8284 18.6785 11.141C18.3659 11.4536 17.942 11.6292 17.5 11.6292H17.4292C17.1609 11.6413 16.8954 11.7109 16.6685 11.8529C16.4417 11.9949 16.2639 12.2027 16.1583 12.4492L16.1667 12.5Z" 
        stroke={active ? '#1570EF' : '#667085'} 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5" 
        stroke="currentColor" 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M13.3333 14.1667L17.5 10L13.3333 5.83333" 
        stroke="currentColor" 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M17.5 10H7.5" 
        stroke="currentColor" 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
