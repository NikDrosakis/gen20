import React from "react";
import Header from '../components/Header';
import Banner from '../components/Banner';
import Footer from '../components/Footer';

const Home=()=> {
  return (
      <div id="page-wrapper">
          <Header/>
          <Banner/>
          <div id="main">
              <div className="container">
                  <div className="row main-row">
                      <Welcome/>
                      <Excerpt/>
                      <Morelinks/>
                      <ExcerptLarge/>
                      <ExcerptImgLarge/>
                  </div>
              </div>
          </div>
          <Footer/>
      </div>
  )
}
export default Home;