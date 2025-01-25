import React from 'react';
import PropTypes from 'prop-types';
import '../styles/App.css';

function Footer(props) {
    const { title } = props;
    return <div className="footer">{title}</div>;
}

Footer.propTypes = {
    title: PropTypes.string.isRequired,
};

export default Footer;
