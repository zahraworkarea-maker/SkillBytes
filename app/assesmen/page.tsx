'use client'

import { useState } from 'react'
import { Lock, CheckCircle, Clock, Folder, BarChart3, Code2, Database, Layers, Settings, Zap, Cpu, GitBranch, Shuffle, Shield, Plus, Eye, RefreshCw } from 'lucide-react'
import { AssessmentCard } from '@/components/assesmen/assessment-card'
import { SKKNILevelCard } from '@/components/assesmen/skkni-level-card'

interface Assessment {
  id: string
  title: string
  icon: React.ReactNode
  status: 'completed' | 'in-progress' | 'locked'
  description?: string
}

interface AssessmentLevel {
  id: number
  levelNumber: number
  title: string
  description: string
  icon: React.ReactNode
  assessments: Assessment[]
  bgColor?: string
}

const assessmentLevels: AssessmentLevel[] = [
  {
    id: 1,
    levelNumber: 1,
    title: 'LEVEL 1 - Dasar OOP',
    description: 'Mengukur Pengetahuan Dasar Class dan Object',
    icon: <Folder className="w-6 h-6" />,
    assessments: [
      {
        id: 'l1-a1',
        title: 'Konsep Class dan Object',
        icon: <Layers className="w-5 h-5" />,
        status: 'completed',
        description: 'Memahami dasar-dasar class dan object dalam OOP'
      },
      {
        id: 'l1-a2',
        title: 'Constructor dan Destructor',
        icon: <Settings className="w-5 h-5" />,
        status: 'locked',
        description: 'Pelajari cara membuat dan menghancurkan objek'
      },
      {
        id: 'l1-a3',
        title: 'Properties dan Methods',
        icon: <Zap className="w-5 h-5" />,
        status: 'locked',
        description: 'Menguasai atribut dan fungsi dalam class'
      },
    ],
  },
  {
    id: 2,
    levelNumber: 2,
    title: 'LEVEL 2 - Struktur dan Komponen OOP',
    description: 'Mengukur pemahaman tentang struktur dan komponen dalam OOP',
    icon: <BarChart3 className="w-6 h-6" />,
    assessments: [
      {
        id: 'l2-a1',
        title: 'Inheritance',
        icon: <GitBranch className="w-5 h-5" />,
        status: 'in-progress',
        description: 'Konsep pewarisan dalam OOP'
      },
      {
        id: 'l2-a2',
        title: 'Polymorphism',
        icon: <Shuffle className="w-5 h-5" />,
        status: 'locked',
        description: 'Kemampuan objek untuk memiliki banyak bentuk'
      },
      {
        id: 'l2-a3',
        title: 'Encapsulation',
        icon: <Shield className="w-5 h-5" />,
        status: 'locked',
        description: 'Menyembunyikan detail implementasi'
      },
    ],
  },
  {
    id: 3,
    levelNumber: 3,
    title: 'LEVEL 3 - CRUD dalam OOP',
    description: 'Mengukur pemahaman tentang operasi Create, Read, Update, dan Delete',
    icon: <Code2 className="w-6 h-6" />,
    assessments: [
      {
        id: 'l3-a1',
        title: 'Create Operations',
        icon: <Plus className="w-5 h-5" />,
        status: 'locked',
        description: 'Operasi pembuatan data dalam OOP'
      },
      {
        id: 'l3-a2',
        title: 'Read Operations',
        icon: <Eye className="w-5 h-5" />,
        status: 'locked',
        description: 'Operasi pembacaan data dalam OOP'
      },
      {
        id: 'l3-a3',
        title: 'Update Operations',
        icon: <RefreshCw className="w-5 h-5" />,
        status: 'locked',
        description: 'Operasi pembaruan data dalam OOP'
      },
    ],
  },
]

const skkniLevels: AssessmentLevel[] = [
  {
    id: 4,
    levelNumber: 1,
    title: 'Level 1',
    description: 'Basic OOP',
    icon: <Folder className="w-6 h-6" />,
    bgColor: 'bg-green-50',
    assessments: [
      {
        id: 'skkni-1-1',
        title: 'Assessment',
        icon: <CheckCircle className="w-5 h-5" />,
        status: 'completed',
      },
    ],
  },
  {
    id: 5,
    levelNumber: 2,
    title: 'Level 2',
    description: 'Class & Object Implementation',
    icon: <BarChart3 className="w-6 h-6" />,
    bgColor: 'bg-blue-50',
    assessments: [
      {
        id: 'skkni-2-1',
        title: 'Assessment',
        icon: <Clock className="w-5 h-5" />,
        status: 'in-progress',
      },
    ],
  },
  {
    id: 6,
    levelNumber: 3,
    title: 'Level 3',
    description: 'Encapsulation & Integration',
    icon: <Lock className="w-6 h-6" />,
    bgColor: 'bg-purple-50',
    assessments: [
      {
        id: 'skkni-3-1',
        title: 'Assessment',
        icon: <Lock className="w-5 h-5" />,
        status: 'locked',
      },
    ],
  },
]

