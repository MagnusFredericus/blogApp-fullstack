import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useRefreshToken from '../../hooks/useRefreshToken'
import useAuth from '../../hooks/useAuth'
import useLocalStorage from '../../hooks/useLocalStorage'

const PersistLogin = () => {
    const { auth } = useAuth()
    const refresh = useRefreshToken()
    const [persist] = useLocalStorage('persist', false)

    useEffect(() => {
        let isMounted = true

        const verifyRefreshToken = async() => {
            try {
                await refresh()
            } catch(e) {
                console.log(e)
            }
        }

        if(!auth?.accessToken && persist) {
            verifyRefreshToken()
        }
        return () => isMounted = false
    }, [])

    return <Outlet />
}

export default PersistLogin;