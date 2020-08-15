import React from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";
import './main.module.scss';
import Header from "./template/Header";
import Footer from "./template/Footer";
import MainPage from "./page/MainPage";
import LoginPage from "./page/LoginPage";

function App() {

    return (
        <div>
            <Header/>

            <Router>
                <Route exact path='/' component={MainPage}/>
                <Route path='/login/' component={LoginPage}/>
            </Router>

            <Footer/>
        </div>
    );
}


export default App;
