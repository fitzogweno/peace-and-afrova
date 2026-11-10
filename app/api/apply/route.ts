import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use the service role key for server-side actions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // 1. Parse multipart/form-data (to handle the file)
    const formData = await req.formData()
    
    const job_id = formData.get('job_id') as string
    const full_name = formData.get('full_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const cover_letter = formData.get('cover_letter') as string
    const cvFile = formData.get('cv') as File | null

    // 2. Server-side Validation
    if (!job_id || !full_name || !email || !cover_letter) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    // Prevent spam/duplicate applications for the same job
    const { data: existing } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('email', email)
      .eq('job_id', job_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'You have already applied for this position.' }, { status: 400 })
    }

    // 3. Handle CV Upload (If provided)
    let cvUrl = null
    if (cvFile && cvFile.size > 0) {
      // Limit to 5MB
      if (cvFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'CV file is too large (max 5MB).' }, { status: 400 })
      }

      const fileExt = cvFile.name.split('.').pop()
      const fileName = `${job_id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const arrayBuffer = await cvFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError } = await supabaseAdmin.storage
        .from('cvs')
        .upload(fileName, buffer, {
          contentType: cvFile.type,
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get the public URL to save in the database
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('cvs')
        .getPublicUrl(fileName)

      cvUrl = publicUrlData.publicUrl
    }

    // 4. Insert into Database
    const { error: dbError } = await supabaseAdmin
      .from('applications')
      .insert({
        job_id,
        full_name,
        email,
        phone,
        cover_letter,
        cv_url: cvUrl // Save the link to the uploaded CV
      })

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Application API Error:", error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}