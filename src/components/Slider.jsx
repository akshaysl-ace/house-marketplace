import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase.config';
import { A11y, Navigation, Pagination, Scrollbar } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import Loader from './Loader';

function Slider() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchistings = async () => {
      const listingsRef = collection(db, 'listings');
      const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5));
      const snap = await getDocs(q);
      let listings = [];
      snap.forEach(doc => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setListings(listings);
      setLoading(false);
    };

    fetchistings();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    listings && (
      <>
        <p className='exploreHeading'>Recommended</p>
        <Swiper
          slidesPerView={1}
          className='swiper-container-explore'
          modules={[Navigation, Pagination, A11y, Scrollbar]}
          pagination={{ clickable: true }}>
          {listings.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}>
              <div
                className='swiperSlideDiv'
                style={{
                  background: `url(${data.imageUrls[0]}) center no-repeat`,
                }}>
                <p className='swiperSlideText'>{data.name}</p>
                <p className='swiperSlidePrice'>
                  ${data.discountedPrice ?? data.regularPrice}
                  {data.type === 'rent' && ' / Month'}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  );
}

export default Slider;
