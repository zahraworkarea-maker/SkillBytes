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

export type DifficultyLevel = '1' | '2' | '3'
export type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

export interface Chapter {
  id: string
  title: string
  description: string
}

export interface Lesson {
  id: string
  title: string
  icon: IconType
  difficulty: DifficultyLevel
  completed?: boolean
  pdfUrl?: string
  description?: string
  duration?: string
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
            icon: BookOpen,
            difficulty: '1',
            completed: true,
            pdfUrl: '/materi/Pengenalan_PBO.pdf',
            description: 'Pada bab ini, peserta didik akan mempelajari konsep dasar dalam Pemrograman Berorientasi Objek (PBO), yaitu class dan object. Materi ini menjadi fondasi utama dalam memahami bagaimana suatu program dirangkai menggunakan object-oriented paradigm. Peserta didik akan mempelajami: pengetahuan class sebagai cetak biru (blueprint) dari object sebagai instansiasi dari class. Selain itu, dibahas juga bagaimana mendefinisikan atribut (properties) dan method (behavior), serta cara membuat dan menggunakan object di dalam program.'
          },
          {
            id: 'oop-class',
            title: 'Class dan Object',
            icon: LayoutTemplate,
            difficulty: '1',
            completed: true,
            duration: '25 Menit',
            description: 'Pada bab ini, peserta didik akan mempelajari konsep dasar dalam Pemrograman Berorientasi Objek (PBO), yaitu class dan object. Materi ini menjadi fondasi utama dalam memahami bagaimana suatu program dirangkai menggunakan object-oriented paradigm. Peserta didik akan mempelajami: pengetahuan class sebagai cetak biru (blueprint) dari object sebagai instansiasi dari class. Selain itu, dibahas juga bagaimana mendefinisikan atribut (properties) dan method (behavior), serta cara membuat dan menggunakan object di dalam program.'
          },
        ],
      },
      {
        levelNumber: 2,
        lessons: [
          {
            id: 'oop-method',
            title: 'Method dalam Class',
            icon: Code,
            difficulty: '2',
            completed: false,
          },
          {
            id: 'oop-package',
            title: 'Package dalam Python',
            icon: Package,
            difficulty: '2',
            completed: false,
          },
          {
            id: 'oop-access',
            title: 'Access Modifier',
            icon: Shield,
            difficulty: '2',
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
            icon: Layers,
            difficulty: '3',
            completed: false,
          },
          {
            id: 'oop-crud-create',
            title: 'CRUD Create',
            icon: FileCode,
            difficulty: '3',
            completed: false,
          },
          {
            id: 'oop-crud-read',
            title: 'CRUD Read Update',
            icon: Database,
            difficulty: '3',
            completed: false,
          },
          {
            id: 'oop-crud-delete',
            title: 'CRUD Delete',
            icon: Zap,
            difficulty: '3',
            completed: false,
          },
        ],
      },
    ],
  },
]
