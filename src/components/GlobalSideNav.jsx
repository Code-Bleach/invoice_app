import React from 'react';
import { Link } from 'react-router-dom';
import './GlobalSideNav.css';
import appLogo from '../assets/barmilogo.png'; // Import the logo

// Placeholder icons
const ThemeIconPlaceholder = ({ theme }) => <span className="icon-placeholder">{theme === 'light' ? '🌙' : '☀️'}</span>; // Moon for light, Sun for dark
const AvatarPlaceholder = () => <div className="avatar-placeholder">AV</div>; // Placeholder for avatar

function GlobalSideNav({ currentTheme, toggleTheme }) {
  return (
    <nav className="global-side-nav">
      <div className="nav-top">
        <Link to="/" className="logo-link" aria-label="Go to homepage">
          <div className="logo-container"> {/* This div helps control the logo's shape/background */}
            <img src={appLogo} alt="Barmi Construction Logo" className="app-logo-img" />
          </div>
        </Link>
      </div>
      <div className="nav-bottom">
        <div className="theme-toggle-container">
          <button aria-label="Toggle theme" className="theme-button" onClick={toggleTheme}>
            <ThemeIconPlaceholder theme={currentTheme} />
          </button>
        </div>
        <div className="profile-container">
          <AvatarPlaceholder />
        </div>
      </div>
    </nav>
  );
}

export default GlobalSideNav;