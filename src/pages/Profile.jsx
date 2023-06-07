import React, { useEffect, useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import {
  doc,
  updateDoc,
  collection,
  query,
  orderBy,
  getDocs,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';
import ListingItem from '../components/ListingItem';

function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetails, setChangeDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userListings, setListings] = useState([]);
  const [formData, setFormData] = useState({
    name: auth && auth.currentUser.displayName,
    email: auth && auth.currentUser.email,
  });

  const onLogOut = () => {
    auth.signOut();
    navigate('/signin');
  };

  const { name, email } = formData;

  const onChange = e => {
    setFormData(prevState => {
      return { ...prevState, [e.target.id]: e.target.value };
    });
  };

  const onEdit = listingId => {
    navigate(`/edit-listing/${listingId}`);
  };

  const onDelete = async listingId => {
    if (window.confirm('Are you sure you want to delete ?')) {
      await deleteDoc(doc(db, 'listings', listingId));
      const updatedList = userListings.filter(
        listing => listing.id !== listingId,
      );
      setListings(updatedList);
      toast.success(`Listing deleted successfully !`);
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      if (auth.currentUser.displayName !== name) {
        // update display name in firebase
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        // update in db
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          name: name,
        });
      }
    } catch (error) {
      toast.error('Could not update profile details !');
    }
  };

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, 'listings');
      const q = query(
        listingsRef,
        where('userRef', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc'),
      );
      const snap = await getDocs(q);

      const listings = [];
      snap.forEach(doc => listings.push({ id: doc.id, data: doc.data() }));
      setListings(listings);
      setLoading(false);
    };

    fetchUserListings();
  }, [auth.currentUser.uid]);

  return (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button type='button' onClick={onLogOut} className='logOut'>
          Log Out
        </button>
      </header>
      <main>
        <div className='profileDetailsHeader'>
          <p className='profileDetailsText'>Personal Details</p>
          <p
            className='changePersonalDetails'
            onClick={e => {
              changeDetails && onSubmit(e);
              setChangeDetails(prev => !prev);
            }}>
            {changeDetails ? 'Done' : 'Change'}
          </p>
        </div>
        <div className='profileCard'>
          <form>
            <input
              type='text'
              id='name'
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
            <input
              type='text'
              id='email'
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            />
          </form>
        </div>
        <Link to='/create-listing' className='createListing'>
          <img src={homeIcon} alt='home' />
          <p>Sell or Rent your property</p>
          <img src={arrowRight} alt='arrow-right' />
        </Link>
        {!loading && userListings?.length > 0 && (
          <>
            <p className='listingText'>Your Listings</p>
            <ul className='listingsList'>
              {userListings.map(listing => (
                <ListingItem
                  listing={listing.data}
                  key={listing.id}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

export default Profile;
