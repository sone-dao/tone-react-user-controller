import useToneApi from '@sone-dao/tone-react-api'
import { useRouter } from 'next/router'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface IUser {
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

const userDefaults = {
  userId: '',
  display: '',
  playlists: [],
  friends: [],
  subscribedTo: [],
  balance: 0,
  roles: {},
  isLoggedIn: false,
}

interface IUserContext {
  user: IUser
  setUser: Function
}

const userContextDefaults: IUserContext = {
  user: userDefaults,
  setUser: () => {},
}

const UserContext = createContext<IUserContext>(userContextDefaults)

export const useUserContext = () => useContext(UserContext)

interface IUserProviderProps {
  children: React.ReactNode
}

const UserProvider: React.FC<IUserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser>(userDefaults)

  const router = useRouter()

  useEffect(() => {
    if (!user.userId && localStorage.getItem('tone.session')) {
      // Assumes the user just dropped onto the page for the first time
      authUser()
    } else {
      checkToken()
    }
  }, [router])

  useEffect(() => {
    console.log(user)
  }, [user])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )

  async function checkToken() {
    const sessionToken = localStorage.getItem('tone.session') || null

    if (!sessionToken) return logoutUser()

    await fetch('https://api.tone.audio/auth/token', {
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

    setUser({
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
    setUser({ ...user, isLoggedIn: false })
  }
}

export default UserProvider
