'use client'

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import { useSession } from 'next-auth/react'

interface CheckIn {
  id: string
  date: string
  time: string | null
  user: {
    name: string
  }
}

export interface GymCalendarRef {
  refresh: () => void
}

export const GymCalendar = forwardRef<GymCalendarRef>((props, ref) => {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date())
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const fetchCheckIns = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/checkin?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`
      )
      if (response.ok) {
        const data = await response.json()
        setCheckIns(data.checkIns)
      }
    } catch (error) {
      console.error('Failed to fetch check-ins:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refresh: fetchCheckIns
  }))

  useEffect(() => {
    fetchCheckIns()
  }, [currentDate])

  const getCheckInsForDay = (day: Date) => {
    return checkIns.filter(checkIn => 
      isSameDay(new Date(checkIn.date), day)
    )
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDeleteCheckIn = async (date: string) => {
    if (!window.confirm('Remove your check-in for this day?')) return;
    try {
      const res = await fetch(`/api/checkin?date=${date}`, { method: 'DELETE' })
      if (res.ok) {
        fetchCheckIns()
      }
    } catch {}
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gym Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading calendar...</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 min-w-[600px] sm:min-w-0">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  className="text-center font-semibold text-xs sm:text-sm text-gray-500 p-1 sm:p-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map(day => {
                const dayCheckIns = getCheckInsForDay(day)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 border rounded-lg flex flex-col items-center
                      ${!isSameMonth(day, currentDate) ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                      ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                  >
                    <div className="text-xs sm:text-sm font-medium mb-1">
                      {format(day, 'd')}
                    </div>
                    {dayCheckIns.length > 0 && (
                      <div className="flex flex-col gap-1 w-full">
                        {dayCheckIns.map(checkIn => (
                          <div
                            key={checkIn.id}
                            className="flex flex-col items-center justify-center text-[11px] bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-1 py-0 rounded-md border border-green-200 max-w-[110px] min-w-[70px] mx-auto"
                            style={{ fontFamily: 'Inter, sans-serif', marginTop: '2px', marginBottom: '2px' }}
                          >
                            <span
                              className="truncate w-full text-center font-medium"
                              title={checkIn.user.name}
                              style={{ maxWidth: 90 }}
                            >
                              {checkIn.user.name}
                            </span>
                            <span
                              className="font-mono text-green-700 text-[10px] w-full text-center"
                              style={{ letterSpacing: '0.02em' }}
                            >
                              {checkIn.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

GymCalendar.displayName = 'GymCalendar'