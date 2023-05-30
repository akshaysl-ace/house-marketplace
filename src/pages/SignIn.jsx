import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import VisibilityIcon from '../assets/svg/visibilityIcon.svg';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-toastify';
import OAuth from '../components/OAuth';

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const navigate = useNavigate();

  const onChange = e => {
    setFormData(prevState => {
      return {
        ...prevState,
        [e.target.id]: e.target.value,
      };
    });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      if (userCredentials.user) {
        navigate('/');
      } else {
        navigate('/signin');
      }
    } catch (err) {
      toast.error('Invalid credentials !');
    }
  };

  return (
    <>
      <div className='pageContainer'>
        <header>
          <p className='pageHeader'>Welcome Back!</p>
          <p className='pageHeader'>Please Sign In to your account..</p>
        </header>
        <form onSubmit={onSubmit}>
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
            <p className='signInText'>Sign-In</p>
            <button className='signInButton'>
              <ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
            </button>
          </div>
        </form>
        <Link to='/signup' className='registerLink'>
          Sign Up instead !
        </Link>
        <OAuth />
      </div>
    </>
  );
}

export default SignIn;
