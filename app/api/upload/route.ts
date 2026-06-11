import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('[v0] Upload API called')
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('[v0] File received:', file?.name, file?.type, file?.size)

    if (!file) {
      console.log('[v0] No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      console.log('[v0] Invalid file type:', file.type)
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
    }

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('[v0] File too large:', file.size)
      return NextResponse.json({ error: 'El archivo es muy grande (max 10MB)' }, { status: 400 })
    }

    console.log('[v0] Uploading to Vercel Blob...')
    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
      access: 'public',
    })

    console.log('[v0] Upload successful:', blob.url)
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}
