import { Link } from "react-router-dom";
import './userListItem.css'

function UserListItem({id, name, lastName, email}) {
    return (
        <Link 
            className='link--undercover'
            to={ `/profile/${id}` }>
            <div className='userListItemDisplay'>
                <div className='userData'>
                    <p className="userData-data">{`${name ? name : ''} ${lastName ? lastName : ''}`}</p>
                    <p className="userData-data">{`${email}`}</p>
                </div>
            </div>
        </Link>
    )
}

export default UserListItem;