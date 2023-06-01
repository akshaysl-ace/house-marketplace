import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReactComponent as OfferIcon } from '../assets/svg/localOfferIcon.svg';
import { ReactComponent as ExploreIcon } from '../assets/svg/exploreIcon.svg';
import { ReactComponent as PersonOutlineIcon } from '../assets/svg/personOutlineIcon.svg';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathMatchRoutes = route => {
    if (route === location.pathname) return true;
    return false;
  };

  return (
    <footer className='navbar'>
      <div className='navbarNav'>
        <ul className='navbarListItems'>
          <li className='navbarListItem' onClick={() => navigate('/')}>
            <ExploreIcon
              fill={pathMatchRoutes('/') ? '#2c2c2c' : '#8f8f8f'}
              width='36px'
              height='36px'
            />
            <p
              className={
                pathMatchRoutes('/explore')
                  ? 'navbarListItemNameActive'
                  : 'navbarListName'
              }>
              Explore
            </p>
          </li>
          <li className='navbarListItem' onClick={() => navigate('/offers')}>
            <OfferIcon
              fill={pathMatchRoutes('/offers') ? '#2c2c2c' : '#8f8f8f'}
              width='36px'
              height='36px'
            />
            <p
              className={
                pathMatchRoutes('/offers')
                  ? 'navbarListItemNameActive'
                  : 'navbarListName'
              }>
              Offers
            </p>
          </li>
          <li className='navbarListItem' onClick={() => navigate('/profile')}>
            <PersonOutlineIcon
              fill={pathMatchRoutes('/profile') ? '#2c2c2c' : '#8f8f8f'}
              width='36px'
              height='36px'
            />
            <p
              className={
                pathMatchRoutes('/profile')
                  ? 'navbarListItemNameActive'
                  : 'navbarListName'
              }>
              Profile
            </p>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default NavBar;
