# DKAB Sunum v2 — kaynak dosyalar

`DKAB_Sunum_v2.html`, orijinal `DKAB_Sunum_Final_82.html` dosyasından bu klasördeki parçalarla üretilir:

- `tema.css`  — modern (Brilliant.org tarzı) görünüm katmanı; mevcut sınıf adlarının üzerine yazar
- `ana.html`  — yeni ana ekran
- `nav.html`  — yeni alt gezinme çubuğu
- `ekstra.html` — konular çekmecesi, geri sayım, rastgele öğrenci, kısayollar, eksik araç arayüzleri
- `v2.js`     — etkileşim katmanı (animasyon, çekmece, geri sayım, seçici, lazer/spot, kısayollar)
- `build.py`  — hepsini birleştirip `../DKAB_Sunum_v2.html` dosyasını yazar

Yeniden üretmek için:

    python3 v2-kaynak/build.py

Not: v2 dosyasında "Düzenleme Modu → Kaydet" ile yapılan içerik değişiklikleri doğrudan v2 dosyasına yazılır;
build.py yeniden çalıştırılırsa orijinal içerikten yeniden üretilir (v2 içindeki düzenlemeler kaybolur).
