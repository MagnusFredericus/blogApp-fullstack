import { useState, useEffect } from "react";
import useAxiosAuth from "../../hooks/useAxiosAuth";
import UserListItem from "./userListItem";
import urls from "../../api/urls";
import './friends.css'

function Invitations() {
    const [invitations, setInvitations] = useState([])
    const axiosAuth = useAxiosAuth()

    useEffect(() => {
        const getInvitations = async() => {
            const resp = await axiosAuth.get(urls.apiUsersFriendshipInvitations)
            resp.status===200 ? setInvitations(resp.data) : setInvitations([])
            console.log(resp)
        }
        getInvitations()
    }, [])
    
    return (
        <div className="usersList">
        {
            invitations.map((user) => {return (
                <UserListItem
                    id={ user.id }
                    key={ user.id }
                    name={ user.name }
                    socialName={ user.socialName }
                    email={ user.email }/>)
            })
        }
        </div>
        )
}

export default Invitations;