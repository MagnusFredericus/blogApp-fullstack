import { useState, useEffect } from 'react'
import { Link, Outlet } from 'react-router-dom'
import axios from '../../api/axios'
import urls from '../../api/urls'
import NavBar from './navbar'
import Footer from './footer'
import TopPosts from '../posts/topPosts'
import ErrorBoundary from '../error/errorBoundary'
import './layout.css'

import useRefreshToken from '../../hooks/useRefreshToken'


const Layout = () => {
    const [topPosts, setTopPosts] = useState([])
    const refresh = useRefreshToken()

    useEffect(() => {
        const getTopPosts = async() => {
            try {
                const resp = await axios.get(urls.apiPostsMostRead)
                resp.status===200 ? setTopPosts(resp.data.slice(0,10)) : setTopPosts([])
            } catch(e) {
                console.log('error')
            }
        }

        const getAccessToken = async() => {
            refresh()
        }
        
        const interval = setInterval(async() => {
            const resp = await axios.get(urls.apiPostsMostRead)
            setTopPosts(resp.data.slice(0,10))
        }, 60 * 1000);

        getTopPosts()
        getAccessToken()
        return (() => clearInterval(interval))
    }, [])

    return (
        <div className='layout'>
            <div className='page'>
                <div className='logo'>
                    <h1><Link to='/'>JABlog</Link></h1>
                    <h5>Just another blog</h5>
                </div>
                <NavBar />
                <main>
                    <div className='mainBox'>
                        <ErrorBoundary>
                            <Outlet />
                        </ErrorBoundary>
                    </div>
                    <div className='sideBox'>
                        <ErrorBoundary>
                            <TopPosts topPosts={ topPosts }/>
                        </ErrorBoundary>
                    </div>
                    <div className='bottomBox'>
                        <ErrorBoundary>
                            <TopPosts topPosts={ topPosts }/>
                        </ErrorBoundary>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    )
}

export default Layout