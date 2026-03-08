import { describe, it, expect, vi } from 'vitest'
import { sessionOptions } from '@/lib/auth/session'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(new Map())),
}))

// Mock iron-session
vi.mock('iron-session', () => ({
  getIronSession: vi.fn(() =>
    Promise.resolve({
      isLoggedIn: false,
      save: vi.fn(),
      destroy: vi.fn(),
    })
  ),
}))

describe('Session Configuration', () => {
  it('uses admin_session as cookie name', () => {
    expect(sessionOptions.cookieName).toBe('admin_session')
  })

  it('sets httpOnly cookie', () => {
    expect(sessionOptions.cookieOptions?.httpOnly).toBe(true)
  })

  it('sets sameSite to lax', () => {
    expect(sessionOptions.cookieOptions?.sameSite).toBe('lax')
  })

  it('sets maxAge to 30 days', () => {
    const thirtyDaysInSeconds = 60 * 60 * 24 * 30
    expect(sessionOptions.cookieOptions?.maxAge).toBe(thirtyDaysInSeconds)
  })
})

describe('Login Action', () => {
  it('returns error for invalid password', async () => {
    const { login } = await import('@/lib/actions/auth')

    const formData = new FormData()
    formData.set('password', 'wrong-password')

    const result = await login(formData)
    expect(result).toEqual({ error: 'Invalid password' })
  })

  it('saves session and redirects for valid password', async () => {
    const { getIronSession } = await import('iron-session')
    const { redirect } = await import('next/navigation')

    const mockSave = vi.fn()
    const mockSession = { isLoggedIn: false, save: mockSave, destroy: vi.fn() }
    vi.mocked(getIronSession).mockResolvedValueOnce(mockSession as never)

    // redirect throws in Next.js to stop execution
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    const { login } = await import('@/lib/actions/auth')

    const formData = new FormData()
    formData.set('password', 'test-password-123')

    await expect(login(formData)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockSession.isLoggedIn).toBe(true)
    expect(mockSave).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/admin/channels')
  })
})
