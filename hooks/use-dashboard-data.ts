'use client'

import { useState, useEffect } from 'react'
import {
  materiService,
  assessmentService,
  pblService,
  authService,
  assessmentResultService,
} from '@/lib/api-services'

export interface DashboardData {
  userName: string
  userId: number
  materials: {
    total: number
    completed: number
    progress: number
    currentLesson?: any
    upcomingLessons: any[]
  }
  assessments: {
    total: number
    completed: number
    progress: number
    upcomingAssessments: any[]
  }
  pbl: {
    total: number
    completed: number
    progress: number
    upcomingCases: any[]
  }
  activities: any[]
  monthlyStats?: {
    month: string
    materi: number
    assesmen: number
  }[]
}

const emptyData: DashboardData = {
  userName: 'User',
  userId: 0,
  materials: {
    total: 0,
    completed: 0,
    progress: 0,
    upcomingLessons: [],
  },
  assessments: {
    total: 0,
    completed: 0,
    progress: 0,
    upcomingAssessments: [],
  },
  pbl: {
    total: 0,
    completed: 0,
    progress: 0,
    upcomingCases: [],
  },
  activities: [],
  monthlyStats: [
    { month: 'Jan', materi: 40, assesmen: 30 },
    { month: 'Feb', materi: 50, assesmen: 42 },
    { month: 'Mar', materi: 73, assesmen: 58 },
    { month: 'Apr', materi: 55, assesmen: 50 },
    { month: 'May', materi: 63, assesmen: 52 },
    { month: 'Jun', materi: 46, assesmen: 40 },
    { month: 'Jul', materi: 30, assesmen: 25 },
  ],
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch user data
        const userResponse = await authService.getCurrentUser()
        const userName = userResponse?.data?.name || 'User'

        // Fetch materials data using new /my-progress endpoint
        const progressResponse = await materiService.getMyProgress()
        const progressData = progressResponse?.data || progressResponse || {}

        // Extract data from progress response
        const userId = progressData.userId || (userResponse?.data?.id || 0)
        const totalLessons = progressData.totalLessons || 0
        const completedLessons = progressData.completedLessons || 0
        const materiProgress = progressData.progressPercentage || 0
        const allLevels = progressData.levels || []

        // Get all lessons list with level information
        const allLessonsList: any[] = []
        for (const level of allLevels) {
          if (level.lessons && Array.isArray(level.lessons)) {
            for (const lesson of level.lessons) {
              allLessonsList.push({
                ...lesson,
                level_number: level.level_number,
              })
            }
          }
        }

        const currentLesson = allLessonsList.find((l) => !l.completed)
        const upcomingLessons = allLessonsList.filter((l) => !l.completed).slice(0, 5)

        // Fetch assessments data
        const assessmentsResponse = await assessmentService.getAllAssessments(1, 100)
        const assessmentsData = assessmentsResponse?.data || []
        const assessmentResults = await assessmentResultService.getAllResults(1, 100)
        const resultsData = assessmentResults?.data || []

        const totalAssessments = assessmentsData.length
        const completedAssessments = resultsData.length
        const assessmentProgress =
          totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0

        // Fetch PBL data
        const pblResponse = await pblService.getAllCases(1, 100)
        const pblData = pblResponse?.data || []
        const pblSubmissions = await pblService.getSubmissions({ page: 1 })
        const submissionsData = pblSubmissions?.data || []

        const totalPBL = pblData.length
        const completedPBL = submissionsData.length
        const pblProgress = totalPBL > 0 ? Math.round((completedPBL / totalPBL) * 100) : 0

        // Filter upcoming PBL cases (not completed) and sort by deadline
        const upcomingPBLCases = pblData
          .filter((pbl: any) => pbl.status !== 'completed')
          .sort((a: any, b: any) => {
            const dateA = new Date(a.deadline || 0).getTime()
            const dateB = new Date(b.deadline || 0).getTime()
            return dateA - dateB
          })
          .slice(0, 5)

        // Add deadline info to assessments
        const assessmentsWithDeadline = assessmentsData.map((assessment: any, index: number) => ({
          ...assessment,
          // Generate deadline based on index (each one week apart starting from tomorrow)
          deadline: new Date(new Date().getTime() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        }))

        // Filter upcoming assessments (not completed) and sort by deadline
        const upcomingAssessmentsFiltered = assessmentsWithDeadline
          .filter((assessment: any) => !resultsData.find((r: any) => r.assessment_id === assessment.id))
          .sort((a: any, b: any) => {
            const dateA = new Date(a.deadline || 0).getTime()
            const dateB = new Date(b.deadline || 0).getTime()
            return dateA - dateB
          })
          .slice(0, 5)

        // Generate activities from multiple sources (Materi, PBL, Assessment)
        const activities: any[] = []
        let activityId = 1

        // Add lesson completion activities
        const completedLessonsData = allLessonsList
          .filter((l) => l.completed)
          .slice(0, 2)
          .map((lesson) => ({
            id: activityId++,
            type: 'check',
            title: `Completed Materi: ${lesson.title}`,
            desc: `${userName} completed lesson "${lesson.title}"`,
            time: '1 week ago',
          }))

        // Add PBL submission activities
        const pblActivities = submissionsData
          .slice(0, 2)
          .map((submission: any, index: number) => ({
            id: activityId++,
            type: 'book',
            title: `Submitted PBL: ${submission.case_id ? 'Case ' + submission.case_id : 'Task'}`,
            desc: `${userName} submitted a PBL case`,
            time: index === 0 ? '3 days ago' : '1 week ago',
          }))

        // Add assessment completion activities
        const assessmentActivities = resultsData
          .slice(0, 2)
          .map((result: any, index: number) => {
            const scores = ['Excellent', 'Good', 'Very Good']
            return {
              id: activityId++,
              type: 'trophy',
              title: `Assessment Complete: ${result.title || 'Assessment'}`,
              desc: `${userName} completed an assessment with ${scores[index] || 'Good'} score`,
              time: index === 0 ? '2 days ago' : '5 days ago',
            }
          })

        // Combine all activities and sort by time (most recent first)
        activities.push(...completedLessonsData, ...pblActivities, ...assessmentActivities)

        setData({
          userName,
          userId,
          materials: {
            total: totalLessons,
            completed: completedLessons,
            progress: materiProgress,
            currentLesson,
            upcomingLessons,
          },
          assessments: {
            total: totalAssessments,
            completed: completedAssessments,
            progress: assessmentProgress,
            upcomingAssessments: upcomingAssessmentsFiltered,
          },
          pbl: {
            total: totalPBL,
            completed: completedPBL,
            progress: pblProgress,
            upcomingCases: upcomingPBLCases,
          },
          activities,
          monthlyStats: emptyData.monthlyStats,
        })
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
        setData(emptyData)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return { data, loading, error }
}
