# PlanPilot-VMAT

**Author:** dr. Muhammad Sobri Maulana

PlanPilot-VMAT adalah starter project **React + Python** untuk studi:

> **Perencanaan VMAT Berbasis AI vs Perencanaan Manual (Studi Non-inferiority)**

## Latar Belakang Studi
- **P (Population):** Pasien IMRT/VMAT multi-site (Head & Neck, prostat, pelvis, toraks).
- **I (Intervention):** AI plan generation / knowledge-based planning untuk rencana awal dan optimasi.
- **C (Comparison):** Perencanaan manual oleh dosimetrist/planner (workflow standar).
- **O (Outcome):** Kualitas rencana (CI/HI), sparing OAR (DVH endpoints), waktu planning, serta jumlah iterasi revisi sebelum approval.

## Struktur Project

```bash
PlanPilot-VMAT/
├── backend/
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
└── README.md
```

## Fitur Saat Ini
- API Python (Flask) untuk:
  - health check,
  - analisis satu kasus AI vs manual,
  - contoh data multi-site.
- UI React untuk input metrik (CI, HI, OAR, waktu planning, revisi) dan menampilkan hasil non-inferiority.

## Menjalankan Backend (Python)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend berjalan di `http://localhost:8000`.

## Menjalankan Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend Vite biasanya berjalan di `http://localhost:5173`.

## Endpoint API

### `GET /api/health`
Cek status service.

### `POST /api/analyze`
Analisis satu kasus VMAT.

Contoh payload:

```json
{
  "site": "Head & Neck",
  "ai_ci": 0.92,
  "manual_ci": 0.91,
  "ai_hi": 1.07,
  "manual_hi": 1.05,
  "ai_oar_score": 23,
  "manual_oar_score": 24,
  "ai_minutes": 45,
  "manual_minutes": 95,
  "ai_revisions": 1,
  "manual_revisions": 3
}
```

### `GET /api/sample-cases`
Mengembalikan contoh hasil analisis untuk beberapa site.

## Catatan Metodologi Non-inferiority (Sederhana)
Implementasi saat ini menggunakan margin sederhana untuk demonstrasi:
- CI: non-inferior jika nilai AI tidak lebih rendah dari manual melebihi margin.
- HI dan OAR score: diasumsikan lebih kecil lebih baik, dibandingkan dengan margin.

Untuk penelitian klinis, definisi endpoint, margin, serta analisis statistik harus disesuaikan dengan protokol studi yang tervalidasi.
