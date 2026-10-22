import React from "react";
import { Grow, IconButton } from '@mui/material';
import ReactPlayer from 'react-player';
import { createSvgIcon } from '@mui/material/utils';
const CloseIcon = createSvgIcon(
    <path
        d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"
        fill="currentColor"
    />,
    'Close'
);
function Player({ url, isOpen, close }) {
    return (
        <Grow in={isOpen} mountOnEnter unmountOnExit>
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1300
            }}>
                <div style={{ position: 'relative', width: '80%', maxWidth: 800 }}>
                    <IconButton
                        onClick={close}
                        style={{ position: 'absolute', top: 10, right: 10, color: 'white' }}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <ReactPlayer
                        url={url}
                        width="100%"
                        height="450px"
                        playing={isOpen}
                        controls
                    />
                </div>
            </div>
        </Grow>
    );
}

export default Player;
