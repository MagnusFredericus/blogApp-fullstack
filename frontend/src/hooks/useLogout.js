import useAxiosAuth from './useAxiosAuth'
import useAuth from './useAuth'
import urls from '../api/urls'

const useLogout = () => {
    const { setAuth } = useAuth()
    const axiosAuth = useAxiosAuth()

    const Logout = async() => {
        setAuth({})
        try {
            await axiosAuth.post(urls.apiAuthLogout)
        } catch(e) {
            console.log(e)
        }
    }
    return Logout;
}

export default useLogout;