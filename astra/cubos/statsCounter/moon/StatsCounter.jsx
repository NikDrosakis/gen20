import CountUp from 'react-countup';
import './StatsCounter.css';

const STATS = [
    { icon: '/img/icons/ci-1.png', end: 230, label: 'Completed Projects' },
    { icon: '/img/icons/ci-2.png', end: 1068, label: 'Happy clients', variant: 'second' },
    { icon: '/img/icons/ci-3.png', end: 230, label: 'Prospective clients', variant: 'third' },
    { icon: '/img/icons/ci-4.png', end: 230, label: 'Completed Projects', variant: 'four' },
];

const StatsCounter = ({ duration = 10 }) => {
    return (
        <section className="counter">
            <div className="container">
                <div className="counter__content">
                    <div className="row">
                        {STATS.map(({ icon, end, label, variant }, i) => (
                            <div key={i} className="col-lg-3 col-md-6 col-sm-6">
                                <div className={`counter__item${variant ? ` ${variant}__item` : ''}`}>
                                    <div className="counter__item__text">
                                        <img src={icon} alt="" />
                                        <h2><CountUp duration={duration} end={end} /></h2>
                                        <p>{label}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsCounter;