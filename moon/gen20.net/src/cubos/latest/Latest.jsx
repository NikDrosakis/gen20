import LatestCarousel from "./LatestCarousel";
const Latest = () => {
    return (
        <section className="latest spad">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="section-title center-title">
                            <span>Our Blog</span>
                            <h2>Blog Update</h2>
                        </div>
                    </div>
                </div>
<LatestCarousel/>
                </div>
        </section>
    );
}
export default Latest;