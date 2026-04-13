'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, RotateCcw, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useParams } from 'next/navigation'
import { assessmentDatabase, type AssessmentData, type Question } from '@/lib/assessment-data'

export default function AssessmentPage() {
  const params = useParams()
  const slug = params.slug as string

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [completedAssessments, setCompletedAssessments] = useState<Record<string, any>>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [isViewingCompletedAnswers, setIsViewingCompletedAnswers] = useState(false)

  const assessment = assessmentDatabase[slug] || assessmentDatabase['l1-a1']
  const [timeRemaining, setTimeRemaining] = useState(assessment.timeLimit * 60)
  const currentQuestion = assessment.questions[currentQuestionIndex]
  const progressPercentage = ((currentQuestionIndex + 1) / assessment.totalQuestions) * 100

  // Load completion status dari localStorage
  useEffect(() => {
    const stored = localStorage.getItem('completedAssessments')
    if (stored) {
      setCompletedAssessments(JSON.parse(stored))
    }
    setIsLoaded(true)
  }, [])

  // Check if assessment is already completed
  const isAssessmentCompleted = completedAssessments[slug]

  // Timer logic
  useEffect(() => {
    if (!isStarted || showResults) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          setShowResults(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isStarted, showResults])

  const handleSelectAnswer = (optionId: string) => {
    if (!showResults && !isViewingCompletedAnswers) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: optionId,
      })
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < assessment.totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = () => {
    // Save completion status
    const updatedCompletions = {
      ...completedAssessments,
      [slug]: {
        completed: true,
        timestamp: new Date().toISOString(),
        answers: answers,
        score: calculateScore(),
        totalQuestions: assessment.totalQuestions,
        timeSpent: assessment.timeLimit * 60 - timeRemaining,
      }
    }
    setCompletedAssessments(updatedCompletions)
    localStorage.setItem('completedAssessments', JSON.stringify(updatedCompletions))
    setShowResults(true)
  }

  const handleConfirmSubmit = () => {
    toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Konfirmasi Selesai
          </h3>
          <p className="text-slate-600 mb-6">
            Apakah Anda yakin ingin menyelesaikan ujian ini? Anda tidak akan dapat mengerjakan ulang setelah ini.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                toast.dismiss(t)
              }}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Batal
            </button>
            <button
              onClick={() => {
                toast.dismiss(t)
                handleSubmit()
              }}
              className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Ya, Selesai
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
      }
    )
  }

  const handleReset = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setShowResults(false)
    setTimeRemaining(assessment.timeLimit * 60)
    setIsStarted(false)
  }

  const calculateScore = () => {
    let correct = 0
    assessment.questions.forEach((question: Question) => {
      if (answers[question.id] === question.correctAnswer) {
        correct++
      }
    })
    return correct
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Completed Assessment View
  if (isLoaded && isAssessmentCompleted && !isStarted) {
    const completedData = completedAssessments[slug]
    const percentage = Math.round((completedData.score / assessment.totalQuestions) * 100)
    const isPassed = percentage >= 60
    const completedDate = new Date(completedData.timestamp).toLocaleDateString('id-ID')

    return (
      <div className="min-h-screen bg-linear-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white shadow-2xl">
          <div className="p-8 md:p-12 text-center">
            {/* Completed Icon */}
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-blue-100">
              <CheckCircle2 className="w-12 h-12 text-blue-600" />
            </div>

            {/* Status Title */}
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Assessment Sudah Diselesaikan
            </h1>
            <p className="text-slate-600 mb-8">
              Anda telah menyelesaikan assessment ini pada {completedDate}
            </p>

            {/* Assessment Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">{assessment.title}</h2>
              
              {/* Score Display */}
              <div className="mb-6">
                <div className="text-5xl font-bold text-blue-600 mb-2">{percentage}%</div>
                <div className="text-slate-600 mb-4">
                  Skor: {completedData.score} / {assessment.totalQuestions} Benar
                </div>
                <div className="bg-slate-200 rounded-full h-3 w-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Score Details */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{completedData.score}</div>
                  <div className="text-xs text-slate-600 mt-1">Benar</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-600">
                    {assessment.totalQuestions - completedData.score}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">Salah</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.floor(completedData.timeSpent / 60)}m
                  </div>
                  <div className="text-xs text-slate-600 mt-1">Waktu</div>
                </div>
              </div>

              {/* Result Status */}
              <div className={`p-4 rounded-lg ${isPassed ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                <p className={`font-semibold ${isPassed ? 'text-green-700' : 'text-orange-700'}`}>
                  {isPassed ? '✓ Anda telah lulus assessment ini' : '⚠ Anda belum mencapai nilai kelulusan (≥60%)'}
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Catatan:</strong> Anda tidak dapat mengerjakan assessment ini lagi. Assessment hanya dapat dikerjakan satu kali.
              </p>
            </div>

            {/* Action Button */}
            <Button
              onClick={() => window.location.href = '/assesmen'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300"
            >
              Kembali ke Assessment
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // Start Screen
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white shadow-2xl">
          <div className="p-8 md:p-12">
            {/* Header Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title and Description */}
            <h1 className="text-4xl font-bold text-center text-slate-900 mb-3">
              {assessment.title}
            </h1>
            <p className="text-center text-slate-600 mb-8 text-lg">
              {assessment.description}
            </p>

            {/* Assessment Info */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {assessment.totalQuestions}
                </div>
                <div className="text-sm text-slate-600">Total Pertanyaan</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {assessment.timeLimit}
                </div>
                <div className="text-sm text-slate-600">Menit</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-slate-900 mb-3">Instruksi:</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-blue-600 shrink-0">1.</span>
                  <span>Baca setiap pertanyaan dengan cermat</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-blue-600 shrink-0">2.</span>
                  <span>Pilih salah satu jawaban yang paling tepat</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-blue-600 shrink-0">3.</span>
                  <span>Anda dapat kembali ke pertanyaan sebelumnya</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-blue-600 shrink-0">4.</span>
                  <span>Jawab semua pertanyaan sebelum submit</span>
                </li>
              </ul>
            </div>

            {/* Start Button */}
            <Button
              onClick={() => setIsStarted(true)}
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-6 text-lg rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Mulai Assessment
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Results Screen - After Submission
  if (showResults && isStarted) {
    const score = calculateScore()
    const percentage = Math.round((score / assessment.totalQuestions) * 100)
    const isPassed = percentage >= 60

    return (
      <div className="min-h-screen bg-linear-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white shadow-2xl">
          <div className="p-8 md:p-12 text-center">
            {/* Score Icon */}
            <div
              className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isPassed
                  ? 'bg-green-100'
                  : 'bg-orange-100'
              }`}
            >
              {isPassed ? (
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              ) : (
                <RotateCcw className="w-12 h-12 text-orange-600" />
              )}
            </div>

            {/* Result Title */}
            <h1 className={`text-4xl font-bold mb-4 ${
              isPassed ? 'text-green-600' : 'text-orange-600'
            }`}>
              {isPassed ? 'Luar Biasa! 🎉' : 'Selesai'}
            </h1>

            <p className="text-xl text-slate-700 mb-8">
              {isPassed
                ? 'Anda telah berhasil menyelesaikan assessment ini!'
                : 'Assessment telah selesai. Silahkan cek hasil Anda.'}
            </p>

            {/* Score Display */}
            <div className="mb-8">
              <div className="text-6xl font-bold text-blue-600 mb-2">{percentage}%</div>
              <div className="text-slate-600 mb-4">
                Skor: {score} / {assessment.totalQuestions} Benar
              </div>
              <div className="bg-slate-100 rounded-full h-3 w-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isPassed ? 'bg-green-600' : 'bg-orange-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Score Details */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-xs text-slate-600 mt-1">Benar</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {assessment.totalQuestions - score}
                </div>
                <div className="text-xs text-slate-600 mt-1">Salah</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.floor((assessment.timeLimit * 60 - timeRemaining) / 60)}m
                </div>
                <div className="text-xs text-slate-600 mt-1">Waktu</div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Informasi:</strong> Assessment ini sudah diselesaikan. Anda tidak dapat mengerjakan ulang, tetapi dapat melihat jawaban dan penjelasan.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setShowResults(false)
                  setCurrentQuestionIndex(0)
                  setIsViewingCompletedAnswers(true)
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300"
              >
                Lihat Jawaban & Pembahasan
              </Button>
              <Button
                onClick={() => window.location.href = '/assesmen'}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-3 rounded-lg transition-all duration-300"
              >
                Kembali ke Assessment
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Quiz Screen
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {assessment.title}
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-slate-400">
                Pertanyaan {currentQuestionIndex + 1} dari {assessment.totalQuestions}
              </p>
              {isViewingCompletedAnswers && (
                <span className="px-2 py-1 bg-blue-500/30 text-blue-300 text-xs font-semibold rounded">
                  Mode Viewing
                </span>
              )}
            </div>
          </div>
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-lg ${
              timeRemaining < 300
                ? 'bg-red-500/20 text-red-300'
                : 'bg-blue-500/20 text-blue-300'
            }`}
          >
            <Clock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-slate-400 text-right">
            {Math.round(progressPercentage)}% Selesai
          </p>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-4xl mx-auto mb-8">
        <Card className="bg-white shadow-2xl">
          <div className="p-8 md:p-10">
            {/* Question Number Badge */}
            <div className="inline-block bg-linear-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
              Soal {currentQuestionIndex + 1}
            </div>

            {/* Question Text */}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 leading-tight">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option: {id: string, text: string}, index: number) => {
                const isSelected = answers[currentQuestion.id] === option.id
                const isCorrect = option.id === currentQuestion.correctAnswer
                const showCorrectAnswer = showResults || isViewingCompletedAnswers

                let optionClasses =
                  'relative p-4 border-2 rounded-lg transition-all duration-300'
                
                // Set cursor based on viewing mode
                if (isViewingCompletedAnswers) {
                  optionClasses += ' cursor-not-allowed'
                } else {
                  optionClasses += ' cursor-pointer hover:border-blue-500'
                }

                if (showCorrectAnswer) {
                  if (isCorrect) {
                    optionClasses += ' border-green-500 bg-green-50'
                  } else if (isSelected && !isCorrect) {
                    optionClasses += ' border-red-500 bg-red-50'
                  } else {
                    optionClasses += ' border-slate-200 bg-slate-50'
                  }
                } else {
                  if (isSelected) {
                    optionClasses += ' border-blue-600 bg-blue-50'
                  } else {
                    optionClasses += ' border-slate-200 bg-slate-50 hover:bg-blue-50'
                  }
                }

                return (
                  <div
                    key={option.id}
                    onClick={() => handleSelectAnswer(option.id)}
                    className={optionClasses}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-slate-300 bg-white'
                        } ${
                          showCorrectAnswer && isCorrect
                            ? 'border-green-600 bg-green-600'
                            : ''
                        } ${
                          showCorrectAnswer && isSelected && !isCorrect
                            ? 'border-red-600 bg-red-600'
                            : ''
                        }`}
                      >
                        {isSelected && (
                          <div
                            className={`w-2 h-2 rounded-full ${
                              showCorrectAnswer && !isCorrect
                                ? 'bg-red-600'
                                : 'bg-white'
                            }`}
                          ></div>
                        )}
                        {showCorrectAnswer && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            isSelected
                              ? 'text-slate-900'
                              : 'text-slate-700'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}.{' '}
                          {option.text}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Viewing Mode Warning */}
            {isViewingCompletedAnswers && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-semibold text-amber-900">
                  🔒 Anda sedang melihat jawaban dalam mode viewing. Jawaban tidak dapat diubah.
                </p>
              </div>
            )}

            {/* Explanation */}
            {showResults && currentQuestion.explanation && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">💡 Penjelasan:</p>
                <p className="text-slate-700">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isViewingCompletedAnswers}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          <ChevronLeft className="w-5 h-5" />
          Sebelumnya
        </Button>

        <div className="flex flex-wrap gap-2 justify-center">
          {assessment.questions.map((_: Question, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-lg font-bold transition-all duration-300 ${
                index === currentQuestionIndex
                  ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white scale-110'
                  : answers[assessment.questions[index].id]
                  ? 'bg-green-500 text-white hover:scale-110'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {isViewingCompletedAnswers ? (
          <Button
            onClick={() => {
              setShowResults(true)
              setIsViewingCompletedAnswers(false)
            }}
            className="flex items-center gap-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <CheckCircle2 className="w-5 h-5" />
            Kembali ke Hasil
          </Button>
        ) : currentQuestionIndex === assessment.totalQuestions - 1 ? (
          <Button
            onClick={handleConfirmSubmit}
            className="flex items-center gap-2 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <CheckCircle2 className="w-5 h-5" />
            Selesai
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={isViewingCompletedAnswers}
            className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Selanjutnya
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
