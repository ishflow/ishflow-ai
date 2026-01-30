import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [businesses, setBusinesses] = useState([])
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')

  useEffect(() => {
    loadFilters()
    loadBusinesses()
  }, [city, category])

  const loadFilters = async () => {
    const [citiesRes, categoriesRes] = await Promise.all([
      supabase.from('cities').select('*').order('name'),
      supabase.from('categories').select('*').order('sort_order')
    ])
    setCities(citiesRes.data || [])
    setCategories(categoriesRes.data || [])
  }

  const loadBusinesses = async () => {
    setLoading(true)
    let query = supabase.from('partners').select('*').eq('is_public', true)
    
    if (city) query = query.eq('city', city)
    if (category) query = query.eq('category', category)
    if (search) query = query.ilike('company_name', `%${search}%`)
    
    const { data, error } = await query
    setBusinesses(data || [])
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadBusinesses()
  }

  const selectStyle = {
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    backgroundColor: 'white',
    minWidth: '160px',
    cursor: 'pointer',
    outline: 'none'
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navbar */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.svg" alt="ishflow" style={{ height: '28px' }} />
          </Link>
          <Link
            to="/partner/login"
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: '#2563eb',
              borderRadius: '8px',
              textDecoration: 'none'
            }}
          >
            İşletme Girişi
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ backgroundColor: 'white', padding: '48px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
            İşletme Ara 🔍
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
            Size en yakın işletmeleri bulun ve hemen randevu alın
          </p>

          {/* Search & Filters */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="İşletme adı ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                width: '280px',
                outline: 'none'
              }}
            />
            <select value={city} onChange={(e) => setCity(e.target.value)} style={selectStyle}>
              <option value="">Tüm Şehirler</option>
              {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
              <option value="">Tüm Kategoriler</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                backgroundColor: '#2563eb',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              Ara
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : businesses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏪</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              İşletme bulunamadı
            </h3>
            <p style={{ color: '#6b7280' }}>
              Farklı filtreler deneyin veya arama terimini değiştirin
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
              {businesses.length} işletme bulundu
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {businesses.map(business => (
                <Link
                  key={business.id}
                  to={`/business/${business.id}`}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* Image placeholder */}
                  <div style={{ height: '160px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '48px' }}>🏢</span>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                      {business.company_name}
                    </h3>
                    {business.category && (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        marginBottom: '12px'
                      }}>
                        {business.category}
                      </span>
                    )}
                    {business.city && (
                      <p style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📍</span> {business.city}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
