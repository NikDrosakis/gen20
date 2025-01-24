import React from 'react';
import {Link} from "react-router-dom";
import Header from '../components/Header';
export default function Chatbot() {
    return (
        <>
        <div id="main_window">
            <div id="wrapper">
                <div id="wrapper_inner">
<Header/>
                    <div className="topnav" id="myTopnav">
                        <Link to="/cbot" className="active">Chatbot</Link>
                        <Link href="/ses">Sessions</Link>
                        <Link href="/ses?id=new">Session+</Link>
                        <Link href="/persons">Persons</Link>
                        <Link href="/cite">Citations</Link>
                        <Link href="/idea">Ideas</Link>
                        <Link href="/event">Events</Link>
                        <Link href="/cat">Cats</Link>
                        <Link href="/tag">Tags</Link>
                        <Link href="/doc">Doc</Link>
                    </div>
                    <div className="chatAll">
                        <div contentEditable="true" id="chatText" className="chatBoardText2"></div>
                        <button className="btn btn-primary" id="chatSubmit">Reply</button>
                        <div className="chatCon">
                            <div id="chatDialog" className="interviewsEr_messageFromEe2"
                                 placeholder="Reason of changing time" style={{bottom:'0'}}>
                                <div className="chatBoard_top1">
                                    <div className="userid_15"></div>
                                    <span id="chatTitle" style={{cursor:'pointer'}} className="chatBoard_title1">
                    <Link className="fn" onClick="window.open(this.id)"></Link></span>
                                </div>
                                <div id="chat" className="chatBoardTextHistory3">
                                    <div className="chatBoardResponce">
                                        <div className="chatResponceCont" id="chati">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    <div id="main_window" style={{width: '100%'}}>
        <div id="wrapper">
            <div id="wrapper_inner" style={{display:'block'}}>
                <div style={{height:'300px',overflow:'hidden'}}>
                    <h1 className="shadow1">Gen20 Bot</h1>
                    <img alt="" src="https://miro.medium.com/max/20000/1*6YEZ5H5c5U-P5y_B4isT4w.jpeg"/>
                    <span id="chatbot"></span>
                </div>
                <div className="topnav" id="myTopnav">
                    <Link to="/cbot" className="active">Chatbot</Link>
                    <Link to="/ses">Sessions</Link>
                    <Link to="/ses?id=new">Session+</Link>
                    <Link to="/persons">Persons</Link>
                    <Link to="/cite">Citations</Link>
                    <Link to="/idea">Ideas</Link>
                    <Link to="/event">Events</Link>
                    <Link to="/cat">Cats</Link>
                    <Link to="/tag">Tags</Link>
                    <Link to="/doc">Doc</Link>
                </div>
                <div className="chatAll">
                    <div contentEditable="true" id="chatText" className="chatBoardText2"></div>
                    <button className="btn btn-primary" id="chatSubmit">Reply</button>
                    <div className="chatCon">
                        <div id="chatDialog" className="interviewsEr_messageFromEe2"
                             placeholder="Reason of changing time" style={{bottom:'0'}}>
                            <div className="chatBoard_top1">
                                <div className="userid_15"></div>
                                <span id="chatTitle" style={{cursor:'pointer'}} className="chatBoard_title1">
                    <Link className="fn" onClick="window.open(this.id)"></Link>
                                </span>
                            </div>
                            <div id="chat" className="chatBoardTextHistory3">
                                <div className="chatBoardResponce">
                                    <div className="chatResponceCont" id="chati">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
        </>
)
    ;
}
