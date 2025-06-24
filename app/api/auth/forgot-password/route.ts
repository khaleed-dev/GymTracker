import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { addMinutes } from 'date-fns'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'No user with that email' }, { status: 404 })
  }
  const token = uuidv4()
  const expires = addMinutes(new Date(), 30)
  await prisma.passwordResetToken.create({ data: { userId: user.id, token, expires } })
  // TODO: Send email. For now, log the reset link:
  console.log(`Reset link: http://localhost:3000/auth/reset-password?token=${token}`)
  return NextResponse.json({ success: true })
} 