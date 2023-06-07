import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getStorage,
  uploadBytesResumable,
  ref,
  getDownloadURL,
} from 'firebase/storage';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { useRef } from 'react';
import { toast } from 'react-toastify';
import { v4 as uuid } from 'uuid';

function EditListing() {
  const formDataState = {
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: [],
    latitude: 0,
    longitude: 0,
  };
  const [formData, setFormData] = useState(formDataState);
  const [listing, setListing] = useState(null);
  const [geoLocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();
  const isMounted = useRef(true);

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;

  useEffect(() => {
    setLoading(true);
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({ ...docSnap.data(), address: docSnap.data().location });
        setLoading(false);
      } else {
        navigate('/');
        toast.error('Property does not exist !');
      }
    };

    fetchListing();
  }, [navigate, params.listingId]);

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, user => {
        if (user) {
          setFormData(formData => {
            return { ...formData, userRef: user.uid };
          });
        } else {
          navigate('/signin');
        }
      });
    }

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error('You cannot edit this post !');
      navigate('/');
    }
  });

  const onSaveAndUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error('Discounted price must be less than regular price !');
      return;
    }
    if (typeof images === Array && images.length > 6) {
      setLoading(false);
      toast.error('Maximum 6 images can be uploaded !');
      return;
    }

    const geolocation = {};
    let location;

    if (geoLocationEnabled) {
      const geoResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`,
      );
      const data = await geoResponse.json();
      geolocation.lat =
        data.results && (data.results[0]?.geometry.location.lat ?? 0);
      geolocation.lng =
        data.results && (data.results[0]?.geometry.location.lng ?? 0);
      location =
        data.status === 'ZERO_RESULTS'
          ? undefined
          : data.results[0]?.formatted_address;

      if (location === undefined || location.includes('undefined')) {
        setLoading(false);
        toast.error('Please enter a correct address');
        return;
      }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
    }
    // Store images in firebase
    const storeImage = async img => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${img.name}-${uuid()}`;
        const storageRef = ref(storage, 'images/' + fileName);
        const uploadTask = uploadBytesResumable(storageRef, img);

        uploadTask.on(
          'state_changed',
          snapshot => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
              default:
                break;
            }
          },
          error => {
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
              resolve(downloadURL);
            });
          },
        );
      });
    };

    let imageUrls;
    if (images && images.length > 0) {
      imageUrls = await Promise.all(
        [...images].map(image => storeImage(image)),
      ).catch(() => {
        setLoading(false);
        toast.error('Failed to upload images !');
        return;
      });
    }

    const formDataCopy = {
      ...formData,
      imageUrls: imageUrls,
      geolocation,
      timestamp: serverTimestamp(),
      location: address,
    };

    if (!formDataCopy.imageUrls || formDataCopy.imageUrls.length === 0) {
      delete formDataCopy.imageUrls;
    }
    delete formDataCopy.images;
    delete formDataCopy.address;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    try {
      const docRef = doc(db, 'listings', params.listingId);
      await updateDoc(docRef, formDataCopy);
      setLoading(false);
      toast.success('Details saved and updated !');
      navigate(`/category/${formDataCopy.type}/${docRef.id}`);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error('Something went wrong ! Please try again.');
      navigate(`/`);
    }
  };

  const onMutate = e => {
    let bool = null;
    if (e.target.value === 'true') {
      bool = true;
    }
    if (e.target.value === 'false') {
      bool = false;
    }

    if (e.target.files) {
      setFormData(prev => ({ ...prev, images: e.target.files }));
    }

    if (!e.target.files) {
      setFormData(prev => ({ ...prev, [e.target.id]: bool ?? e.target.value }));
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Edit Property Details</p>
      </header>
      <main>
        <form onSubmit={onSaveAndUpdate}>
          <label className='formLabel'>Sell / Rent</label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='sale'
              onClick={onMutate}>
              Sell
            </button>
            <button
              type='button'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='rent'
              onClick={onMutate}>
              Rent
            </button>
          </div>
          <label className='formLabel'>Name</label>
          <input
            className='formInputName'
            type='text'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required
          />
          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
          </div>

          <label className='formLabel'>Parking spot</label>
          <div className='formButtons'>
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type='button'
              id='parking'
              value={true}
              onClick={onMutate}
              min='1'
              max='50'>
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='parking'
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>

          <label className='formLabel'>Furnished</label>
          <div className='formButtons'>
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type='button'
              id='furnished'
              value={true}
              onClick={onMutate}>
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type='button'
              id='furnished'
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>

          <label className='formLabel'>Address</label>
          <textarea
            className='formInputAddress'
            type='text'
            id='address'
            value={address}
            onChange={onMutate}
            required
          />

          {!geoLocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value={true}
              onClick={onMutate}>
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='offer'
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>

          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
              required
            />
            {type === 'rent' ? (
              <p className='formPriceText'> / Month</p>
            ) : (
              <p className='formPriceText'>U.S.D.</p>
            )}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <div className='formPriceDiv'>
                <input
                  className='formInputSmall'
                  type='number'
                  id='discountedPrice'
                  value={discountedPrice}
                  onChange={onMutate}
                  min='50'
                  max='750000000'
                  required={offer}
                />
                {type === 'rent' ? (
                  <p className='formPriceText'> / Month</p>
                ) : (
                  <p className='formPriceText'>U.S.D.</p>
                )}
              </div>
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be on the cover (max 6).
          </p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={onMutate}
            min='0'
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple
          />
          <button type='submit' className='primaryButton createListingButton'>
            Save and Update
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditListing;
