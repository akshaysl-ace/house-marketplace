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
import { toast } from 'react-toastify';
import OAuth from '../components/OAuth';

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
      toast.error('Something went wrong with registration !');
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
          <p className='pageHeader'>Go ahead and Sign Up..!</p>
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
          <div className='signInBar'>
            <p className='signInText'>Sign Up</p>
            <button className='signInButton'>
              <ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
            </button>
          </div>
        </form>
        <OAuth />
        <Link to='/signin' className='registerLink'>
          Already have an account ? Sign In here !
        </Link>
      </div>
    </>
  );
}

export default SignUp;
