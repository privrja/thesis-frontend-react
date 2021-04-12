import React from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";
import './main.module.scss';
import Helmet from "react-helmet";
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
import ModificationPage from "./page/ModificationPage";
import EditorPage from "./page/EditorPage";
import ReferencePage from "./page/ReferencePage";
import SequencePage from "./page/SequencePage";
import ImportPage from "./page/ImportPage";
import BlockUsagePage from "./page/BlockUsagePage";
import SettingPage from "./page/SettingPage";
import {URL_PREFIX} from "./constant/Constants";

function App() {

    return (
        <Router basename={URL_PREFIX}>
            <div id={'home'}>
                <Header/>
                <Helmet>
                    <title>MassSpecBlocks</title>
                </Helmet>
                <Route exact path={'/'} component={MainPage}/>
                <Route path={'/login/'} component={LoginPage}/>
                <Route path={'/logout/'} component={LogoutPage}/>
                <Route path={'/register/'} component={RegisterPage}/>
                <Route path={'/container/:id/modification/'} exact component={ModificationPage}/>
                <Route path={'/container/:id/block/'} exact component={BlockPage}/>
                <Route path={'/container/:id/block/:blockId/usage'} exact component={BlockUsagePage}/>
                <Route path={'/container/:id/sequence/'} exact component={SequencePage}/>
                <Route path={'/smiles/:smiles'} exact component={EditorPage}/>
                <Route path={'/smiles/'} exact component={EditorPage}/>
                <Route path={'/container/:id'} exact component={ContainerDetailPage}/>
                <Route path={'/container/'} exact component={ContainerPage}/>
                <Route path={'/condition/'} component={ConditionsPage}/>
                <Route path={'/reference/'} component={ReferencePage}/>
                <Route path={'/import/'} component={ImportPage}/>
                <Route path={'/setup/'} component={SettingPage}/>
                <Footer/>
            </div>
        </Router>
    );
}


export default App;
