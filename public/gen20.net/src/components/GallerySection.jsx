import React, { useEffect, useState } from 'react';
import Player from './Player';
import PlayButton from '../modules/PlayButton';
import DB from '../contexts/DB';

const GallerySection = () => {
    const [isOpen, setOpen] = useState(false);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await DB.maria('fa', 'select * from gen_gen20net.media where mediagrpid=1 ORDER BY created DESC');
                setGroups(Array.isArray(res) ? res : []);
                if (res?.length) setSelectedGroup(res[0].id);
            } catch (err) {
                console.error("Error fetching media:", err);
                setGroups([]);
            }
        };
        fetchGroups();
    }, []);

    const handleChange = () => setOpen(!isOpen);

    const getThumbnail = (img) => {
        // Handle external or local image fallback
        if (img?.startsWith('http')) return img;
        return `/media/${img?.trim() || 'default.jpg'}`;
    };

    return (
        <div className="portfolio spad">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <ul className="portfolio__filter">
                            <li className="active" data-filter="*">All</li>
                            <li data-filter=".branding">Film</li>
                            <li data-filter=".digital-marketing">Theatre</li>
                            <li data-filter=".web">Live</li>
                            <li data-filter=".photography">Programming</li>
                            <li data-filter=".ecommerce">Action</li>
                        </ul>
                    </div>
                </div>
                <div className="row portfolio__gallery">
                    {groups.map((item, index) => (
                        <div
                            key={item.id || index}
                            className="col-lg-4 col-md-6 col-sm-6 mix digital-marketing"
                        >
                            <div className="portfolio__item">
                                <div
                                    className="portfolio__item__video"
                                    style={{
                                        backgroundImage: `url("${getThumbnail(item.img)}")`,
                                    }}
                                >
                                    <Player
                                        url={item.filepath || ''}
                                        isOpen={isOpen}
                                        close={handleChange}
                                    />
                                    <PlayButton click={handleChange} />
                                </div>
                                <div className="portfolio__item__text">
                                    <h4>{item.title || 'Χωρίς Τίτλο'}</h4>
                                    <ul>
                                        <li>{item.mediatype?.toUpperCase() || 'VIDEO'}</li>
                                        <li>{new Date(item.created).toLocaleDateString()}</li>
                                    </ul>
                                    <p className="mt-2" style={{ fontSize: '0.85rem' }}>
                                        {item.description?.split('\n')[0].slice(0, 150) + '...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!groups.length && (
                        <div className="col-lg-12 text-center mt-4">
                            <p>Δεν υπάρχουν διαθέσιμα βίντεο αυτή τη στιγμή.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GallerySection;
