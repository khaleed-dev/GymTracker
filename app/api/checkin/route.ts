import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { time } = await req.json()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if user already checked in today
    const existingCheckIn = await prisma.checkIn.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    })

    if (existingCheckIn) {
      return NextResponse.json(
        { error: 'You have already checked in today' },
        { status: 400 }
      )
    }

    // Create check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        userId: session.user.id,
        date: today,
        time: time || null
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({ checkIn })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      )
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0)

    const checkIns = await prisma.checkIn.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json({ checkIns })
  } catch (error) {
    console.error('Get check-ins error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date')
    let date = new Date()
    if (dateParam) {
      date = new Date(dateParam)
      if (isNaN(date.getTime())) {
        console.error('Invalid date parameter:', dateParam)
        return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 })
      }
    }
    date.setHours(0, 0, 0, 0)

    // Log for debugging
    console.log('Attempting to delete check-in for user:', session.user.id, 'on date:', date)

    // Check if the record exists
    const existingCheckIn = await prisma.checkIn.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: date
        }
      }
    })

    if (!existingCheckIn) {
      return NextResponse.json({ error: 'Check-in not found for this date.' }, { status: 404 })
    }

    // Delete the check-in
    await prisma.checkIn.delete({
      where: {
        userId_date: {
          userId: session.user.id,
          date: date
        }
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Check-in DELETE handler error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}