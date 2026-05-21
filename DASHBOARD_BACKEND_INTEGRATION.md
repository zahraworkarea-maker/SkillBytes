# Dashboard Backend Integration Documentation

## Overview
Dashboard telah berhasil diintegrasikan dengan backend API. Semua data sekarang diambil secara dinamis dari API Laravel, bukan data hard-coded.

## Changes Made

### 1. **Custom Hook: `useDashboardData`** (`hooks/use-dashboard-data.ts`)
Hook baru yang mengorganisir semua data dashboard dengan fetching dari backend:

```typescript
- Fetches user data (nama, ID)
- Calculates progress untuk Materi (lessons)
- Calculates progress untuk Assessment (exams)
- Calculates progress untuk PBL (problem-based learning cases)
- Fetches recent activities dari assessment results
- Provides fallback data jika API tidak tersedia
```

**Fitur:**
- Loading state handling
- Error handling dan fallback data
- Caching data dalam component state
- Auto-fetch ketika component mount

### 2. **Updated Dashboard Page** (`app/(siswa)/dashboard/page.tsx`)
- Integrates `useDashboardData` hook
- Passes `dashboardData` ke semua child components
- Displays user name dinamis dari API
- Loading state management

### 3. **Updated Components**

#### **Progress Cards Component** (`components/dashboard/progress-cards.tsx`)
**Perubahan:**
- Menerima prop `dashboardData`
- Menampilkan data real dari API:
  - Materi: `completed/total` lessons
  - Assessment: `completed/total` exams  
  - PBL: `completed/total` tasks
- Progress bar menampilkan persentase real

**Data Source:**
```typescript
dashboardData.materials.progress      // 0-100%
dashboardData.materials.completed     // Jumlah lesson selesai
dashboardData.materials.total         // Total lesson

dashboardData.assessments.progress    // 0-100%
dashboardData.assessments.completed   // Jumlah assessment selesai
dashboardData.assessments.total       // Total assessment

dashboardData.pbl.progress            // 0-100%
dashboardData.pbl.completed          // Jumlah PBL selesai
dashboardData.pbl.total              // Total PBL
```

#### **Continue Learning Component** (`components/dashboard/continue-learning.tsx`)
**Perubahan:**
- Menampilkan current lesson yang belum selesai
- Menampilkan upcoming lessons dari API
- Menampilkan upcoming assessments
- Link ke lesson yang dapat diklik (navigasi ke `/siswa/materi/{slug}`)

**Data Source:**
```typescript
dashboardData.materials.currentLesson   // Lesson yang sedang berlangsung
dashboardData.materials.upcomingLessons // 5 lessons yang akan datang
dashboardData.assessments.upcomingAssessments // Upcoming exams
```

#### **Student Activity Component** (`components/dashboard/student-activity.tsx`)
**Perubahan:**
- Menampilkan real activities dari assessment results API
- Fallback message jika tidak ada activities
- Dynamic icon berdasarkan activity type

**Data Source:**
```typescript
dashboardData.activities  // Array dari activities terbaru
```

#### **Overview Chart Component** (`components/dashboard/overview-chart.tsx`)
**Perubahan:**
- Menggunakan monthly stats dari dashboardData
- Fallback ke default data jika tidak ada

**Data Source:**
```typescript
dashboardData.monthlyStats  // Array of {month, materi, assesmen}
```

#### **Statistics Component** (`components/dashboard/statistics.tsx`)
**Perubahan:**
- Menampilkan real progress untuk Materi, Assessment, PBL
- Circular progress menampilkan overall progress
- Dynamic bar colors berdasarkan progress

**Data Source:**
```typescript
dashboardData.materials.progress      // Materi progress
dashboardData.assessments.progress    // Assessment progress
dashboardData.pbl.progress            // PBL progress
```

## API Endpoints Used

### Fetching Dashboard Data:

1. **User Data**
   - Endpoint: `GET /auth/user`
   - Digunakan untuk: Nama user, ID user

2. **Materials/Levels**
   - Endpoint: `GET /levels/all`
   - Response: Levels dengan lessons (including completed status)
   - Digunakan untuk: Calculate material progress, current lesson, upcoming lessons

3. **Assessments**
   - Endpoint: `GET /assessments?page=1&per_page=100`
   - Digunakan untuk: Total assessments, upcoming assessments list

4. **Assessment Results**
   - Endpoint: `GET /assessment-results?page=1&per_page=100`
   - Digunakan untuk: Calculate assessment progress, activities

5. **PBL Cases**
   - Endpoint: `GET /pbl-cases?page=1&per_page=100`
   - Digunakan untuk: Total PBL cases, upcoming cases

6. **PBL Submissions**
   - Endpoint: `GET /pbl-submissions?page=1`
   - Digunakan untuk: Calculate PBL progress

## Data Flow

```
useDashboardData Hook (mounted on Dashboard Page)
    ↓
Fetches from API
    ├─ authService.getCurrentUser()
    ├─ materiService.getAllLevels()
    ├─ assessmentService.getAllAssessments()
    ├─ assessmentResultService.getAllResults()
    ├─ pblService.getAllCases()
    └─ pblService.getSubmissions()
    ↓
Calculates progress & stats
    ├─ Material progress
    ├─ Assessment progress
    ├─ PBL progress
    └─ Activities list
    ↓
Updates Component State
    ↓
Components render with real data
```

## Features

### ✅ Real-time Data
- Semua data diambil langsung dari API
- Auto-refresh ketika halaman dimount

### ✅ Smart Fallbacks
- Jika API gagal, tampilkan data default atau empty states
- Graceful error handling tanpa crash app

### ✅ Performance Optimized
- Memoized components untuk prevent unnecessary re-renders
- Lazy loading untuk bottom sections
- Efficient data fetching (batch requests dimungkinkan)

### ✅ User Experience
- Loading states untuk smooth UX
- Responsive design untuk semua ukuran screen
- Dynamic progress calculations

## Usage Example

```tsx
// Dashboard page automatically fetches data
const { data: dashboardData, loading, error } = useDashboardData()

// Pass to components
<ProgressCards 
  activeCard={activeCard} 
  onCardClick={setActiveCard} 
  dashboardData={dashboardData}
/>
```

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket untuk live progress updates
2. **Caching**: Add cache layer untuk mengurangi API calls
3. **Pagination**: Implement pagination untuk large data sets
4. **Filtering**: Add filter options untuk activities
5. **Export**: Add export functionality untuk statistics

## Troubleshooting

### Dashboard shows empty states
- Check browser console untuk error messages
- Verify API endpoints are accessible
- Check authentication token validity

### Progress shows 0%
- Ensure user has completed lessons/assessments
- Check API response format matches expected structure
- Verify database memiliki data user terkait

### Components not updating
- Check if `dashboardData` prop is passed correctly
- Verify hook is called at parent level (Dashboard page)
- Check for console errors

## Integration Checklist

- ✅ Created `useDashboardData` hook
- ✅ Updated Dashboard page to use hook
- ✅ Updated ProgressCards component
- ✅ Updated ContinueLearning component
- ✅ Updated StudentActivity component
- ✅ Updated OverviewChart component
- ✅ Updated Statistics component
- ✅ Added error handling & fallbacks
- ✅ Tested for TypeScript errors

## Next Steps

1. Test dashboard with real backend API
2. Verify all API endpoints return expected data
3. Monitor performance and optimize if needed
4. Add more detailed activity tracking
5. Implement real-time notifications
