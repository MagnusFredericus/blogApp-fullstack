import { useState, useEffect } from "react";
import PostListItem from "./postsListItem";
import './postsList.css'
import urls from "../../api/urls";
import axios from "../../api/axios";

function Posts() {
    const [posts, setPosts] = useState([])

    useEffect(() => {

        const getPosts = async () => {
            try {
                const resp = await axios.get(urls.apiPosts)
                resp.status===200 ? setPosts(resp.data) : setPosts([])
            } catch(error) {
                console.log(error)
            }
        }
        getPosts()
    }, [])

    return (
        <>
        <div >
            <div>
                {posts.map((post => {return (<PostListItem post={ post }/>)}))}
            </div>
        </div>
        </>
    )
}

export default Posts;