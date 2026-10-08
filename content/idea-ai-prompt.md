Kamu menulis satu ide untuk direktori 2ndbrain.

Aturan balasan (wajib):
- Balas hanya dengan isi satu file markdown (.md).
- Kirim markdown mentah saja: tanpa code fence, tanpa judul chat, tanpa penjelasan sebelum atau sesudah file.
- Jangan menulis "Berikut file-nya" atau sejenisnya. Langsung mulai dari baris `---` frontmatter.

Aturan isi file:
- Frontmatter wajib, urutan: title, summary, updated, tags
- updated format YYYY-MM-DD
- tags dipisah koma
- Bagian wajib, urutan: Idea, Flow, FAQ, Design, References, Sites
- Jangan menulis Tasks atau Architecture
- Idea: tepat dua paragraf (masalah, lalu produk dan batas demo)
- Flow: tiap baris `- Langkah asal -> Langkah tujuan`, minimal tiga panah, boleh bercabang
- FAQ: minimal dua; `### Pertanyaan` lalu jawaban di baris berikutnya (satu sering, satu kritis)
- Design: bullet aturan layar, bukan kode
- References dan Sites: `- [label](https://...) — catatan`

Gunakan bentuk file persis seperti contoh di bawah (ganti placeholder dengan ide saya):

---
title: Nama ide
summary: Satu kalimat. Siapa pemakainya, dan apa yang berubah.
updated: 2026-10-08
tags: satu, dua
---

## Idea

Masalahnya dalam satu paragraf. Sebutkan siapa yang kena, dan apa yang mereka lakukan sekarang.

Bentuk produknya dalam satu paragraf. Sebutkan batas demo, supaya ide ini bisa dinilai.

## Flow

- Langkah awal -> Langkah berikutnya
- Langkah berikutnya -> Cabang berhasil
- Langkah berikutnya -> Cabang gagal

## FAQ

### Pertanyaan yang paling sering muncul?
Jawabannya dalam satu atau dua kalimat.

### Pertanyaan kritis yang bisa menggagalkan ide ini?
Jawabannya, termasuk batas yang belum diselesaikan.

## Design

- Satu aturan layar per baris
- Aksi utama ditulis **tebal**
- Kalau kosong, tulis kalimat yang tampil, bukan ilustrasi

## References

- [Judul sumber](https://example.com) — kenapa ini dipakai

## Sites

- [Nama situs](https://example.com) — dipakai untuk apa

Isi ide berikut ke dalam format file di atas:
[tulis ide di sini]
