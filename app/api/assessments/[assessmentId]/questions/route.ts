import fs from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: { assessmentId: string } }) {
  try {
    const contentType = req.headers.get('content-type') || ''

    // Handle multipart/form-data (single question create with image OR image upload for existing question)
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const questionText = form.get('question')?.toString() || null
      const questionId = form.get('question_id')?.toString() || null
      const file = form.get('image') as File | null

      if (!file) {
        return NextResponse.json({ success: false, message: 'No image file provided' }, { status: 400 })
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'questions')
      fs.mkdirSync(uploadsDir, { recursive: true })

      const safeName = (file.name || 'upload').replace(/[^a-zA-Z0-9.\-_]/g, '-')
      const filename = `${Date.now()}-${safeName}`
      const filepath = path.join(uploadsDir, filename)

      fs.writeFileSync(filepath, buffer)
      const imagePath = `/uploads/questions/${filename}`

      if (questionId) {
        // Image upload for existing question
        return NextResponse.json({
          success: true,
          message: 'Image uploaded for question',
          data: { question_id: Number(questionId), image_path: imagePath },
        })
      }

      // Create new question with image
      const newId = Date.now()
      const created = {
        id: newId,
        question: questionText,
        assessment_id: Number(params.assessmentId),
        image_path: imagePath,
      }

      return NextResponse.json({ success: true, message: 'Question created', data: created })
    }

    // Handle JSON requests (single create or bulk create)
    const body = await req.json()

    // Bulk create
    if (body.questions && Array.isArray(body.questions)) {
      const created = body.questions.map((q: any, idx: number) => ({
        id: Date.now() + idx,
        question: q.text || q.question,
        assessment_id: Number(params.assessmentId),
      }))

      return NextResponse.json({
        success: true,
        message: 'Questions created successfully',
        data: { total_created: created.length, questions: created },
      })
    }

    // Single JSON create
    const id = Date.now()
    const created = {
      id,
      question: body.question || body.text || null,
      assessment_id: Number(params.assessmentId),
    }

    return NextResponse.json({ success: true, message: 'Question created', data: created })
  } catch (err) {
    console.error('API error (assessments/[assessmentId]/questions):', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
