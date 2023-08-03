import useAuth from "../../hooks/useAuth";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useLogout from '../../hooks/useLogout'

import './navbar.css'
import MenuButton from "./menuButton";

function NavBar() {
    const { auth } = useAuth()
    const location = useLocation()
    const logout = useLogout()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleClick = () => {
        setMenuOpen(!menuOpen)
    }

    const handleLogout = async() => {
        await logout()
        navigate('/', {replace:true})
    }

    return (
        <div className='navBar'>
            <div className="navBar-desktop">
                <ul>
                    <li><Link to='/'>Posts</Link></li>
                    <li><Link to='/users'>Users</Link></li>
                </ul>
            </div>
            <ul>
                {
                    auth.id
                    ?
                    <li><MenuButton menuOpen={menuOpen} handleClick={handleClick} />
                        <ul onClick={handleClick} className={menuOpen ? 'navBar-desktop open' : 'navBar-desktop closed'}>
                            <li className="navBar-mobile"><Link to='/'>Posts</Link></li>
                            <li className="navBar-mobile"><Link to='/users'>Users</Link></li>
                            <li><Link to={ `/profile/${auth.id}` }>Profile</Link></li>
                            <li><Link to='/newpost'>New post</Link></li>
                            <li><Link to='/myposts'>My posts</Link></li>
                            <li><Link to='/Friends'>Friends</Link></li>
                            <li><Link to='/Invitations'>Invitations</Link></li>
                            <li><Link to='' onClick={ handleLogout }>Logout</Link></li>
                        </ul>
                    </li> 
                    :
                    <li><div className="navBar-mobile"><MenuButton menuOpen={menuOpen} handleClick={handleClick} /></div>
                        <div className="navBar-desktop"><Link  to='/login' state={ {from:location.pathname} }>Login</Link></div>
                        <ul onClick={handleClick} className={menuOpen ? 'navBar-mobile open' : 'navBar-mobile closed'}>
                            <li className="navBar-mobile"><Link to='/login' state={ {from:location.pathname} }>Login</Link></li>
                            <li className="navBar-mobile"><Link to='/'>Posts</Link></li>
                            <li className="navBar-mobile"><Link to='/users'>Users</Link></li>
                        </ul>
                    </li>
                }
            </ul>
        </div>
    )
}

export default NavBar;