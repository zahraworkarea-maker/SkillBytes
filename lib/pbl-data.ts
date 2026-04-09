export interface PBLCase {
  id: string;
  caseNumber: number;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
  description: string;
  content: string;
  timeLimit: number; // in minutes
  isCompleted: boolean;
  startDate: string;
  deadline: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

export const pblCasesData: Record<string, PBLCase> = {
  'case-01': {
    id: 'case-01',
    caseNumber: 1,
    title: 'System Login Bermasalah',
    level: 'Beginner',
    description: 'Analisis dan perbaiki masalah pada sistem login aplikasi',
    content: `<div>
      <p>Sebuah perusahaan mengalami masalah pada sistem login aplikasinya di mana pengguna tidak dapat mengakses aplikasi. Beberapa pengguna melaporkan error saat input username-password yang benar.</p>
      
      <div>
        <h4>Masalah yang Dihadapi:</h4>
        <ul>
          <li>Beberapa pengguna tidak bisa login meskipun kredensial benar</li>
          <li>Aplikasi sering crash ketika proses login</li>
          <li>Error message tidak jelas atau tidak muncul</li>
          <li>Loading time login sangat lama</li>
        </ul>
      </div>

      <h4>Sebagai seorang Frontend Developer (Junior):</h4>
      <p>Tugasmu adalah memperbaiki bagian input halaman login agar pengguna dapat mengakses aplikasi dengan benar. Fokus pada:</p>
      
      <ul>
        <li>Validasi input form yang lebih baik</li>
        <li>Error handling yang jelas dan user-friendly</li>
        <li>User experience yang lebih baik</li>
        <li>Security considerations</li>
        <li>Loading state yang tepat</li>
      </ul>

      <div>
        <h4>Solusi yang Diharapkan:</h4>
        <p>Implementasikan form login yang robust dengan validasi client-side dan server-side yang baik, error handling yang jelas, serta UX yang menyenangkan.</p>
      </div>
    </div>`,
    timeLimit: 180,
    isCompleted: false,
    startDate: '2026-04-01',
    deadline: '2026-05-20',
    status: 'in-progress',
  },
  'case-02': {
    id: 'case-02',
    caseNumber: 2,
    title: 'Dashboard Performance Optimization',
    level: 'Intermediate',
    description: 'Optimalkan performa dashboard yang lambat menampilkan data besar',
    content: `<div>
      <p>Dashboard aplikasi mengalami performa yang buruk ketika menampilkan data dalam jumlah besar. User experience menurun drastis dan banyak complaints dari pengguna.</p>
      
      <div>
        <h4>Tantangan yang Dihadapi:</h4>
        <ul>
          <li>Loading time dashboard > 5 detik</li>
          <li>Chart scroll sangat lambat (frame rate rendah)</li>
          <li>Memory usage tinggi dan terus bertambah</li>
          <li>Tidak responsive pada device dengan performa rendah</li>
          <li>Re-rendering yang berlebihan</li>
        </ul>
      </div>

      <h4>Tugas Frontend Developer (Intermediate):</h4>
      <p>Identifikasi bottleneck performa dan optimalkan dashboard menggunakan teknik optimasi modern:</p>
      
      <ul>
        <li>Code splitting dan lazy loading</li>
        <li>Pagination atau virtual scrolling untuk data besar</li>
        <li>Memoization dan useMemo/useCallback optimization</li>
        <li>Image optimization</li>
        <li>Bundle size optimization</li>
      </ul>
    </div>`,
    timeLimit: 240,
    isCompleted: true,
    startDate: '2026-03-15',
    deadline: '2026-04-05',
    status: 'completed',
  },
  'case-03': {
    id: 'case-03',
    caseNumber: 3,
    title: 'Real-time Notification System',
    level: 'Advanced',
    description: 'Implementasi sistem notifikasi real-time menggunakan WebSocket',
    content: `<div>
      <p>Aplikasi memerlukan sistem notifikasi real-time yang dapat mengirim update kepada user secara instant tanpa perlu refresh halaman.</p>
      
      <div>
        <h4>Requirements:</h4>
        <ul>
          <li>Notifikasi harus real-time (latency minimal)</li>
          <li>Support untuk berbagai tipe notifikasi (info, warning, error)</li>
          <li>Notification queue dan persistence</li>
          <li>Handle disconnection dan reconnection gracefully</li>
          <li>Scalable untuk banyak user secara bersamaan</li>
        </ul>
      </div>

      <h4>Teknologi yang Disarankan:</h4>
      <ul>
        <li>WebSocket (Socket.io atau ws)</li>
        <li>Event-driven architecture</li>
        <li>Message queue (Redis)</li>
        <li>Notification service backend</li>
      </ul>
    </div>`,
    timeLimit: 360,
    isCompleted: false,
    startDate: '2026-04-05',
    deadline: '2026-04-30',
    status: 'not-started',
  },
  'case-04': {
    id: 'case-04',
    caseNumber: 4,
    title: 'State Management Architecture Redesign',
    level: 'Expert',
    description: 'Redesain arsitektur state management aplikasi yang kompleks',
    content: `<div>
      <p>Aplikasi semakin kompleks dengan banyak state yang sulit dikelola. Diperlukan redesain architecture yang lebih scalable dan maintainable.</p>
      
      <div>
        <h4>Masalah Saat Ini:</h4>
        <ul>
          <li>Props drilling yang dalam (nested components)</li>
          <li>State management yang tidak konsisten</li>
          <li>Sulit untuk debug dan trace state changes</li>
          <li>Performance issues karena unnecessary re-renders</li>
          <li>Kesulitan dalam testing</li>
        </ul>
      </div>

      <h4>Expert Task:</h4>
      <p>Design dan implement state management solution yang optimal:</p>
      
      <ul>
        <li>Evaluate: Redux, Zustand, Recoil, Context API</li>
        <li>Design store structure yang normalized</li>
        <li>Implement middleware untuk logging dan persistence</li>
        <li>Setup DevTools untuk debugging</li>
        <li>Write comprehensive tests</li>
      </ul>
    </div>`,
    timeLimit: 480,
    isCompleted: false,
    startDate: '2026-04-10',
    deadline: '2026-05-15',
    status: 'not-started',
  },
  'case-05': {
    id: 'case-05',
    caseNumber: 5,
    title: 'Full-stack Scalability and Deployment',
    level: 'Master',
    description: 'Implementasi full-stack scalability dan production deployment',
    content: `<div>
      <p>Aplikasi telah mencapai jutaan user, diperlukan strategi scalability dan deployment yang robust untuk menangani traffic besar.</p>
      
      <div>
        <h4>Tantangan Master Level:</h4>
        <ul>
          <li>Scale aplikasi untuk jutaan concurrent users</li>
          <li>Database optimization dan sharding strategy</li>
          <li>Caching strategy (CDN, Redis, memcached)</li>
          <li>Load balancing dan failover</li>
          <li>Monitoring, logging, dan error tracking</li>
          <li>Security dan compliance</li>
          <li>CI/CD pipeline optimization</li>
        </ul>
      </div>

      <h4>Master-level Architecture Decisions:</h4>
      <ul>
        <li>Microservices vs Monolith trade-offs</li>
        <li>Database replication dan consistency models</li>
        <li>Message queue untuk async processing</li>
        <li>Infrastructure as Code (Terraform, Ansible)</li>
        <li>Kubernetes orchestration dan deployment strategies</li>
        <li>Disaster recovery dan backup strategies</li>
      </ul>
    </div>`,
    timeLimit: 600,
    isCompleted: false,
    startDate: '2026-04-20',
    deadline: '2026-06-01',
    status: 'not-started',
  },
};
