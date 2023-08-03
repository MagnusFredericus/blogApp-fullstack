import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAxiosAuth from '../../hooks/useAxiosAuth'
import './postForm.css'
import urls from '../../api/urls'

function PostForm() {
    const titleRef = useRef()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const axiosAuth = useAxiosAuth()
    const navigate = useNavigate()

    useEffect(() => {
        titleRef.current.focus()
    }, [])

    const titleHandler = (e) => {
        setTitle(e.target.value)
    }

    const contentHandler = (e) => {
        setContent(e.target.value)
    }

    const formHandler = async (e) => {
        e.preventDefault()

        try{
            const resp = await axiosAuth.post(urls.apiPostsCreate,
                JSON.stringify({title:title, content:content})
                )
            navigate('/posts/' + resp.data.id)
            
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="postFormContainer">
            <form 
                className='postFormContainer-postForm' 
                onSubmit={ formHandler } 
                method='post'>
                    <input 
                        className='postForm-title'
                        name='title'
                        type='text'
                        placeholder='Title'
                        ref={ titleRef }
                        value={ title }
                        onChange={ titleHandler }
                    />
                    <textarea
                        className='postForm-content'
                        name='content'
                        type='text'
                        placeholder='Content'
                        value={ content }
                        onChange={ contentHandler }
                    />
                    <input 
                        className='button button--end'
                        type='submit' 
                        value='Send'></input>
            </form>
        </div>
    )
}

export default PostForm;