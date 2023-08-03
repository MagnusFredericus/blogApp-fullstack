import axios from '../api/axios'
import urls from '../api/urls'
import useAuth from './useAuth'
import jwt from 'jwt-decode'

const useRefreshToken = () => {
    const { auth, setAuth } = useAuth()

    const refresh = async () => {
        const resp = await axios.get(urls.apiAuthRefresh, {
            withCredentials: true
        })
        let decodedHeader = await jwt(resp?.data.accessToken)
        const id = decodedHeader.id
        setAuth({id:id, accessToken:resp.data.accessToken})
        
        return resp.data.accessToken
    }
    return refresh;
}

export default useRefreshToken