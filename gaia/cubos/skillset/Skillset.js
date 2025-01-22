// /var/www/gs/cubos/Skillset/Skillset.js
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import Fade from 'react-reveal';
import { Container } from 'react-bootstrap';

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

function Skillset(props) {
    const { header } = props;
    const [data, setData] = useState(null);

    const renderSkillsIntro = (intro) =>
        React.createElement('h4', { style: styles.introTextContainer },
            React.createElement(ReactMarkdown, { children: intro })
        );

    useEffect(() => {
        fetch(process.env.REACT_APP_HTTP_API + 'get/dev/skills', {
            method: 'GET',
        })
            .then((res) => res.json())
            .then((res) => {
                console.log(res);
                setData(res);
            })
            .catch((err) => console.error(err));
    }, []);

    return React.createElement(
        React.Fragment,
        null,
        // Removed Header here
        data ? (
            React.createElement(Fade, null,
                React.createElement('div', { className: 'section-content-container' },
                    React.createElement(Container, null,
                        renderSkillsIntro(data.intro),
                        data.skills?.map((rows) =>
                            React.createElement('div', { key: rows.title },
                                React.createElement('br'),
                                React.createElement('h3', null, rows.title),
                                rows.items.map((item) =>
                                    React.createElement('div', { key: item.title, style: { display: 'inline-block' } },
                                        React.createElement('img', { style: styles.iconStyle, src: item.icon, alt: item.title }),
                                        React.createElement('p', null, item.title)
                                    )
                                )
                            )
                        )
                    )
                )
            )
        ) : <FallbackSpinner />
    );
}

Skillset.propTypes = {
    header: PropTypes.string.isRequired,
};

export default Skillset;
