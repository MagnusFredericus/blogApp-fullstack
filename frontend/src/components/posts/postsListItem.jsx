import { Link } from 'react-router-dom';
import './postsListItem.css'
import { useEffect, useState } from 'react';

function PostListItem(data) {
    const [date, setDate] = useState('')

    useEffect(() => {
        let d = new Date(data.post.createdAt ? data.post.createdAt : Date.now())
        setDate(d.toISOString().split('T')[0])
    }, [data])
    
    return (
        <div className='postItemDisplay'>
            <Link className='link--undercover' to={`/posts/${data.post.id}`}>
                <div className='postItemDisplay-header'>
                    <h3 
                        className='h--hidden'>
                        { data.post.title }
                    </h3>
                    <div>
                        <p 
                            className='p--hidden'> 
                            { data.post.author }
                        </p>
                        <p 
                            className='postItemDisplay-date'> 
                            { date } 
                        </p>
                    </div>
                </div>
                <p 
                    className='postItemDisplay-content p--wrap'>
                    { data.post.content }
                </p>
            </Link>
        </div>
    )
}

export default PostListItem;