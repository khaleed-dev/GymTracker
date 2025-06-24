import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()
  if (!token || !password) {
    return NextResponse.json({ error: 'Token and password required' }, { status: 400 })
  }
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!resetToken || resetToken.expires < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
  }
  await prisma.user.update({ where: { id: resetToken.userId }, data: { password: await hash(password, 12) } })
  await prisma.passwordResetToken.delete({ where: { token } })
  return NextResponse.json({ success: true })
} 