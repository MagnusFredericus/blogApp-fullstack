import { useState, useEffect } from "react";
import useAxiosAuth from "../../hooks/useAxiosAuth";
import UserListItem from "./userListItem";
import urls from "../../api/urls";
import './friends.css'

function Friends() {
    const [friend, setFriend] = useState([])
    const axiosAuth = useAxiosAuth()

    useEffect(() => {
        const getFriend = async() => {
            const resp = await axiosAuth.get(urls.apiUsersFriends)
            resp.status===200 ? setFriend(resp.data) : setFriend([])
        }
        getFriend()
    }, [])
    
    return (
        <div className="usersList">
        {
            friend.map((user) => {return (
                <UserListItem
                    id={ user.id }
                    key={ user.id }
                    name={ user.name }
                    socialName={ user.lastName }
                    email={ user.email }/>)
            })
        }
        </div>
        )
}

export default Friends;