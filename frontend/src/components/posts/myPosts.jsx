import { useState, useEffect } from "react";
import urls from "../../api/urls";
import PostListItem from './postsListItem'

import useAuth from "../../hooks/useAuth";
import axios from "../../api/axios";

function MyPosts() {
    const { auth } = useAuth()
    const [posts, setPosts] = useState([])

    useEffect(() => {

        const getPosts = async () => {
            try {
                const resp = await axios.get(urls.apiPostsByUserId + auth.id)
                resp.status===200 ? setPosts(resp.data) : setPosts([])
            } catch(error) {
                console.log(error)
            }
        }

        getPosts()
    }, [])

    return (
        <>
        <div>
            <div>
                { 
                posts.map((post => {return (<PostListItem post={ post }/>)}))
                }
            </div>
        </div>
        </>
    )
}

export default MyPosts;