'use server'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

export async function login(formData: FormData) {
  const password = formData.get('password') as string

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Invalid password' }
  }

  const session = await getSession()
  session.isLoggedIn = true
  await session.save()

  redirect('/admin/channels')
}

export async function logout() {
  const session = await getSession()
  session.destroy()

  redirect('/admin/login')
}
