import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';

function Contact() {
  const [message, setMessage] = useState('');
  const [landLord, setLandLord] = useState(null);
  const [searchParams] = useSearchParams();
  const params = useParams();

  useEffect(() => {
    const getLandlord = async () => {
      const docRef = doc(db, 'users', params.landlordId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setLandLord(snap.data());
      } else {
        toast.error('Could not get Landlord details !');
      }
    };
    getLandlord();
  }, [params.landlordId]);

  const onMessageChange = e => {
    setMessage(e.target.value);
  };

  return (
    <div className='pageContainer'>
      <header className='pageHeader'>Contact Landlord</header>
      {landLord !== null && (
        <main>
          <div className='contactLandlord'>
            <p className='landlordName'>{landLord?.name}</p>
          </div>
          <form className='messageForm'>
            <div className='messageDiv'>
              <label className='messageLabel' htmlFor='message'>
                Message
              </label>
              <textarea
                name='message'
                id='message'
                className='textarea'
                value={message}
                onChange={onMessageChange}></textarea>
            </div>
            <a
              href={`mailto:${landLord.email}?Subject=${searchParams.get(
                'listingName',
              )}&body=${message}`}>
              <button className='primaryButton' type='button'>
                Send Message
              </button>
            </a>
          </form>
        </main>
      )}
    </div>
  );
}

export default Contact;
