import { pub, sub, unsub } from '@sone-dao/sone-react-utils'
import { useEffect, useState } from 'react'
import { IUser, userDefaults } from './UserController'

export default function useUserData() {
  const [user, setUser] = useState<IUser>(userDefaults)

  useEffect(() => {
    sub('__TONE_USER__', 'set', (user: IUser) => setUser(user))
    pub('__TONE_USER__', 'get')

    return () => unsub('__TONE_USER__', 'set', (user: IUser) => setUser(user))
  }, [])

  useEffect(() => {
    pub('__TONE_USER__', 'set', user)
  }, [user])

  return { user, setUser }
}
