import { useParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './commentForm.css'

function CommentForm({comment, setComment,handleCommentSubmit}) {
    const { postId } = useParams()
    const { auth } = useAuth()

    return (
        <div>
            <form 
                className='commentForm'
                onSubmit={ (e) => {e.preventDefault()} } 
                method='post'>
                    <textarea 
                    className="commentForm-textarea"
                    name='content'
                    type='textarea'
                    placeholder={ auth.id ? 'Add your comment' : 'Login to comment and like' }
                    value={ comment }
                    onChange={ (e) => {setComment(e.target.value)} }
                    disabled={ auth.id ? false : true }
                    />
                    <input 
                        className='button button--end'
                        type='submit'
                        value='send'
                        onClick={() => handleCommentSubmit(postId) }
                        disabled={ auth.id ? false : true }
                    />
            </form>
        </div>
    )
}

export default CommentForm;