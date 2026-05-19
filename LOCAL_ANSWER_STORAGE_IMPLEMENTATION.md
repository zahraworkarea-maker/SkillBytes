# Implementasi Penyimpanan Jawaban Lokal

## Ringkasan Perubahan
Sistem kuis telah diubah sehingga **jawaban tidak langsung dikirim ke backend** ketika dipilih, tetapi **disimpan secara lokal terlebih dahulu**. Semua jawaban akan dikirim ke backend hanya ketika tombol **"Selesai"** diklik.

## Alur Kerja Baru

### Sebelumnya:
```
User klik opsi → Simpan di local state → Langsung kirim ke backend → Update UI
```

### Sekarang:
```
User klik opsi → Simpan di local state → Update UI
                           ↓
                    (User lanjut ke soal lain)
                           ↓
                    User klik "Selesai"
                           ↓
              Batch kirim SEMUA jawaban → Finish assessment → Hasil
```

## Perubahan File

### 1. **lib/api-services.ts**
- ✅ **Ditambahkan**: Method baru `submitAnswersBatch()`
  - Mengirim multiple answers sekaligus dalam satu request
  - Format: `{ answers: [{ question_id, selected_option_id }, ...] }`
  - Endpoint: `POST /assessments/{attemptId}/answers-batch`

- ℹ️ **Dipertahankan**: Method `submitAnswer()` (untuk fallback)
  - Jika endpoint batch tidak tersedia, akan fall back ke submission individual

### 2. **app/(siswa)/assesmen/[slug]/quiz/page.tsx**

#### Perubahan di `handleSelectAnswer`:
```typescript
// ❌ SEBELUMNYA: Langsung submit ke backend
async (optionId) => {
  selectAnswer(optionId); // local
  submitAnswer(attemptId, questionId, optionId); // backend
}

// ✅ SEKARANG: Hanya simpan lokal
(optionId) => {
  selectAnswer(optionId); // local only
  // Tidak ada submit ke backend
}
```

#### Perubahan di `handleFinishAssessment`:
```typescript
// ✅ SEKARANG: Batch submit semua jawaban terlebih dahulu
async () => {
  // Step 1: Submit all stored answers in batch
  await submitAnswersBatch(attemptId, assessmentState.answers);
  
  // Step 2: Finish the assessment
  await finishAssessment(attemptId);
  
  // Step 3: Navigate ke hasil
  router.push(hasil_page);
}
```

#### Pembersihan State:
- ❌ **Dihapus**: `submittingAnswers` state (tidak lagi diperlukan)
- ✅ **Dipertahankan**: `answers` di `assessmentState` untuk menyimpan jawaban

## Keuntungan

1. **Lebih Cepat untuk User**
   - Tidak perlu menunggu response dari backend saat memilih opsi
   - UI lebih responsif

2. **Batch Submission Lebih Efisien**
   - Hanya 1 request untuk mengirim semua jawaban
   - Bandwidth lebih minimal dibanding multiple requests

3. **Lebih Stabil**
   - Jika ada gagal, user bisa lihat warning sebelum submit final
   - Semua jawaban submit dalam satu batch (atomic operation)

4. **Support Resume**
   - Jawaban disimpan lokal, jadi bisa di-resume dari browser yang sama
   - Lebih aman jika terjadi network error

## Testing Checklist

- [ ] User dapat memilih opsi dan melihat update di UI tanpa delay
- [ ] Navigasi soal berfungsi dengan menyimpan jawaban sebelumnya
- [ ] Ketika klik "Selesai":
  - [ ] Semua jawaban ter-batch dalam satu request
  - [ ] Assessment selesai dengan score yang benar
  - [ ] Redirect ke halaman hasil berfungsi
- [ ] Warning muncul jika ada soal yang belum dijawab
- [ ] Fallback ke individual submission berfungsi (jika batch endpoint tidak ada)

## Backend Requirements

Backend perlu mendukung endpoint baru:
```
POST /assessments/{attemptId}/answers-batch
Body: {
  "answers": [
    { "question_id": 1, "selected_option_id": 5 },
    { "question_id": 2, "selected_option_id": 8 },
    ...
  ]
}
```

Atau tetap menggunakan endpoint `answers` dengan fallback individual submissions.

## Debugging

Jika ada masalah, cek browser console untuk logs:
- `📝 Answer selected` - Jawaban disimpan lokal
- `📦 Submitting X stored answers` - Batch submit dimulai
- `✅ All answers submitted successfully` - Batch submit berhasil
- `❌ Error submitting answers` - Ada error (akan fallback jika perlu)
