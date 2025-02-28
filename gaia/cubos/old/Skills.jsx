import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import Fade from 'react-reveal';
import { Container } from 'react-bootstrap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import endpoints from '../constants/endpoints';
import FallbackSpinner from '../components/FallbackSpinner';

const styles = {
  iconStyle: {
    height: 75,
    width: 75,
    margin: 10,
    marginBottom: 0,
  },
  introTextContainer: {
    whiteSpace: 'pre-wrap',
  },
};

function Skills(props) {
  const { header } = props;
  const [data, setData] = useState(null);

  const renderSkillsIntro = (intro) => (
      <h4 style={styles.introTextContainer}>
        <ReactMarkdown children={intro} />
      </h4>
  );

  useEffect(() => {
    fetch(process.env.REACT_APP_HTTP_API + endpoints.skills, {
      method: 'GET',
    })
        .then((res) => res.json())
        .then((res) => {
          console.log('Fetched data:', res.data); // Log the data structure
          setData(res.data);
        })
        .catch((err) => {
          console.error('Fetch error:', err);
        });
  }, []);

  return (
      <>
        <Header title={header} />
        {data ? (
            <Fade>
              <div className="section-content-container">
                <Container>
                  {renderSkillsIntro(data.intro)}

                  {/* Ensure skills exists and is an array before using map */}
                  {Array.isArray(data.skills) && data.skills.length > 0 ? (
                      data.skills.map((rows) => (
                          <div key={rows.title}>
                            <br />
                            <h3>{rows.title}</h3>
                            {Array.isArray(rows.items) && rows.items.length > 0 ? (
                                rows.items.map((item) => (
                                    <div key={item.title} style={{ display: 'inline-block' }}>
                                      <img
                                          style={styles.iconStyle}
                                          src={item.icon}
                                          alt={item.title}
                                      />
                                      <p>{item.title}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No items available in {rows.title}</p>
                            )}
                          </div>
                      ))
                  ) : (
                      <p>No skills available.</p>
                  )}
                </Container>
              </div>
            </Fade>
        ) : (
            <FallbackSpinner />
        )}
        <Footer />
      </>
  );
}

Skills.propTypes = {
  header: PropTypes.string.isRequired,
};

export default Skills;
