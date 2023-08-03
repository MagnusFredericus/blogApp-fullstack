import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import jwt from 'jwt-decode'
import axios from '../../api/axios'
import { Link } from 'react-router-dom'
import urls from '../../api/urls'
import './loginForm.css'
import useToggle from '../../hooks/useToggle'

function LoginForm() {
    const emailRef = useRef()
    const [UserEmail, setUserEmail] = useState('')
    const [Password, setPassword] = useState('')
    const navigate = useNavigate()
    const location = useLocation()
    const from = location?.state?.from || '/'
    const [check, toggleCheck] = useToggle('persist', false)

    const { setAuth } = useAuth()

    useEffect(() => {
        setUserEmail(location?.state?.userEmail || '')
        emailRef.current.focus()
    }, [])
    
    const UserEmailHandler = (e) => {
        setUserEmail(e.target.value)
    }

    const PasswordHandler = (e) => {
        setPassword(e.target.value)
    }

    const FormHandler = async (e) => {
        e.preventDefault()

        try {
            const resp = await axios.post(urls.apiAuthLogin,
                JSON.stringify({email:UserEmail, password:Password}),
                { withCredentials:true }
            )

            let decodedHeader = await jwt(resp?.data.accessToken)
            const id = decodedHeader?.id
            const accessToken = resp?.data.accessToken
            setAuth({ id:id, accessToken:accessToken })
            setUserEmail('')
            setPassword('')
            navigate(from, { replace:true })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="formContainer">
            <form className='loginForm' onSubmit={FormHandler} method="post">
                <label className='loginForm-label' htmlFor="userEmail">Email</label>
                <input 
                    className='loginForm-userEmail'
                    type="text" 
                    name="userEmail" 
                    ref={ emailRef }
                    value={ UserEmail }
                    onChange={UserEmailHandler}
                />
                <label className='loginForm-label' htmlFor="password">Password</label>
                <input 
                    className='loginForm-password'
                    type="password" 
                    name="password" 
                    value={ Password }
                    onChange={PasswordHandler}
                />
                <div></div>
                <div className='loginForm-panel'>
                    <input 
                        className='button' 
                        type="submit" 
                        value="Login"
                    />
                </div>
                
            </form>
            <div className='persistCheck'>
                    <input 
                        className='persistCheck'
                        type='checkbox'
                        name='persist'
                        checked={ check }
                        onChange={ toggleCheck }
                    />
                    <label htmlFor='persist'>Keep me logged in</label>
                </div>
            <p>Still does not have an account?</p>
            <Link 
                className='link'
                to='/register'>Sign now
            </Link>
        </div>
    )
}

export default LoginForm;