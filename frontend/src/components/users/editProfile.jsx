import { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useAxiosAuth from '../../hooks/useAxiosAuth';
import urls from '../../api/urls';
import './editProfile.css'
import axios from '../../api/axios';

function EditProfile() {
    const bioRef = useRef()
    const { auth } = useAuth()
    const [name, setName] = useState('')
    const [lastName, setLastName] = useState('')
    const [image, setImage] = useState('')
    const [bio, setBio] = useState('')
    const axiosAuth = useAxiosAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const getUserData = async() => {
            try {
                const resp = await axios.get(urls.apiUsersById + auth.id)
                setName(resp.data.name ? resp.data.name : '')
                setLastName(resp.data.lastName ? resp.data.lastName : '')
                setBio(resp.data.bio ? resp.data.bio : '')
            } catch(error) {
                console.log(error)
            }
        }
        getUserData()
        bioRef.current.focus()
    }, [])

    const handleSubmit = async(e) => {
        e.preventDefault()
        try {
            await axiosAuth.put(urls.apiUsersUpdate,
                JSON.stringify({
                    name:name,
                    lastName:lastName,
                    bio:bio
                }),
            )
        } catch(error) {
            console.log(error)
        }
        navigate('/profile/' + auth.id, {replace:true})
    }

    const handleCancel = async(e) => {
        navigate('/profile/' + auth.id, {replace:true})
    }

    return (
        <div className='EditProfileContainer'>
            <form className='EditProfileForm' onSubmit={ handleSubmit } metohd='post' encType='multipart/form-data'>
                <div className='editProfileData'>
                    <label htmlFor='name'>Name</label>
                    <input 
                        className='editProfileData-name'
                        type='text'
                        value={ name }
                        onChange={ (e) => setName(e.target.value) }
                    />
                    <label htmlFor='lastname'>Last name</label>
                    <input
                        className='editProfileData-lastName'
                        type='text'
                        value={ lastName }
                        onChange={ (e) => setLastName(e.target.value) }
                    />
                </div>

                <div className='EditBio'>
                    <label htmlFor='bio'>Bio</label>
                    <textarea 
                        className='editBio-textarea'
                        ref={ bioRef }
                        value={ bio }
                        onChange={ (e) => setBio(e.target.value) }
                        placeholder='Bio'
                        contentEditable
                    />
                </div>
                <div className='editProfileForm-panel'>
                    <input 
                        className='button'
                        type='submit' 
                        onClick={ handleCancel } 
                        value='cancel' />
                    <input 
                        className='button'
                        type='submit' 
                        value='save' />
                </div>
            </form>
        </div>
    )
}

export default EditProfile;