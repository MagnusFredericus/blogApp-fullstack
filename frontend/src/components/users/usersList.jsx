import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import urls from '../../api/urls';

import UserListItem from './userListItem';
import './usersList.css'
import useAuth from '../../hooks/useAuth';

function Users() {
    const [users, setUsers] = useState([])

    useEffect(() => {
        const getUsers = async() => {
            const resp = await axios.get(urls.apiUsers)
            resp.status===200 ? setUsers(resp.data) : setUsers([])
        }
        getUsers()
    }, [])

    return (
        <div className='usersList'>
        {
            users.map((user) => {return (
                <UserListItem
                    id={ user.id }
                    key = { user.id }
                    name={ user.name } 
                    lastName={ user.lastName} 
                    email={ user.email}/>)
                })
        }
        </div>
    )
}

export default Users;