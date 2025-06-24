'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Clock } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'

const hours = Array.from({ length: 12 }, (_, i) => i + 1)
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'))
const ampm = ['AM', 'PM']

interface CheckInButtonProps {
  onCheckInSuccess?: () => void
}

export function CheckInButton({ onCheckInSuccess }: CheckInButtonProps) {
  const { data: session } = useSession();
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [period, setPeriod] = useState('AM')
  const [time, setTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [localTime, setLocalTime] = useState('')

  useEffect(() => {
    // On mount, check if the user has already checked in today
    const checkStatus = async () => {
      if (!session?.user?.id) return;
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const res = await fetch(`/api/checkin?month=${today.getMonth() + 1}&year=${today.getFullYear()}`)
      if (res.ok) {
        const data = await res.json()
        const todayStr = today.toISOString().slice(0, 10)
        const found = data.checkIns.some((c: any) => c.date.slice(0, 10) === todayStr && c.userId === session.user.id)
        setIsCheckedIn(found)
      }
    }
    checkStatus()
    // Local time updater
    const updateLocalTime = () => {
      const now = new Date()
      setLocalTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }))
    }
    updateLocalTime()
    const interval = setInterval(updateLocalTime, 1000)
    // Set initial workout time selection to local time (if not checked in)
    if (!isCheckedIn && format(new Date(), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
      const now = new Date()
      let h = now.getHours()
      const m = now.getMinutes()
      let period = 'AM'
      if (h >= 12) {
        period = 'PM'
        if (h > 12) h -= 12
      }
      if (h === 0) h = 12
      const hourStr = h.toString().padStart(2, '0')
      const roundedMinute = (Math.round(m / 5) * 5).toString().padStart(2, '0')
      setHour(hourStr)
      setMinute(roundedMinute)
      setPeriod(period)
      updateTime(hourStr, roundedMinute, period)
    }
    return () => clearInterval(interval)
  }, [session?.user?.id])

  // Update time string whenever dropdowns change
  const updateTime = (h: string, m: string, p: string) => {
    if (h && m && p) {
      setTime(`${h}:${m} ${p}`)
    } else {
      setTime('')
    }
  }

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHour(e.target.value)
    updateTime(e.target.value, minute, period)
  }
  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMinute(e.target.value)
    updateTime(hour, e.target.value, period)
  }
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value)
    updateTime(hour, minute, e.target.value)
  }

  const handleCheckIn = async () => {
    setIsLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ time })
      })
      const data = await response.json()
      if (response.ok) {
        setMessage('Successfully checked in for today! 💪')
        setIsCheckedIn(true)
        if (onCheckInSuccess) {
          setTimeout(() => {
            onCheckInSuccess()
          }, 100)
        }
      } else {
        setMessage(data.error || 'Something went wrong')
        // If already checked in, update state
        if (data.error && data.error.toLowerCase().includes('already checked in')) {
          setIsCheckedIn(true)
        }
      }
    } catch (error) {
      setMessage('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUncheckIn = async () => {
    setIsLoading(true)
    setMessage('')
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const res = await fetch(`/api/checkin?date=${today.toISOString()}`, { method: 'DELETE' })
      if (res.ok) {
        setIsCheckedIn(false)
        setMessage('Check-in removed.')
        if (onCheckInSuccess) {
          setTimeout(() => {
            onCheckInSuccess()
          }, 100)
        }
      } else {
        setMessage('Failed to remove check-in.')
      }
    } catch {
      setMessage('Failed to remove check-in.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Dumbbell className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Ready to Crush It?</CardTitle>
        <CardDescription>
          Track your gym session for today
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Workout Time (Optional)
          </Label>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <select
                className="border rounded-md p-2 text-sm"
                value={hour}
                onChange={handleHourChange}
                disabled={isCheckedIn}
              >
                <option value="">HH</option>
                {hours.map(h => (
                  <option key={h} value={h.toString().padStart(2, '0')}>{h.toString().padStart(2, '0')}</option>
                ))}
              </select>
              <span className="self-center">:</span>
              <select
                className="border rounded-md p-2 text-sm"
                value={minute}
                onChange={handleMinuteChange}
                disabled={isCheckedIn}
              >
                <option value="">MM</option>
                {minutes.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                className="border rounded-md p-2 text-sm"
                value={period}
                onChange={handlePeriodChange}
                disabled={isCheckedIn}
              >
                {ampm.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-500 min-w-[80px] text-right">
              Local time: <span className="font-mono text-gray-700">{localTime}</span>
            </div>
          </div>
        </div>
        <Button 
          onClick={handleCheckIn} 
          disabled={isLoading || isCheckedIn}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 text-lg transition-all duration-200 transform hover:scale-105"
        >
          {isCheckedIn ? 'You have already checked in! ✅' : (isLoading ? 'Checking In...' : 'I went to the gym today! 💪')}
        </Button>
        {isCheckedIn && (
          <Button
            variant="outline"
            className="w-full border-red-400 text-red-600 hover:bg-red-50 mt-2"
            onClick={handleUncheckIn}
            disabled={isLoading}
          >
            Undo check-in
          </Button>
        )}
        {message && (
          <p className={`text-sm text-center ${
            message.includes('Successfully') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}