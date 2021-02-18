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
import {URL_PREFIX} from "./constant/ApiConstants";
import ImportPage from "./page/ImportPage";

function App() {

    return (
        <div>
            <Header/>
            <Helmet>
                <title>MassSpecBlocks</title>
            </Helmet>

            <Router>
                <Route exact path={URL_PREFIX} component={MainPage}/>
                <Route path={URL_PREFIX + 'login/'} component={LoginPage}/>
                <Route path={URL_PREFIX + 'logout/'} component={LogoutPage}/>
                <Route path={URL_PREFIX + 'register/'} component={RegisterPage}/>
                <Route path={URL_PREFIX + 'container/:id/modification/'} exact component={ModificationPage}/>
                <Route path={URL_PREFIX + 'container/:id/block/'} exact component={BlockPage}/>
                <Route path={URL_PREFIX + 'container/:id/sequence/'} exact component={SequencePage}/>
                <Route path={URL_PREFIX + 'smiles/:smiles'} exact component={EditorPage}/>
                <Route path={URL_PREFIX + 'smiles/'} exact component={EditorPage}/>
                <Route path={URL_PREFIX + 'container/:id'} exact component={ContainerDetailPage} />
                <Route path={URL_PREFIX + 'container/'} exact component={ContainerPage}/>
                <Route path={URL_PREFIX + 'condition/'} component={ConditionsPage}/>
                <Route path={URL_PREFIX + 'reference/'} component={ReferencePage}/>
                <Route path={URL_PREFIX + 'import/'} component={ImportPage}/>
            </Router>

            <Footer/>
        </div>
    );
}


export default App;
