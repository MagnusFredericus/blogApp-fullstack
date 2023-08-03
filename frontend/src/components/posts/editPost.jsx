import { useEffect, useState } from "react";
import useAxiosAuth from "../../hooks/useAxiosAuth";
import urls from "../../api/urls";
import { useNavigate, useParams } from "react-router-dom";
import './editPost.css'
import axios from "../../api/axios";

function EditPost() {
    const { postId } = useParams()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const axiosAuth = useAxiosAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const getPostData = async() => {
            const resp = await axios.get(urls.apiPostsById + postId)
            setTitle(resp.data.title)
            setContent(resp.data.content)
        }
        getPostData()
    }, [])

    const handleSubmit = async(e) => {
        e.preventDefault()
        try {
            await axiosAuth.put(urls.apiPostsUpdate + postId,
                JSON.stringify({
                    title:title,
                    content:content
                })
            )
        } catch(e) {
            console.log(e)
        }
        navigate(`/posts/${postId}`, {replace:true})
    }

    const handleCancel = async(e) => {
        navigate(`/posts/${postId}`, {replace:true})
    }

    const handleDelete = async(e) => {
        e.preventDefault()
        try {
            await axiosAuth.delete(urls.apiPostsDelete + postId)
            navigate('/myposts', {replace:true})
        } catch(e) {
            console.log(e)
        }
    }

    return (
        <div>
            <form 
                className="postForm"
                method='post'
                onSubmit={ handleSubmit }>
                    <input 
                        className="postForm-title"
                        name='title'
                        type='text' 
                        value={ title }
                        onChange={(e) => { setTitle(e.target.value) }}
                    />
                    <textarea
                        className="postForm-textarea"
                        name='content'
                        value={ content }
                        onChange={(e) => { setContent(e.target.value) }}
                    />
                    <div className="postForm-panel">
                        <button className="DeletePost" onClick={ handleDelete }>Delete</button>
                        <button className="EditPostButtons" onClick={ handleCancel }>Cancel</button>
                        <button className="EditPostButtons" type='submit'>Save</button>
                    </div>
            </form>
        </div>
    )
}

export default EditPost;