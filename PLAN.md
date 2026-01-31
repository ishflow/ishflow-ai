# ishflow.ai - Proje Planı

## 📊 Mevcut Durum

### ✅ Tamamlanan Sayfalar

**Public (Müşteri Tarafı):**
- [x] `/` - Ana sayfa
- [x] `/search` - İşletme arama ve detay görünümü
- [x] `/business/:id` - İşletme profili
- [x] `/book/:businessId` - Randevu alma

**Partner (İşletme Tarafı):**
- [x] `/partner/login` - Giriş
- [x] `/partner/register` - Kayıt
- [x] `/partner/dashboard` - Panel ana sayfa
- [x] `/partner/services` - Hizmetler listesi
- [x] `/partner/services/new` - Hizmet ekleme
- [x] `/partner/staff` - Personel listesi
- [x] `/partner/staff/new` - Personel ekleme
- [x] `/partner/appointments` - Randevular
- [x] `/partner/customers` - Müşteriler
- [x] `/partner/settings` - Ayarlar

### 📦 Database Tabloları
- [x] `partners` - İşletmeler
- [x] `services` - Hizmetler
- [x] `staff` - Personeller
- [x] `customers` - Müşteriler
- [x] `appointments` - Randevular
- [x] `categories` - Kategoriler
- [x] `cities` - Şehirler
- [x] `reviews` - Yorumlar

---

## 🎯 Test & Demo Planı (Bugün)

### Adım 1: Partner Akışı Test (15 dk)
1. `/partner/register` - Yeni işletme kaydı
2. `/partner/login` - Giriş yap
3. `/partner/services/new` - 3-4 hizmet ekle
4. `/partner/staff/new` - 2-3 personel ekle
5. `/partner/settings` - İşletme bilgilerini doldur (adres, telefon, logo vs)

### Adım 2: Müşteri Akışı Test (10 dk)
1. `/search` - İşletmeyi bul
2. Detay sayfasında bilgilerin doğru göründüğünü kontrol et
3. "Randevu Al" butonu ile randevu oluştur
4. Partner panelinde randevunun görünüp görünmediğini kontrol et

### Adım 3: Çoklu İşletme Test (15 dk)
- 2-3 farklı demo işletme oluştur (farklı kategoriler: kuaför, klinik, spor salonu)
- Her birinde birkaç hizmet ve personel ekle
- Search sayfasında hepsinin göründüğünü doğrula

---

## 🔧 Eksik/İyileştirme Gereken Özellikler

### Öncelik 1 (Kritik)
- [ ] Randevu onay/red sistemi (partner tarafında)
- [ ] Randevu durumu güncelleme (confirmed, completed, cancelled)
- [ ] SMS/Email bildirimleri (randevu alındığında)

### Öncelik 2 (Önemli)
- [ ] Müşteri girişi/hesabı (`/customer`)
- [ ] Müşterinin kendi randevularını görmesi
- [ ] Çalışma saatleri yönetimi
- [ ] Personel bazlı müsaitlik kontrolü

### Öncelik 3 (Güzel Olur)
- [ ] Yorum/değerlendirme sistemi (gerçek yorumlar)
- [ ] Galeri yönetimi (partner ayarlarında)
- [ ] Kampanya/indirim sistemi
- [ ] Takvim görünümü (haftalık/aylık)
- [ ] Rapor/istatistik sayfası

---

## 📝 Demo İşletme Verileri

### İşletme 1: Kuaför
- **Ad:** Güzel Saçlar Kuaförü
- **Kategori:** Kuaför
- **Hizmetler:** Saç Kesimi (₺150), Fön (₺100), Saç Boyama (₺400), Manikür (₺120)
- **Personel:** Ayşe Yılmaz, Mehmet Demir

### İşletme 2: Güzellik Merkezi
- **Ad:** Beauty Center
- **Kategori:** Güzellik
- **Hizmetler:** Cilt Bakımı (₺250), Makyaj (₺300), Kaş Dizaynı (₺80)
- **Personel:** Seda Kaya, Zeynep Ak

### İşletme 3: Fitness
- **Ad:** FitLife Spor
- **Kategori:** Fitness
- **Hizmetler:** Personal Training (₺500), Pilates (₺200), Yoga (₺150)
- **Personel:** Can Öztürk, Ali Yıldız

---

## 🚀 Sonraki Adımlar

1. **Bugün:** Test & demo işletmeleri oluştur
2. **Yarın:** Eksik kritik özellikleri tamamla
3. **Bu hafta:** Pilot kullanıcı testi

---

*Son güncelleme: 31 Ocak 2026*
