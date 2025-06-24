"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Trash2, Edit, Shield, Key } from "lucide-react"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  const [passwordChanges, setPasswordChanges] = useState<{[key: string]: string}>({})
  const [passwordLoading, setPasswordLoading] = useState<{[key: string]: boolean}>({})

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (res.ok) {
        setUsers(data.users)
      } else {
        setError(data.error || "Failed to fetch users.")
      }
    } catch (err) {
      setError("Failed to fetch users.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")
    setFormSuccess("")
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        setFormSuccess("User created!")
        setForm({ name: "", email: "", password: "", role: "user" })
        fetchUsers()
      } else {
        setFormError(data.error || "Failed to create user.")
      }
    } catch (err) {
      setFormError("Failed to create user.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      fetchUsers()
    } catch {}
  }

  const handlePasswordChange = async (userId: string) => {
    const newPassword = passwordChanges[userId]
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }

    setPasswordLoading(prev => ({ ...prev, [userId]: true }))
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, password: newPassword })
      })
      
      if (res.ok) {
        setPasswordChanges(prev => ({ ...prev, [userId]: "" }))
        alert("Password changed successfully!")
      } else {
        const data = await res.json()
        alert(data.error || "Failed to change password")
      }
    } catch (err) {
      alert("Failed to change password")
    } finally {
      setPasswordLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  const handlePasswordInputChange = (userId: string, value: string) => {
    setPasswordChanges(prev => ({ ...prev, [userId]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex flex-col items-center">
      <Card className="w-full max-w-4xl mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Admin User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={form.name} onChange={handleFormChange} placeholder="Full Name" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="Email" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" value={form.password} onChange={handleFormChange} placeholder="Password" required />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select id="role" name="role" value={form.role} onChange={handleFormChange} className="border rounded-md p-2 w-full">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" className="md:col-span-4 w-full" disabled={formLoading}>
              <UserPlus className="w-4 h-4 mr-2" />
              {formLoading ? "Creating..." : "Create User"}
            </Button>
          </form>
          {formError && <p className="text-red-600 text-sm mb-2">{formError}</p>}
          {formSuccess && <p className="text-green-600 text-sm mb-2">{formSuccess}</p>}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded-lg bg-white">
              <thead>
                <tr className="bg-blue-100">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Role</th>
                  <th className="p-2 text-left">Created</th>
                  <th className="p-2 text-left">New Password</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center p-4">Loading users...</td></tr>
                ) : error ? (
                  <tr><td colSpan={6} className="text-center text-red-600 p-4">{error}</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center p-4">No users found.</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="border-b">
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2 capitalize font-semibold {user.role === 'admin' ? 'text-blue-600' : ''}">{user.role}</td>
                      <td className="p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Input
                            type="password"
                            placeholder="New password"
                            value={passwordChanges[user.id] || ""}
                            onChange={(e) => handlePasswordInputChange(user.id, e.target.value)}
                            className="w-32"
                          />
                          <Button
                            size="sm"
                            onClick={() => handlePasswordChange(user.id)}
                            disabled={passwordLoading[user.id]}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            <Key className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-2 flex gap-2 justify-center">
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 