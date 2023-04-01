import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import VisibilityIcon from '../assets/svg/visibilityIcon.svg';
import {
  getAuth,
  createUserWithEmailAndPassword as createFBUser,
  updateProfile,
} from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredentials = await createFBUser(auth, email, password);

      const user = userCredentials.user;

      updateProfile(auth.currentUser, {
        displayName: name,
      });

      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      formDataCopy.timestamp = serverTimestamp();
      await setDoc(doc(db, 'users', user.uid), formDataCopy);
      navigate('/');
    } catch (err) {
      console.log(err);
    }
  };

  const { name, email, password } = formData;

  const navigate = useNavigate();

  const onChange = e => {
    setFormData(prevState => {
      return {
        ...prevState,
        [e.target.id]: e.target.value,
      };
    });
  };

  return (
    <>
      <div className='pageContainer'>
        <header>
          <p className='pageHeader'>Welcome Back!</p>
        </header>
        <form onSubmit={onSubmit}>
          <input
            type='text'
            id='name'
            name='name'
            className='nameInput'
            placeholder='Name'
            value={name}
            onChange={e => onChange(e)}
          />
          <input
            type='email'
            id='email'
            name='email'
            className='emailInput'
            placeholder='Email'
            value={email}
            onChange={e => onChange(e)}
          />
          <div className='passwordInputDiv'>
            <input
              type={showPassword ? 'text' : 'password'}
              className='passwordInput'
              placeholder='Password'
              id='password'
              name='password'
              value={password}
              onChange={e => onChange(e)}
            />
            <img
              src={VisibilityIcon}
              alt='Show Password'
              className='showPassword'
              onClick={() => setShowPassword(prev => !prev)}
            />
          </div>
          <Link to='/forgot' className='forgotPasswordLink'>
            Forgot Password ?
          </Link>
          <div className='signInBar'>
            <p className='signInText'>Sign Up</p>
            <button className='signInButton'>
              <ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
            </button>
          </div>
        </form>
        <Link to='/signin' className='registerLink'>
          Sign In instead !
        </Link>
      </div>
    </>
  );
}

export default SignUp;
