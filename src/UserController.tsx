'use client'

import { pub, sub } from '@sone-dao/sone-react-utils'
import useToneApi from '@sone-dao/tone-react-api'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export interface IUser {
  userId: string
  display: string
  playlists: string[]
  friends: string[]
  subscribedTo: string[]
  balance: number
  roles?: {
    admin?: string
    owner?: string[]
    maintainer?: string[]
  }
  isLoggedIn: boolean
}

export const userDefaults = {
  userId: '',
  display: '',
  playlists: [],
  friends: [],
  subscribedTo: [],
  balance: 0,
  roles: {},
  isLoggedIn: false,
}

interface IUserControllerProps {
  children: React.ReactNode
}

export default function UserController({ children }: IUserControllerProps) {
  const [user, setUser] = useState<IUser>(userDefaults)

  const router = useRouter()

  useEffect(() => {
    sub('__TONE_USER__', 'set', (user: IUser) => setUser(user))
    sub('__TONE_USER__', 'get', () => pub('__TONE_USER__', 'set', user))
  }, [])

  useEffect(() => {
    if (!user.userId && localStorage.getItem('tone.session')) {
      // Assumes the user just dropped onto the page for the first time
      authUser()
    } else {
      checkToken()
    }
  }, [router])

  return <>{children}</>

  async function checkToken() {
    const sessionToken = localStorage.getItem('tone.session') || null

    if (!sessionToken) return logoutUser()

    await fetch('https://auth.tone.audio/token', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: sessionToken }),
    })
      .then((response) => response.json())
      .then((data) =>
        data.ok
          ? sessionStorage.setItem('tone.access', data.accessToken)
          : logoutUser()
      )
      .catch((error) => {
        console.log(error)
        logoutUser()
      })
  }

  async function authUser() {
    await checkToken()

    const api = useToneApi()
    const data = await api.user.get().catch((error) => console.log(error))

    const {
      userId,
      display,
      playlists,
      friends,
      subscribedTo,
      balance,
      roles,
    } = data.user

    pub('__TONE_USER__', 'set', {
      userId,
      display,
      playlists,
      friends,
      subscribedTo,
      balance,
      isLoggedIn: true,
      roles,
    })
  }

  function logoutUser() {
    pub('__TONE_USER__', 'set', { ...user, isLoggedIn: false })
  }
}
