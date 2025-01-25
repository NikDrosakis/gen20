import React from "react";
import Header from '../components/Header';
import MainOnecolumn from '../components/MainOnecolumn';
import Footer from '../components/Footer';

const Onecolumn=()=> {
  return (
    <div id="page-wrapper">
      <Header />
      <MainOnecolumn/>
      <Footer />
    </div>
  )
}
export default Onecolumn;