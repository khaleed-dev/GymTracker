'use client'

import { useRef } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { CheckInButton } from '@/components/dashboard/check-in-button'
import { GymCalendar, GymCalendarRef } from '@/components/calendar/gym-calendar'
import { Navbar } from '@/components/layout/navbar'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const calendarRef = useRef<GymCalendarRef>(null)

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 text-white">💪</div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect('/auth/signin')
  }

  const handleCheckInSuccess = () => {
    // Refresh the calendar when a check-in is successful
    if (calendarRef.current) {
      calendarRef.current.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to track your fitness journey?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="flex justify-center">
              <CheckInButton onCheckInSuccess={handleCheckInSuccess} />
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <GymCalendar ref={calendarRef} />
          </div>
        </div>
      </main>
    </div>
  )
}