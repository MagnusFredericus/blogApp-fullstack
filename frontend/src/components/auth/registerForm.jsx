import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from 'react-router-dom'
import axios from "../../api/axios";
import './registerForm.css'
import urls from "../../api/urls";

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/

function RegisterForm() {
    const userRef = useRef()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    
    const [validEmail, setValidEmail] = useState(false)
    const [validPassword, setValidPassword] = useState('')
    const [matchPassword, setMatchPassword] = useState(false)

    const [instructionMessage, setInstructionMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        userRef.current.focus()
    }, [])

    useEffect(() => {
        setValidEmail(EMAIL_REGEX.test(email))
        if(email != "") {
            validEmail ? 
            setErrorMessage('') : 
            setErrorMessage('Please, use a valid email')
        } else {
            setErrorMessage('')
        }
    }, [email])

    useEffect(() => {
        setValidPassword(PASSWORD_REGEX.test(password))
        setMatchPassword(password == passwordConfirm)

        if(password != '') {
            validPassword
            ? setInstructionMessage('')
            : setInstructionMessage('Please, use a valid password: at least one number and one special character, between 6 to 16 characters')
        } else {
            setInstructionMessage('')
        }

        if(password != '' && passwordConfirm != '') {
            matchPassword
            ? validPassword ? setInstructionMessage('') 
                            : setInstructionMessage('Please, use a valid password: at least one number and one special character, between 6 to 16 characters') 
            : setInstructionMessage('Please, confirm your password')
        }
        
    }, [password, passwordConfirm, validPassword, matchPassword]) //[password, passwordConfirm, matchPassword])

    const handleEmail = (e) => {setEmail(e.target.value)}
    const handlePassword = (e) => {setPassword(e.target.value)}
    const handlePasswordConfirm = (e) => {setPasswordConfirm(e.target.value)}

    const formHandler = async (e) => {
        e.preventDefault()
        const checkEmail = EMAIL_REGEX.test(email)
        const checkPassword = PASSWORD_REGEX.test(password)

        if(!checkEmail || !checkPassword) {
            setErrorMessage('Invalid entry')
            return
        }

        try {
            const resp = await axios.post(urls.apiAuthRegister, 
                JSON.stringify({ email:email,password:password }),
                { withCredentials:true }
            )
            navigate('/login', {replace:true})
        } catch(error) {
            console.log(error)
        }
    }

    return (
        <div className='registerFormContainer'>
            <form 
                className='registerFormContainer-registerForm' 
                onSubmit={ formHandler } 
                method="post">
                    <label className="registerForm-label" htmlFor="email">Email</label>
                    <input 
                        className="registerForm-email"
                        ref={ userRef }
                        name='email'
                        type='text'
                        required
                        value={ email }
                        onChange={ handleEmail }
                    />
                    <label className="registerForm-label" htmlFor="password">Password</label>
                    <input 
                        className="registerForm-password"
                        name='password'
                        type='password'
                        value={ password }
                        onChange={ handlePassword }
                    />
                    <label className="registerForm-label" htmlFor="matchPassword">Confirm</label>
                    <input 
                        className="registerForm-passwordConfirm"
                        name='passwordConfirm'
                        type='password'
                        value={ passwordConfirm }
                        onChange={ handlePasswordConfirm }
                    />
                    <div></div>
                    <div className="registerFormContainer-panel">
                        <input 
                            className='button'
                            type='submit' 
                            value='Register'>
                        </input>
                    </div>
            </form>
            <p className="ErrorMessage">{ errorMessage }</p>
            <p className="ErrorMessage">{ instructionMessage }</p>
            <p >Already has an account?</p><Link to='/login'>Login</Link>
        </div>
    )
}

export default RegisterForm;