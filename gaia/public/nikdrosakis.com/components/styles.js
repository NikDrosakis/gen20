// styles.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import DarkModeToggle from 'react-dark-mode-toggle';
import PropTypes from 'prop-types';

// Theme definitions
export const lightTheme = {
    background: '#fff',
    color: '#121212',
    accentColor: '#3D84C6',
    chronoTheme: {
        cardBgColor: 'white',
        cardForeColor: 'black',
        titleColor: 'white',
    },
    navbar__link: 'white',
    timelineLineColor: '#ccc',
    cardBackground: '#fff',
    rainFillstyle: "rgba(100, 100, 100, 0.55)",
    cardFooterBackground: '#f7f7f7',
    cardBorderColor: '#00000020',
    navbarTheme: {
        linkColor: '#dedede',
        linkHoverColor: '#fefefe',
        linkActiveColor: '#fefefe',
    },
    bsPrimaryVariant: 'light',
    bsSecondaryVariant: 'dark',
    socialIconBgColor: '#121212',
};

export const darkTheme = {
    background: '#121212',
    color: '#eee',
    navbar__link: '#eee',
    accentColor: '#3D84C6',
    chronoTheme: {
        cardBgColor: '#1B1B1B',
        cardForeColor: '#eee',
        titleColor: 'white',
    },
    timelineLineColor: '#444',
    cardBackground: '#060606',
    rainFillstyle: 'rgba(0, 0, 0, 0.05)',
    cardFooterBackground: '#181818',
    cardBorderColor: '#ffffff20',
    navbarTheme: {
        linkColor: '#dedede',
        linkHoverColor: '#fefefe',
        linkActiveColor: '#fefefe',
    },
    bsPrimaryVariant: 'dark',
    bsSecondaryVariant: 'light',
    socialIconBgColor: '#121212',
};

// Global styles
export const GlobalStyles = createGlobalStyle`
  body {
      background: ${({ theme }) => theme.background};
      color: ${({ theme }) => theme.color};
      transition: background 0.50s linear, color 0.50s linear;
  }
  a {
      color: ${({ theme }) => theme.color};
      transition: color 0.50s linear;
  }
  .navbar {
      background: ${({ theme }) => theme.background};
      color: ${({ theme }) => theme.color};
      transition: background 0.50s linear, color 0.50s linear;
  }
  .rc-title {
      color: ${({ theme }) => theme.color};
      transition: color 0.50s linear;
  }
`;

// AppContext for dark mode state management
const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const loadDarkMode = () => {
            const value = localStorage.getItem('display');
            if (value !== null) {
                setDarkMode(value === 'dark');
            } else {
                const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setDarkMode(prefersDarkScheme);
            }
        };
        loadDarkMode();
    }, []);

    const toggleDarkMode = () => {
        const newValue = !darkMode;
        setDarkMode(newValue);
        localStorage.setItem('display', newValue ? 'dark' : 'light');
    };

    return (
        <AppContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </AppContext.Provider>
    );
};

// ThemeToggler component
function ThemeToggler(props) {
    const { onClick } = props;
    const { darkMode, toggleDarkMode } = useContext(AppContext);

    const handleOnChange = () => {
        toggleDarkMode();
        onClick();
    };

    return (
        <div style={{ marginBottom: 8 }}>
            <DarkModeToggle
                onChange={handleOnChange}
                checked={darkMode}
                size={50}
            />
        </div>
    );
}

ThemeToggler.propTypes = {
    onClick: PropTypes.func,
};

ThemeToggler.defaultProps = {
    onClick: () => {},
};

export { AppContext,  ThemeToggler };
