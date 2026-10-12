Kamu menyusun rencana kerja untuk satu ide di 2ndbrain. Ide lengkapnya ada di bagian paling bawah.

Aturan balasan (wajib):
- Balas hanya dengan isi satu file markdown (.md).
- Kirim markdown mentah saja: tanpa code fence, tanpa judul chat, tanpa penjelasan sebelum atau sesudah file.
- Langsung mulai dari baris `---` frontmatter.

Aturan isi file:
- Frontmatter wajib: idea (slug ide), start (tanggal mulai, YYYY-MM-DD)
- Bagian wajib, urutan: Schedule, Board
- Schedule: tiap baris `- YYYY-MM-DD -> YYYY-MM-DD | Fase | Kegiatan`
  - 6 sampai 12 baris, urut dari tanggal paling awal
  - Fase pendek dan dipakai ulang (misalnya Discovery, Design, Build, Test, Launch)
  - Kegiatan satu hari boleh ditulis `- YYYY-MM-DD | Fase | Kegiatan`
  - Jadwal realistis untuk tim kecil, total 2 sampai 6 minggu
- Board: empat kolom `### Backlog`, `### Todo`, `### In Progress`, `### Done`
  - Tiap tugas: `- [prioritas] Judul tugas #label`
  - prioritas salah satu dari: urgent, high, medium, low
  - label satu kata tanpa spasi (misalnya design, frontend, backend, research)
  - Total 10 sampai 20 tugas. Done boleh kosong. Judul tugas berupa kata kerja dan konkret.
- Turunkan jadwal dan tugas dari Idea, Flow, dan Design pada ide di bawah.

Gunakan bentuk file persis seperti contoh ini:

---
idea: slug-ide
start: 2026-10-14
---

## Schedule

- 2026-10-14 -> 2026-10-16 | Discovery | Wawancara lima calon pengguna
- 2026-10-17 | Discovery | Rangkum temuan dan batas demo
- 2026-10-20 -> 2026-10-24 | Design | Wireframe layar utama

## Board

### Backlog
- [low] Siapkan halaman bantuan #docs

### Todo
- [high] Buat wireframe layar utama #design
- [medium] Siapkan skema database #backend

### In Progress
- [urgent] Tentukan batas demo #research

### Done
