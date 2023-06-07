import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import ListingItem from '../components/ListingItem';

function Offers() {
  const [listigs, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, 'listings');
        //create a query to db
        const q = query(
          listingsRef,
          where('offer', '==', true),
          orderBy('timestamp', 'desc'),
          limit(10),
        );
        //execute query
        const snapShotOfDb = await getDocs(q);
        const lastVisible = snapShotOfDb.docs[snapShotOfDb.docs.length - 1];
        setLastFetchedListing(lastVisible);
        const listItems = [];
        snapShotOfDb.forEach(doc => {
          return listItems.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listItems);
        setLoading(false);
      } catch (error) {
        toast.error('Coud not fetch data !');
      }
    };

    fetchListings();
  }, []);

  const onFetchMoreListings = async () => {
    try {
      const listingsRef = collection(db, 'listings');
      //create a query to db
      const q = query(
        listingsRef,
        where('offer', '==', true),
        orderBy('timestamp', 'desc'),
        startAfter(lastFetchedListing),
        limit(10),
      );
      //execute query
      const snapShotOfDb = await getDocs(q);
      const lastVisible = snapShotOfDb.docs[snapShotOfDb.docs.length - 1];
      setLastFetchedListing(lastVisible);

      const listItems = [];
      snapShotOfDb.forEach(doc => {
        return listItems.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      console.log('listitems', listItems);
      setListings(prevState => [...prevState, ...listItems]);
      setLoading(false);
    } catch (error) {
      toast.error('Coud not fetch more data !');
    }
  };

  return (
    <div className='category'>
      <header>
        <p className='pageHeader'>Offers</p>
      </header>
      {loading ? (
        <Loader />
      ) : listigs && listigs.length > 0 ? (
        <>
          <main>
            <ul className='categoryListings'>
              {listigs.map(listing => (
                <ListingItem
                  listing={listing.data}
                  id={listing.id}
                  key={listing.id}
                />
              ))}
            </ul>
          </main>
          <br />
          <br />
          {lastFetchedListing && (
            <p className='loadMore' onClick={onFetchMoreListings}>
              Load more
            </p>
          )}
        </>
      ) : (
        <p>Currently there are no any offers !</p>
      )}
    </div>
  );
}

export default Offers;
