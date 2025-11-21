// src/components/AdminSidebar.tsx
import React, { useState } from 'react';
import '../assets/styles/AdminSidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell, faBars, faTimes,faHome,
  // faWallet,
  faUsers,faChartPie,faUser,faEnvelope,faCog,faSignOutAlt,faEnvelopeOpenText,
  // faUserPlus,
   faCirclePlus} from '@fortawesome/free-solid-svg-icons';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../config/api';

function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // to get current path
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  // helper to check if link is active
  const isActive = (path: string) => {
    const p = location.pathname;

    // treat members and addmember as the same active item
    if (path === '/members') {
      return p === '/members' || p === '/addmember';
    }
    if (path === '/staff') {
      return p === '/staff' || p === '/addstaff';
    }
    return p === path;
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      // call logout endpoint - apiRequest sends credentials by default (so cookie is cleared)
      await apiRequest({
        method: "POST",
        endpoint: "/auth/logout"
      });
    } catch (err) {
      // ignore network/backend errors for logout - still clear local tokens and redirect
      console.warn('Logout request failed:', err);
    } finally {
      try {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
      } catch (err) {
        // ignore storage errors
      }
      setLoggingOut(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className={`adminSidebar ${isOpen ? 'expanded' : ''}`}>
      <h1>
        <FontAwesomeIcon 
          icon={faDumbbell}
          style={{ color: 'var(--secondary-100)' }}
          size="2x"
        />{' '}
        FitFlex
      </h1>

      <button className="burger-btn" onClick={() => setIsOpen(!isOpen)}>
        <FontAwesomeIcon className="adminSidebarIcon" icon={isOpen ? faTimes : faBars} size="lg" />
      </button>
<div className={`sidebarAdminUl ${isOpen ? 'menu open' : 'menu'}`}>
<ul>
  <li className={isActive('/dashboard') ? 'active-link' : ''}>
    <NavLink to="/dashboard">
      <FontAwesomeIcon className="adminSidebarIcon"
        icon={faHome}
        style={{ color: isActive('/dashboard') ? 'var(--secondary-100)' : 'var(--primary-300)' }}
      />
      Dashboard
    </NavLink>
  </li>
  <li className={isActive('/members') ? 'active-link' : ''}>
    <NavLink to="/members">
      <FontAwesomeIcon className="adminSidebarIcon"
        icon={faUsers}
        style={{ color: isActive('/members') ? 'var(--secondary-100)' : 'var(--primary-300)' }}
      />
      Members
    </NavLink>
  </li>
  {/* <li className={isActive('/addmember') ? 'active-link' : ''}>
    <NavLink to="/addmember">
      <FontAwesomeIcon className="adminSidebarIcon"
        icon={faUserPlus}
        style={{ color: isActive('/addmember') ? 'var(--secondary-100)' : 'var(--primary-300)' }}
      />
      Add Member
    </NavLink>
  </li> */}
  <li className={isActive('/addpayment') ? 'active-link' : ''}>
    <NavLink to="/addpayment">
      <FontAwesomeIcon className="adminSidebarIcon"
        icon={faCirclePlus}
        style={{ color: isActive('/addpayment') ? 'var(--secondary-100)' : 'var(--primary-300)' }}
      />
      Add Payment
    </NavLink>
  </li>
  <li className={isActive('/finance') ? 'active-link' : ''}>
    <NavLink to="/finance">
      <FontAwesomeIcon className="adminSidebarIcon"
        icon={faChartPie}
        style={{ color: isActive('/finance') ? 'var(--secondary-100)' : 'var(--primary-300)' }}
      />
      Finance
    </NavLink>
  </li>
  {/* <li className={isActive('/Expense') ? 'active-link' : ''}>
    <NavLink to="/Expense">
      <FontAwesomeIcon className="adminSidebarIcon"
        icon={faWallet}
        style={{ color: isActive('/Expense') ? 'var(--secondary-100)' : 'var(--primary-300)' }}
      />
      Expense
    </NavLink>
  </li> */}
  {/* <li className={isActive('/AddExpense') ? 'active-link' : ''}>
    <NavLink to="/AddExpense">
      <FontAwesomeIcon className="adminSidebarIcon"
        icon={faWallet}
        style={{ color: isActive('/AddExpense') ? 'var(--secondary-100)' : 'var(--primary-300)' }}
      />
      Add Expense
    </NavLink>
  </li> */}
  <li className={isActive('/staff') ? 'active-link' : ''}>
    <NavLink to="/staff">
      <FontAwesomeIcon className="adminSidebarIcon"
        icon={faUser}
        style={{ color: isActive('/staff') ? 'var(--secondary-100)' : 'var(--primary-300)' }}
      />
      Staff
    </NavLink>
  </li>
  <li className={isActive('/enquiries') ? 'active-link' : ''}>
    <NavLink to="/enquiries">
      <FontAwesomeIcon className="adminSidebarIcon"
        icon={faEnvelope}
        style={{ color: isActive('/enquiries') ? 'var(--secondary-100)' : 'var(--primary-300)' }}
      />
      Enquiries
    </NavLink>
  </li>
  <li className={isActive('/addenquiries') ? 'active-link' : ''}>
    <NavLink to="/addenquiries">
      <FontAwesomeIcon className="adminSidebarIcon"
        icon={faEnvelopeOpenText}
        style={{ color: isActive('/addenquiries') ? 'var(--secondary-100)' : 'var(--primary-300)' }}
      />
      Add Enquiry
    </NavLink>
  </li>
</ul>
<ul >
  <li>
    <NavLink to="/setting">
      <FontAwesomeIcon className="adminSidebarIcon"
        icon={faCog}
        style={{ color: isActive('/setting') ? 'var(--secondary-100)' : 'var(--primary-300)' }}
      />
      Setting
    </NavLink>
  </li>
  <li>
    {/* keep markup & classname same; intercept click to perform logout */}
    <NavLink to="/logout" onClick={handleLogout} aria-disabled={loggingOut}>
      <FontAwesomeIcon className="adminSidebarIcon"
        icon={faSignOutAlt}
        style={{ color: isActive('/logout') ? 'var(--secondary-100)' : 'var(--primary-300)' }}
      />
      Logout
    </NavLink>
  </li>
</ul>
</div>
    </div>
  );
}

export default AdminSidebar;