export default function AssesmentPage() {
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())
  const dynamicAssessmentLevels: AssessmentLevel[] = [
    {
      id: 1,
      levelNumber: 1,
      title: 'LEVEL 1 - Dasar OOP',
      description: 'Mengukur Pengetahuan Dasar Class dan Object',
      icon: <Folder className="w-6 h-6" />,
      assessments: [
        {
          id: 'l1-a1',
          title: 'Konsep Class dan Object',
          icon: <Layers className="w-5 h-5" />,
          status: 'completed',
          description: 'Memahami dasar-dasar class dan object dalam OOP'
        },
        {
          id: 'l1-a2',
          title: 'Constructor dan Destructor',
          icon: <Settings className="w-5 h-5" />,
          status: 'in-progress',
          description: 'Pelajari cara membuat dan menghancurkan objek'
        },
        {
          id: 'l1-a3',
          title: 'Properties dan Methods',
          icon: <Zap className="w-5 h-5" />,
          status: 'locked',
          description: 'Menguasai atribut dan fungsi dalam class'
        },
      ],
    },
    {
      id: 2,
      levelNumber: 2,
      title: 'LEVEL 2 - Struktur dan Komponen OOP',
      description: 'Mengukur pemahaman tentang struktur dan komponen dalam OOP',
      icon: <BarChart3 className="w-6 h-6" />,
      assessments: [
        {
          id: 'l2-a1',
          title: 'Inheritance',
          icon: <GitBranch className="w-5 h-5" />,
          status: 'locked', // Locked because level 1 not fully completed
          description: 'Konsep pewarisan dalam OOP'
        },
        {
          id: 'l2-a2',
          title: 'Polymorphism',
          icon: <Shuffle className="w-5 h-5" />,
          status: 'locked',
          description: 'Kemampuan objek untuk memiliki banyak bentuk'
        },
        {
          id: 'l2-a3',
          title: 'Encapsulation',
          icon: <Shield className="w-5 h-5" />,
          status: 'locked',
          description: 'Menyembunyikan detail implementasi'
        },
      ],
    },
    {
      id: 3,
      levelNumber: 3,
      title: 'LEVEL 3 - CRUD dalam OOP',
      description: 'Mengukur pemahaman tentang operasi Create, Read, Update, dan Delete',
      icon: <Code2 className="w-6 h-6" />,
      assessments: [
        {
          id: 'l3-a1',
          title: 'Create Operations',
          icon: <Plus className="w-5 h-5" />,
          status: 'locked',
          description: 'Operasi pembuatan data dalam OOP'
        },
        {
          id: 'l3-a2',
          title: 'Read Operations',
          icon: <Eye className="w-5 h-5" />,
          status: 'locked',
          description: 'Operasi pembacaan data dalam OOP'
        },
        {
          id: 'l3-a3',
          title: 'Update Operations',
          icon: <RefreshCw className="w-5 h-5" />,
          status: 'locked',
          description: 'Operasi pembaruan data dalam OOP'
        },
      ],
    },
  ]

  const handleStartAssessment = (assessment: Assessment) => {
    console.log(`Starting assessment: ${assessment.title}`)
    // TODO: Navigate to assessment page or open modal
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Skill Competency Assessment
          </h1>
          <p className="text-slate-600 text-base">
            Evaluasi pemahaman Anda melalui tes yang terstruktur.
          </p>
        </div>

        {/* Assessment Levels Section */}
        <div className="space-y-8 mb-12">
          {dynamicAssessmentLevels.map((level, levelIndex) => (
            <div key={level.id} className="animate-fade-in" style={{ animationDelay: `${levelIndex * 100}ms` }}>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  {level.title}
                </h2>
                <p className="text-sm text-slate-600">
                  {level.description}
                </p>
              </div>

              {/* Assessments Grid */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {level.assessments.slice(0, expandedLevels.has(level.id) ? undefined : 3).map((assessment, assessIndex) => (
                    <div
                      key={assessment.id}
                      style={{ animationDelay: `${levelIndex * 100 + assessIndex * 50}ms` }}
                    >
                      <AssessmentCard
                        assessment={assessment}
                        onStart={handleStartAssessment}
                      />
                    </div>
                  ))}
                </div>
                {level.assessments.length > 3 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedLevels)
                        if (newExpanded.has(level.id)) {
                          newExpanded.delete(level.id)
                        } else {
                          newExpanded.add(level.id)
                        }
                        setExpandedLevels(newExpanded)
                      }}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      {expandedLevels.has(level.id) ? 'Tampilkan lebih sedikit' : 'Lihat lebih banyak'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Section 1: Skill Development with Status */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 md:p-10 mb-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                ⚙️ Skill Development (Integrated SKKNI)
              </h2>
              <p className="text-slate-600 text-sm md:text-base">
                Competency-based progression aligned with SKKNI standards.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-yellow-200 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
              ⭐ SKKNI standard
            </div>
          </div>

          {/* Skill Level Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skkniLevels.map((level, index) => (
              <div
                key={level.id}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <SKKNILevelCard level={level} style="colored" />
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}

