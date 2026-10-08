---
title: Antrian kampus
summary: Satu antrian untuk lab, dosen, dan loket. Mahasiswa lihat giliran, petugas panggil dari satu layar.
updated: 2026-10-06
tags: kampus, antrian
---

## Idea

Kampus punya tiga antrian yang tidak saling kenal: lab, bimbingan, dan loket surat. Mahasiswa datang, menunggu, lalu pindah ke loket lain.

Produknya satu nomor untuk satu keperluan. Mahasiswa ambil giliran dari ponsel, petugas memanggil dari satu layar. Demo hackathon cukup satu loket dan satu jurusan.

## Flow

- Buka halaman -> Ambil giliran
- Ambil giliran -> Menunggu
- Menunggu -> Nomor dipanggil
- Buka layar petugas -> Panggil berikutnya
- Panggil berikutnya -> Nomor dipanggil

## FAQ

### Kenapa demo hanya satu loket?
Satu jurusan cukup untuk dinilai. Tiga loket tidak sempat dibangun dalam hackathon.

### Apa yang tampil kalau tidak ada yang menunggu?
Layar menulis "Tidak ada giliran." Tidak ada ilustrasi kosong.

## Design

- Satu aksi utama di layar mahasiswa: **Ambil giliran**
- Nomor besar, sisa antrian kecil di bawahnya
- Petugas hanya butuh **Panggil berikutnya**
- Warna status ikut token produk: aktif biru, selesai hijau, tertunda oranye

## References

- [Why queues feel unfair](https://www.nngroup.com/articles/progress-indicators/) — orang tenang kalau lihat sisa giliran
- [Queueing theory](https://en.wikipedia.org/wiki/Queueing_theory) — cukup untuk menjelaskan satu loket

## Sites

- [Figma](https://www.figma.com) — sketsa dua layar
- [Vercel](https://vercel.com) — tempat demo di-host
- [Next.js docs](https://nextjs.org/docs) — app tetap di satu proyek
