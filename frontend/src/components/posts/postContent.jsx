import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth'
import './postContent.css'
import { useEffect, useState } from 'react';

function PostItem(data) {
    const { auth } = useAuth()
    const [date, setDate] = useState('')

    useEffect(() => {
        let d = new Date(data.date ? data.date : Date.now())
        setDate(d.toISOString().split('T')[0])
    }, [data])
    
    return (
        <div className='postDisplayContent'>
            <div className='postDisplayContent-postHeader'>
                <h2 className='h--hidden'>{ data.title }</h2>
                {
                    auth.id == data.id
                    ? 
                    <Link 
                        className='link editPostLink'
                        to={`/editpost/${data.postId}`}>Edit
                    </Link>
                    : ''
                }
            </div>
            <div className='postDisplayContent-postMetadata'>
                <Link className='link--undercover' to={ `/profile/${data.id}` }>
                    <p className='p--hidden'>
                    { 
                    data.author 
                    ? 
                    data.author 
                    : 
                    'User has no social name' }
                    </p>
                    <p>{ data.email }</p>
                </Link>
                <p>{ `Published ${date}` }</p>
            </div>
            <div className='postDisplayContent-content'>
                <p className='p--wrap p--keep-breakline'>
                    { data.content }
                </p>
            </div>
            <div className='postDisplayContent-panel'>
                <p>{ `Views ${ data.views? data.views : ''}, Likes ${ data.likes ? data.likes : ''}` }</p>
                <button 
                    disabled={ auth.id ? false : true }
                    onClick={ () => data.handleLike(data.postId) }>
                        Like
                </button>
            </div>
        </div>
    )
}

export default PostItem;