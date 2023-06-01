import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import ListingItem from '../components/ListingItem';

function Category() {
  const [listigs, setListings] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, 'listings');
        //create a query to db
        const q = query(
          listingsRef,
          where('type', '==', params.categoryName),
          orderBy('timestamp', 'desc'),
          limit(10),
        );
        //execute query
        const snapShotOfDb = await getDocs(q);
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
  }, [params.categoryName]);
  return (
    <div className='category'>
      <header>
        <p className='pageHeader'>
          {params.categoryName === 'rent'
            ? 'Places for Rent'
            : 'Places for Sale'}
        </p>
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
        </>
      ) : (
        <p>No Listings found for {params.categoryName}!</p>
      )}
    </div>
  );
}

export default Category;
