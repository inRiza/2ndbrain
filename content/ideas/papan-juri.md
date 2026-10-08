---
title: Papan juri
summary: Juri hackathon menilai dari rubrik yang sama, lalu panitia lihat peringkat tanpa spreadsheet.
updated: 2026-09-28
tags: juri, rubrik
---

## Idea

Nilai juri tercecer di spreadsheet. Rubrik berubah di tengah lomba, dan totalnya tidak sama antar meja.

Papan juri mengunci rubrik sebelum lomba mulai. Setiap juri menilai tim yang ditugaskan, panitia melihat rata-rata dan catatan. Demo cukup empat kriteria dan tiga tim.

## Flow

- Panitia kunci rubrik -> Juri membuka tim
- Juri membuka tim -> Isi skor
- Isi skor -> Simpan nilai
- Simpan nilai -> Peringkat panitia
- Juri membuka tim -> Lewati tim

## FAQ

### Bagaimana kalau satu juri belum selesai?
Tim itu tetap di peringkat, dengan kriteria kosong yang masih terlihat.

### Apa yang terjadi kalau rubrik berubah tengah lomba?
Tidak bisa. Rubrik dikunci sebelum juri pertama membuka tim.

## Design

- Skor pakai angka, bukan bintang
- Kriteria yang belum diisi tetap terlihat
- Peringkat di kolom kanan, satu baris per tim
- Catatan juri satu ukuran, nama juri lebih kecil

## References

- [Judging rubrics that stay fair](https://www.hackerearth.com/blog/how-to-judge-a-hackathon/) — kriteria harus kelihatan sebelum demo

## Sites

- [Google Sheets](https://docs.google.com/spreadsheets) — contoh rubrik yang mau diganti
