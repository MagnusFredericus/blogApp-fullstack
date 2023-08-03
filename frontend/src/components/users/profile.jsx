import { useState, useEffect} from 'react';
import PostsListItem from '../posts/postsListItem';
import useAxiosAuth from '../../hooks/useAxiosAuth'
import useAuth from '../../hooks/useAuth';
import urls from '../../api/urls';
import { Link, useParams } from 'react-router-dom';
import './profile.css'
import axios from '../../api/axios';

function Profile() {
    const { userId } = useParams()
    const [profile, setProfile] = useState({})
    const [posts, setPosts] = useState([])
    const { auth } = useAuth()
    const [toggleFriend, setToggleFriend] = useState(false)
    const [toggleInvitations, setToggleInvitations] = useState(false)
    const axiosAuth = useAxiosAuth()
    const id = userId ? userId : auth.id

    useEffect(() => {    
        const getProfileData = async() => {
            try {
                const resp = await axios.get(urls.apiUsersById + id)
                setProfile(resp.data)
            } catch(e) {
                console.log(e)
            }
        }

        const getPostsData = async() => {
            try {
                const resp = await axios.get(urls.apiPostsByUserId + id)
                resp.status===200 ? setPosts(resp.data) : setPosts([])
            } catch(e) {
                console.log(e)
            }
        }

        const getFriends = async() => {
            try {
                const resp = await axiosAuth.get(urls.apiUsersFriends)
                if(resp.status===200) {
                    const friendsIds = resp.data.map((f) => {return f.id})
                    setToggleFriend(friendsIds.includes(parseInt(userId)))
                } else {
                    setToggleFriend(false)
                }
            } catch(e){
                console.log(e)
            }
        }

        const getInvitations = async() => {
            try {
                const resp = await axiosAuth.get(urls.apiUsersFriendshipInvitations)
                if(resp.status===200) {
                    const invitationsIds = resp.data.map((f) => {return f.id})
                    setToggleInvitations(invitationsIds.includes(parseInt(userId)))
                } else {
                    setToggleInvitations(false)
                }
            } catch(e){
                console.log(e)
            }
        }
        getProfileData()
        getPostsData()
        getInvitations()
        if(auth.id) {
            getFriends()
        }
    }, [userId, toggleFriend, toggleInvitations])

    const handleInvite = async() => {
        try {
            await axiosAuth.post(urls.apiUsersAddFriend + id)
            setToggleFriend(true)
        } catch(e) {
            console.log(e)
        }
    }

    const handleRemove = async() => {
        try {
            await axiosAuth.delete(urls.apiUsersRemoveFriend + id)
            setToggleFriend(false)
        } catch(e) {
            console.log(e)
        }
    }

    const handleAccept = async() => {
        try {
            await axiosAuth.post(urls.apiUsersAcceptFriend + id)
            setToggleFriend(true)
            setToggleInvitations(false)
        } catch(e) {
            console.log(e)
        }
    }

    const handleReject = async() => {
        try {
            await axiosAuth.delete(urls.apiUsersRejectFriend + id)
            setToggleFriend(false)
            setToggleInvitations(false)
        } catch(e) {
            console.log(e)
        }
    }

    return (
        <div className='profile'>
            <div className='profileData'>
                <div className='personalData'>
                    <div className='personalData-data'>
                        <p>{`${profile.name ? profile.name : ''} ${profile.lastName ? profile.lastName:''}`}</p>
                        <p>{`${profile.email ? profile.email : ''}`}</p>
                    </div>
                </div>
                {
                    auth.id
                    ?
                        auth.id == userId
                        ?
                            <Link 
                                className='profile-link' 
                                to='/editprofile'>Edit
                            </Link> 
                        :
                        toggleInvitations
                        ?
                            <>
                            <Link 
                                className='profile-link' 
                                to=''
                                onClick={ handleAccept }>Accept
                            </Link>
                            <Link 
                                className='profile-link-reject' 
                                to=''
                                onClick={ handleReject }>Reject
                            </Link>
                            </>
                        :
                            toggleFriend
                            ?
                                <Link 
                                    className='profile-link' 
                                    to='' 
                                    onClick={ handleRemove }>Remove
                                </Link>
                            :
                                <Link 
                                    className='profile-link' 
                                    to='' 
                                    onClick={ handleInvite }>Invite
                                </Link>
                    : ''
                }
            </div>
            <h2>Biography</h2>
            <p
                className='p--wrap p--keep-breakline'>
                { profile.bio? profile.bio : 'User still has no bio'}
            </p>
            <h2>Posts</h2>
            { posts.map(post => <PostsListItem post={ post } />) }
        </div>
    )
}

export default Profile;