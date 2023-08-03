import { Routes, Route } from 'react-router-dom'

import Layout from './components/layout/layout';
import Error from './components/error/error'

import RegisterForm from './components/auth/registerForm'
import LoginForm from './components/auth/loginForm';
import RequireAuth from './components/auth/RequireAuth'
import PersistLogin from './components/auth/persistLogin'

import PostForm from './components/posts/postForm'
import EditPost from './components/posts/editPost'
import MyPosts from './components/posts/myPosts';
import PostsList from './components/posts/postsList'
import PostPage from './components/posts/postPage'

import Profile from './components/users/profile'
import EditProfile from './components/users/editProfile'
import UsersList from './components/users/usersList'
import Friends from './components/users/friends'
import Invitations from './components/users/invitations';

import './App.css'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route element={<PersistLogin />}>
          <Route path='/' element={ <PostsList /> } />
          <Route path='/users' element={ <UsersList /> } />
          <Route path='/register' element={<RegisterForm />} />
          <Route path='/login' element={<LoginForm />} />  
          <Route path='/posts/:postId' element={<PostPage />} />
          <Route path='/profile/:userId' element={ <Profile /> } />

          <Route element={ <RequireAuth /> }>
            <Route path='/myposts' element={ <MyPosts /> } />
            <Route path='/friends' element={ <Friends /> } />
            <Route path='/invitations' element={ <Invitations /> } />
            <Route path='/newpost' element={ <PostForm /> } />
            <Route path='/editpost/:postId' element={ <EditPost />} />
            <Route path='/editprofile' element={<EditProfile />} />
          </Route>
          <Route path='*' element={<Error />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App;