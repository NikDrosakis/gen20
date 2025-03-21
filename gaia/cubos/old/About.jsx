import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Container, Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Fade from 'react-reveal';
import Header from '../components/Header';
import Footer from '../components/Footer';
import endpoints from '../constants/endpoints';
import FallbackSpinner from '../components/FallbackSpinner';

const styles = {
  introTextContainer: {
    margin: 10,
    flexDirection: 'column',
    whiteSpace: 'pre-wrap',
    textAlign: 'left',
    fontSize: '1.2em',
    fontWeight: 500,
  },
  introImageContainer: {
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
};
function About(props) {
  const { header } = props;
  const [data, setData] = useState(null);
  const parseIntro = (text) => (
    <ReactMarkdown
      children={text}
    />
  );

  useEffect(() => {
    const fetchData = async () =>{
      fetch(process.env.REACT_APP_HTTP_API+endpoints.about, {
        method: 'GET',
      })
          .then((res) => res.json())
          .then((res) => setData(res.data))
          .catch((err) => err);
    }
    fetchData();
  }, []);
  return (
    <>
      <Header title={header} />
      <div className="section-content-container">
        <Container>
          {data
            ? (
              <Fade>
                <Row>
                  <Col style={styles.introTextContainer}>
                    {parseIntro(data.about)}
                  </Col>
                  <Col style={styles.introImageContainer}>
                    <img src={data?.imageSource} alt="profile" className="profilephoto" />
                  </Col>
                </Row>
              </Fade>
            )
            : <FallbackSpinner />}
        </Container>
      </div>
      <Footer />
    </>
  );
}

About.propTypes = {
  header: PropTypes.string.isRequired,
};

export default About;
