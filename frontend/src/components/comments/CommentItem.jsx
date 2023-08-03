import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import './commentItem.css'
import { useState, useEffect } from "react";

function CommentItem({ author, authorId, commentId, likes, createdAt, content, handleLike, handleSave, handleDelete }) {
    const { auth } = useAuth()
    const [editMode, setEditMode] = useState(false)
    const [newContent, setNewContent] = useState('')
    const [date, setDate] = useState('')

    useEffect(() => {
        let dateAux = new Date(createdAt ? createdAt : Date.now())
        setDate(dateAux.toISOString().split('T')[0])
    }, [createdAt])

    const handleEdit = async() => {
        setEditMode(true)
        setNewContent(content)
    }

    const handleSaveButton = async() => {
        handleSave(commentId, newContent)
        setEditMode(false)
    }

    const handleDeleteButton = async() => {
        handleDelete(commentId, newContent)
        setEditMode(false)
    }

    const handleCancel = async() => {
        setEditMode(false)
    }

    return (
        <div className="displayComment">
            <div className="displayComment-header">
                <p className="p--hidden">
                    <Link 
                        className="link--undercover"
                        to={`/profile/${ authorId }`}>
                        { `${ author ? author : ''}` }
                    </Link>
                </p>
                <div className='displayComment-header-likeDate'>
                    <p>{ `likes ${ likes }, ${date}` }</p>
                </div>
            </div>
            <div className='displayComment-content'>
            {
                editMode
                ? 
                <textarea 
                    className="textarea--thin" 
                    value={ newContent } 
                    onChange={ (e) => {setNewContent(e.target.value)} }>
                </textarea>
                : 
                <p className="p--keep-breakline p--wrap">
                    { content }
                </p>
            }
            </div>
            <div className="displayComment-panel">
            {
                editMode
                ? 
                <>
                <button 
                    onClick={ () => handleDeleteButton(commentId) }>Delete
                </button>
                <button 
                    onClick={ handleCancel}>Cancel
                </button>
                <button 
                    onClick={ handleSaveButton }>Save
                </button>
                </>
                : 
                auth.id == authorId
                ?  
                <>
                <button 
                    onClick={ handleEdit }>Edit
                </button> 
                <button 
                    onClick={ () => handleLike(commentId) }>Like
                </button> 
                </>
                : 
                <button
                    onClick={ () => handleLike(commentId) }>Like
                </button> 
            }
            </div>
        </div>
    )
}

export default CommentItem;