import React from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";
import './main.module.scss';
import Header from "./template/Header";
import Footer from "./template/Footer";
import MainPage from "./page/MainPage";
import LoginPage from "./page/LoginPage";
import ContainerPage from "./page/ContainerPage";
import LogoutPage from "./page/LogoutPage";
import ContainerDetailPage from "./page/ContainerDetailPage";
import RegisterPage from "./page/RegisterPage";
import ConditionsPage from "./page/ConditionsPage";
import BlockPage from "./page/BlockPage";

function App() {

    return (
        <div>
            <Header/>

            <Router>
                <Route exact path='/' component={MainPage}/>
                <Route path='/login/' component={LoginPage}/>
                <Route path='/logout/' component={LogoutPage}/>
                <Route path='/register/' component={RegisterPage}/>
                <Route path='/container/:id/block/' exact component={BlockPage}/>
                <Route path='/container/:id' exact component={ContainerDetailPage} />
                <Route path='/container/' exact component={ContainerPage}/>
                <Route path='/condition/' component={ConditionsPage}/>
            </Router>

            <Footer/>
        </div>
    );
}


export default App;
