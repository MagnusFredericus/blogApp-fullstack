import { axiosAuth } from '../api/axios'
import { useEffect } from 'react'
import useRefreshToken from './useRefreshToken'
import useAuth from './useAuth'

const useAxiosAuth = () => {
    const refresh = useRefreshToken()
    const { auth } = useAuth()

    useEffect(() => {

        const requestIntercept = axiosAuth.interceptors.request.use(
            config => {
                if(!config.headers['Authorization']) {
                    config.headers['Authorization'] = `${auth?.accessToken}`
                }
                return config
            }, (error) => Promise.reject(error)
        )

        const responseIntercept = axiosAuth.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config
                if(error?.response?.status === 403 && !prevRequest?.sent) {
                    prevRequest.sent = true
                    const newAccessToken = await refresh()
                    prevRequest.headers['Authorization'] = `${ newAccessToken }`
                    return axiosAuth
                }
                return Promise.reject(error)
            }
        )

        return () => {
            axiosAuth.interceptors.request.eject(requestIntercept)
            axiosAuth.interceptors.response.eject(responseIntercept)
        }

    }, [auth, refresh])
    return axiosAuth
}

export default useAxiosAuth