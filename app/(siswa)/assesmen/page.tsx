'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set())
  const [completedAssessments, setCompletedAssessments] = useState<Record<string, any>>({})

  // Load completion status dari localStorage
  useEffect(() => {
    const stored = localStorage.getItem('completedAssessments')
    console.log('Loading from localStorage:', stored)
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('Parsed data:', parsed)
      setCompletedAssessments(parsed)
    }
  }, [])

  // Log untuk debug
  useEffect(() => {
    console.log('=== DEBUG LOG ===')
    console.log('completedAssessments updated:', completedAssessments)
    console.log('L1-A1 completed?', completedAssessments['l1-a1']?.completed)
    console.log('L1-A2 completed?', completedAssessments['l1-a2']?.completed)
    console.log('L1-A3 completed?', completedAssessments['l1-a3']?.completed)
    
    // Test checkPrerequisites for L2-A1
    const prerequisites = ['l1-a1', 'l1-a2', 'l1-a3']
    const allL1Complete = prerequisites.every(prereq => completedAssessments[prereq]?.completed === true)
    console.log('All L1 complete?', allL1Complete)
    console.log('=== END DEBUG LOG ===')
  }, [completedAssessments])

  // Assessment level prerequisites - level based unlock
  // Level 1 semua terbuka, Level 2 buka jika semua L1 selesai, Level 3 buka jika semua L2 selesai
  const assessmentPrerequisites: Record<string, string[]> = {
    // Level 1 - All open, no prerequisites
    'l1-a1': [],
    'l1-a2': [],
    'l1-a3': [],
    // Level 2 - Requires all Level 1 completed
    'l2-a1': ['l1-a1', 'l1-a2', 'l1-a3'],
    'l2-a2': ['l1-a1', 'l1-a2', 'l1-a3'],
    'l2-a3': ['l1-a1', 'l1-a2', 'l1-a3'],
    // Level 3 - Requires all Level 2 completed
    'l3-a1': ['l2-a1', 'l2-a2', 'l2-a3'],
    'l3-a2': ['l2-a1', 'l2-a2', 'l2-a3'],
    'l3-a3': ['l2-a1', 'l2-a2', 'l2-a3'],
  }

  // Check if assessment prerequisites are met
  const checkPrerequisites = (assessmentId: string): boolean => {
    const prerequisites = assessmentPrerequisites[assessmentId]
    if (!prerequisites || prerequisites.length === 0) {
      return true // No prerequisites, so it's allowed
    }
    const allMet = prerequisites.every((prereq) => {
      const isComplete = completedAssessments[prereq]?.completed
      console.log(`Checking ${assessmentId}: prerequisite ${prereq} = ${isComplete}`)
      return isComplete
    })
    console.log(`Assessment ${assessmentId} prerequisites met: ${allMet}`)
    return allMet
  }

  // Update assessment status based on completion and prerequisites
  const getUpdatedStatus = (assessmentId: string, defaultStatus: 'completed' | 'in-progress' | 'locked') => {
    // If already completed, show completed
    if (completedAssessments[assessmentId]?.completed) {
      console.log(`${assessmentId} -> completed (already done)`)
      return 'completed'
    }
    
    // Check if prerequisites are met
    if (!checkPrerequisites(assessmentId)) {
      console.log(`${assessmentId} -> locked (prerequisites not met)`)
      return 'locked'
    }
    
    // If prerequisites are met and not completed yet, show in-progress
    console.log(`${assessmentId} -> in-progress (prerequisites met, ready to take)`)
    return 'in-progress'
  }

  const dynamicAssessmentLevels: AssessmentLevel[] = useMemo(() => [
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
          status: getUpdatedStatus('l1-a1', 'in-progress'),
          description: 'Memahami dasar-dasar class dan object dalam OOP'
        },
        {
          id: 'l1-a2',
          title: 'Constructor dan Destructor',
          icon: <Settings className="w-5 h-5" />,
          status: getUpdatedStatus('l1-a2', 'in-progress'),
          description: 'Pelajari cara membuat dan menghancurkan objek'
        },
        {
          id: 'l1-a3',
          title: 'Properties dan Methods',
          icon: <Zap className="w-5 h-5" />,
          status: getUpdatedStatus('l1-a3', 'in-progress'),
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
          status: getUpdatedStatus('l2-a1', 'locked'),
          description: 'Konsep pewarisan dalam OOP'
        },
        {
          id: 'l2-a2',
          title: 'Polymorphism',
          icon: <Shuffle className="w-5 h-5" />,
          status: getUpdatedStatus('l2-a2', 'locked'),
          description: 'Kemampuan objek untuk memiliki banyak bentuk'
        },
        {
          id: 'l2-a3',
          title: 'Encapsulation',
          icon: <Shield className="w-5 h-5" />,
          status: getUpdatedStatus('l2-a3', 'locked'),
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
          status: getUpdatedStatus('l3-a1', 'locked'),
          description: 'Operasi pembuatan data dalam OOP'
        },
        {
          id: 'l3-a2',
          title: 'Read Operations',
          icon: <Eye className="w-5 h-5" />,
          status: getUpdatedStatus('l3-a2', 'locked'),
          description: 'Operasi pembacaan data dalam OOP'
        },
        {
          id: 'l3-a3',
          title: 'Update Operations',
          icon: <RefreshCw className="w-5 h-5" />,
          status: getUpdatedStatus('l3-a3', 'locked'),
          description: 'Operasi pembaruan data dalam OOP'
        },
      ],
    },
  ], [completedAssessments])

  const handleStartAssessment = (assessment: Assessment) => {
    const slug = assessment.id.replace(/\s+/g, '-').toLowerCase()
    router.push(`/assesmen/${slug}`)
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
        <div className="bg-linear-to-r from-blue-100 to-purple-100 rounded-2xl p-8 md:p-10 mb-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
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

