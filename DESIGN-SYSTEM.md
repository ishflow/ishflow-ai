# ISHFLOW.AI - Design System
## Figma'dan Çıkarılan Tasarım Rehberi

**Kaynak:** Figma mcp-tesing dosyası
**Tarih:** 30 Ocak 2026

---

## 🎨 RENK PALETİ

### Primary (Ana Renk)
| Renk | Hex | Kullanım |
|------|-----|----------|
| Primary Blue | `#1570EF` | Seçili state, aktif indicator, butonlar |
| Light Blue BG | `#EFF8FF` | Seçili kart arka planı |
| Blue Border | `#84CAFF` | Seçili kart bordür |

### Neutrals (Nötr Renkler)
| Renk | Hex | Kullanım |
|------|-----|----------|
| White | `#FFFFFF` | Arka plan, kartlar, inputlar |
| Light Gray BG | `#F9FAFB` | Sayfa arka planı, sidebar |
| Border | `#E4E7EC` | Kart bordür, divider, input border |
| Medium Gray | `#D0D5DD` | İkincil bordür, disabled |
| Text Secondary | `#667085` | İkincil metin, label, placeholder |
| Text Dark | `#344054` | Body text, ikonlar |
| Text Primary | `#101828` | Başlıklar, ana metin |

### Semantic (Anlamsal Renkler)
| Renk | Hex | Kullanım |
|------|-----|----------|
| Success | `#12B76A` | Başarı, "Paid", online dot |
| Success BG | `#ECFDF3` | Badge arka planı |
| Success Text | `#027A48` | Badge metin |
| Error | `#F04438` | Hata durumları |
| Warning | `#F79009` | Uyarı durumları |

---

## 🔤 TİPOGRAFİ

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Scales
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Logo | 24px | 700 | `#101828` |
| Page Title | 24px | 600 | `#101828` |
| Card Title | 14px | 600 | `#101828` |
| Metric Big | 30px | 600 | `#101828` |
| Body | 14px | 400 | `#344054` |
| Label | 14px | 500 | `#344054` |
| Small/Caption | 12px | 400 | `#667085` |
| Button | 14px | 600 | varies |

---

## 📐 SPACING

### Base: 4px grid

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | İkon gap |
| sm | 8px | Küçük padding |
| md | 12px | Input padding |
| lg | 16px | Kart içi padding |
| xl | 20px | Section gap |
| 2xl | 24px | Büyük padding |
| 3xl | 32px | Page margin |

---

## 🔘 BORDER RADIUS

| Token | Value | Usage |
|-------|-------|-------|
| sm | 6px | Küçük butonlar, badge |
| md | 8px | Butonlar, input |
| lg | 12px | Kartlar |
| xl | 16px | Büyük modal |
| full | 9999px | Avatar, yuvarlak badge |

---

## 🌫️ SHADOWS

```css
/* XS - Kartlar için */
shadow-xs: 0px 1px 2px rgba(16, 24, 40, 0.05);

/* SM - Hover state */
shadow-sm: 0px 1px 3px rgba(16, 24, 40, 0.1),
           0px 1px 2px rgba(16, 24, 40, 0.06);

/* MD - Dropdown */
shadow-md: 0px 4px 8px -2px rgba(16, 24, 40, 0.1),
           0px 2px 4px -2px rgba(16, 24, 40, 0.06);

/* XL - Modal */
shadow-xl: 0px 20px 24px -4px rgba(16, 24, 40, 0.08),
           0px 8px 8px -4px rgba(16, 24, 40, 0.03);
```

---

## 🧩 COMPONENT STİLLERİ

### Sidebar
```css
.sidebar {
  width: 280px;
  background: #FFFFFF;
  border-right: 1px solid #E4E7EC;
  padding: 24px 16px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  color: #344054;
  font-size: 14px;
  font-weight: 500;
}

.sidebar-item:hover {
  background: #F9FAFB;
}

.sidebar-item.active {
  background: #EFF8FF;
  color: #1570EF;
}
```

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: #1570EF;
  color: #FFFFFF;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  border: 1px solid #1570EF;
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
}

.btn-primary:hover {
  background: #1361D6;
}

/* Secondary Button */
.btn-secondary {
  background: #FFFFFF;
  color: #344054;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  border: 1px solid #D0D5DD;
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
}

.btn-secondary:hover {
  background: #F9FAFB;
}
```

### Input Fields
```css
.input {
  width: 100%;
  padding: 10px 14px;
  background: #FFFFFF;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 14px;
  color: #101828;
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
}

.input::placeholder {
  color: #667085;
}

.input:focus {
  border-color: #1570EF;
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05),
              0px 0px 0px 4px #EFF8FF;
  outline: none;
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E4E7EC;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
}

.card.selected {
  background: #EFF8FF;
  border-color: #84CAFF;
}
```

### Status Badge
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.badge-success {
  background: #ECFDF3;
  color: #027A48;
}

.badge-success::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #12B76A;
  border-radius: 50%;
}
```

### Avatar
```css
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-sm {
  width: 32px;
  height: 32px;
}

.avatar-lg {
  width: 48px;
  height: 48px;
}
```

---

## 📱 LAYOUT

### Dashboard Layout
```
┌──────────────────────────────────────────────────────────────┐
│                    Header (64px height)                       │
├─────────────┬────────────────────────────────────────────────┤
│             │                                                │
│   Sidebar   │               Main Content                     │
│   (280px)   │                                                │
│             │      ┌──────┐  ┌──────┐  ┌──────┐             │
│   • Menu    │      │ Card │  │ Card │  │ Card │             │
│   • Items   │      └──────┘  └──────┘  └──────┘             │
│             │                                                │
│             │      ┌─────────────────────────────┐           │
│             │      │        Table / List         │           │
│             │      └─────────────────────────────┘           │
│             │                                                │
└─────────────┴────────────────────────────────────────────────┘
```

### Breakpoints
```css
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
--screen-2xl: 1440px;
```

---

## ✨ ANIMATIONS

```css
/* Genel geçiş */
transition: all 150ms ease;

/* Hover scale */
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0px 4px 8px -2px rgba(16, 24, 40, 0.1);
}

/* Focus ring */
.focus-ring:focus {
  box-shadow: 0px 0px 0px 4px #EFF8FF;
}
```

---

*Bu design system Figma tasarımından çıkarılmıştır.*
*Son güncelleme: 30 Ocak 2026*
