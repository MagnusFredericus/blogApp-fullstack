import axios from 'axios'
import urls from './urls'

export default axios.create({
    baseURL: urls.apiBaseURL,
    headers: {'Content-type': 'application/json'},
})

export const axiosAuth = axios.create({
    baseURL: urls.apiBaseURL,
    headers: {'Content-type': 'application/json'},
    withCredentials: true
})