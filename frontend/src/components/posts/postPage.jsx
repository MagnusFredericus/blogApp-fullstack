import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import urls from "../../api/urls";
import PostContent from "./postContent";
import CommentForm from '../comments/commentForm'
import CommentItem from '../comments/CommentItem'
import useAxiosAuth from "../../hooks/useAxiosAuth";
import './postPage.css'
import axios from "../../api/axios";

function Post() {
    const [author, setAuthor] = useState('')
    const [post, setPost] = useState('')
    const [comments, setComments] = useState([])
    const [comment, setComment] = useState('')
    const [totalLikes, setTotalLikes] = useState(0)
    const axiosAuth = useAxiosAuth()
    const { postId } = useParams()

    useEffect(() => {
        const getAuthorPost = async () => {
            try {
                const postResp = await axios.get(urls.apiPostsById + postId)
                const authorResp = await axios.get(urls.apiUsersById + postResp.data.userId)
                const commentsResp = await axios.get(urls.apiCommentsByPostId + postId)
                setPost(postResp.data)
                setAuthor(authorResp.data)
                setTotalLikes(postResp.data.likes)
                commentsResp.status===200 ? setComments(commentsResp.data) : setComments([])
            } catch (error) {
                console.log(error)
            }
        }
        getAuthorPost()
    }, [postId])

    const handleCommentSubmit = async (postId) => {
        try {
            const resp = await axiosAuth.post(urls.apiCommentsCreate + postId,
                {content:comment}
            )
            const allComments = [...comments, resp.data]
            setComments(allComments)
            setComment('')
        } catch(error) {
            console.log(error)
        }
    }

    const handleLikeComment = async (commentId) => {
        try {
            const resp = await axiosAuth.post(urls.apiCommentsLike + commentId)
            console.log(resp.data)
            if(!resp.data.error) {
                const index = comments.findIndex(comment => comment.id===commentId)
                comments[index].likes += 1
                const updatedComments = [...comments]
                setComments(updatedComments)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleLikePost = async (postId) => {
        try {
            let resp = await axiosAuth.post(urls.apiPostsLike + postId)
            if(resp.status===201) {
                setTotalLikes(resp.data.totalLikes)
            }
        } catch (error) {
            console.log('error')
        }
    }

    const handleSave = async(commentId, newContent) => {
        try {
            await axiosAuth.put(urls.apiCommentsUpdate + commentId, {
                content:newContent
            })
            var index = comments.findIndex(c => c.id == commentId)
            var allComments = [...comments]
            allComments[index].content = newContent
            setComments(allComments)
        } catch(e) {
            console.log(e)
        }
    }

    const handleDeleteComment = async(commentId) => {
        try {
            await axiosAuth.delete(urls.apiCommentsDelete + commentId)
            var allComments = comments.filter((c) => c.id != commentId)
            setComments(allComments)
        } catch(e) {
            console.log(e)
        }
    }

    return (
        <>
        <div id='PostData'>
            <div id="PostContent">
                <PostContent 
                    id={ author.id }
                    author={ `${author.name} ${author.lastName}` }
                    email= { author.email }
                    date= { post.createdAt }
                    postId={ post.id }
                    title={ post.title }
                    content={ post.content }
                    views={ post.views }
                    likes={ totalLikes }
                    handleLike={ handleLikePost }
                />
            </div>
            <div id='CommentsList'>
                <CommentForm 
                    comment = { comment }
                    setComment = { setComment }
                    handleCommentSubmit={ handleCommentSubmit }
                    postId={ post.id } 
                />
                { comments.map((comment_data) => {
                    return (
                        <CommentItem 
                            key={ comment_data.id }
                            author= { comment_data.author }
                            authorId = { comment_data.userId }
                            commentId={ comment_data.id }
                            createdAt={ comment_data.createdAt }
                            content={ comment_data.content } 
                            likes={ comment_data.likes }
                            handleLike={ handleLikeComment }
                            handleSave={ handleSave }
                            handleDelete={ handleDeleteComment }
                        />
                    )
                })
                }
            </div>
        </div>
        </>
    )
}

export default Post;