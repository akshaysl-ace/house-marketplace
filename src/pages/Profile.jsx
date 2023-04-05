import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { updateDoc } from 'firebase/firestore';
import { db } from '../firebase.config';

function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });

  const onLogOut = () => {
    auth.signOut();
    navigate('/signin');
  };

  const { name, email } = formData;

  return (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button type='button' onClick={onLogOut} className='logOut'>
          Log Out
        </button>
      </header>
    </div>
  );
}

export default Profile;
