import {
  BookOpen,
  Code,
  Database,
  Package,
  Shield,
  Zap,
  LayoutTemplate,
  Layers,
  FileCode,
} from 'lucide-react'

export type DifficultyLevel = 'Pemula' | 'Menengah' | 'Advanced'
export type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

export interface Chapter {
  id: string
  title: string
  content: string
}

export interface Lesson {
  id: string
  title: string
  description: string
  icon: IconType
  difficulty: DifficultyLevel
  completed?: boolean
  pdfUrl?: string
  chapters?: Chapter[]
  duration?: string
  summary?: string
}

export interface CourseLevel {
  levelNumber: 1 | 2 | 3
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  category: string
  description: string
  progress: number
  levels: CourseLevel[]
}

export const materiData: Course[] = [
  {
    id: 'oop',
    title: 'Pemrograman Berorientasi Objek',
    category: 'Konsep Dasar',
    description: 'Pelajari konsep dasar dan implementasi Pemrograman Berorientasi Objek dalam bahasa pemrograman Python',
    progress: 15,
    levels: [
      {
        levelNumber: 1,
        lessons: [
          {
            id: 'oop-intro',
            title: 'Pengenalan PBO',
            description: 'Memahami konsep dasar pemrograman berorientasi objek dan manfaatnya',
            icon: BookOpen,
            difficulty: 'Pemula',
            completed: true,
            pdfUrl: '/materi/Pengenalan_PBO.pdf',
            chapters: [
              {
                id: 'bab-0',
                title: 'Pengenalan Pemrograman Berorientasi Objek',
                content: 'Pada bab ini, peserta didik akan mempelajari konsep dasar dalam Pemrograman Berorientasi Objek (PBO), yaitu class dan object. Materi ini menjadi fondasi utama dalam memahami bagaimana suatu program dirangkai menggunakan object-oriented paradigm. Peserta didik akan mempelajami: pengetahuan class sebagai cetak biru (blueprint) dari object sebagai instansiasi dari class. Selain itu, dibahas juga bagaimana mendefinisikan atribut (properties) dan method (behavior), serta cara membuat dan menggunakan object di dalam program.'
              }
            ]
          },
          {
            id: 'oop-class',
            title: 'Class dan Object',
            description: 'Memahami konsep dasar Class dan Object dalam Python',
            icon: LayoutTemplate,
            difficulty: 'Pemula',
            completed: true,
            duration: '25 Menit',
            summary: 'Dalam materi ini, Anda akan mempelajari konsep fundamental Object-Oriented Programming (OOP). Class adalah cetak biru (blueprint) yang mendefinisikan struktur dan perilaku objek, sementara object adalah instansi nyata dari class tersebut. Anda akan memahami perbedaan antara class dan object, cara mendefinisikan atribut dan method, serta bagaimana membuat dan menggunakan object dalam program Python. Konsep ini menjadi fondasi penting untuk membangun program yang terstruktur, mudah dipelihara, dan dapat dikembangkan dengan efisien.',
            chapters: [
              {
                id: 'bab-1',
                title: 'BAB 1 Class dan Object',
                content: 'Pada bab ini, peserta didik akan mempelajari konsep dasar dalam Pemrograman Berorientasi Objek (PBO), yaitu class dan object. Materi ini menjadi fondasi utama dalam memahami bagaimana suatu program dirangkai menggunakan object-oriented paradigm. Peserta didik akan mempelajami: pengetahuan class sebagai cetak biru (blueprint) dari object sebagai instansiasi dari class. Selain itu, dibahas juga bagaimana mendefinisikan atribut (properties) dan method (behavior), serta cara membuat dan menggunakan object di dalam program.'
              }
            ]
          },
        ],
      },
      {
        levelNumber: 2,
        lessons: [
          {
            id: 'oop-method',
            title: 'Method dalam Class',
            description: 'Intermediate | Segera Dibuka',
            icon: Code,
            difficulty: 'Menengah',
            completed: false,
          },
          {
            id: 'oop-package',
            title: 'Package dalam Python',
            description: 'Intermediate | Segera Dibuka',
            icon: Package,
            difficulty: 'Menengah',
            completed: false,
          },
          {
            id: 'oop-access',
            title: 'Access Modifier',
            description: 'Intermediate | Segera Dibuka',
            icon: Shield,
            difficulty: 'Menengah',
            completed: false,
          },
        ],
      },
      {
        levelNumber: 3,
        lessons: [
          {
            id: 'oop-encapsulation',
            title: 'Enkapsulasi OOP',
            description: 'Advanced | Segera Dibuka',
            icon: Layers,
            difficulty: 'Advanced',
            completed: false,
          },
          {
            id: 'oop-crud-create',
            title: 'CRUD Create',
            description: 'Advanced | Segera Dibuka',
            icon: FileCode,
            difficulty: 'Advanced',
            completed: false,
          },
          {
            id: 'oop-crud-read',
            title: 'CRUD Read Update',
            description: 'Advanced | Segera Dibuka',
            icon: Database,
            difficulty: 'Advanced',
            completed: false,
          },
          {
            id: 'oop-crud-delete',
            title: 'CRUD Delete',
            description: 'Advanced | Segera Dibuka',
            icon: Zap,
            difficulty: 'Advanced',
            completed: false,
          },
        ],
      },
    ],
  },
]
