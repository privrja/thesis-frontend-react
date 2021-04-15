import React from "react";
import Flash from "./Flash";
import styles from "../main.module.scss";
import {SelectInput, SelectOption} from "./SelectInput";
import {TOKEN} from "../constant/ApiConstants";
import FlashType from "./FlashType";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import FetchHelper from "../helper/FetchHelper";
import {ENDPOINT} from "../constant/Constants";

const SIMILARITY_OPTIONS = [
    new SelectOption('name', 'name'),
    new SelectOption('tanimoto', 'tanimoto')
];

const SEL_SIMILARITY = 'sel-similarity';

interface State {
    similarity: string;
}

class AdminSimilarity extends React.Component<any, State> {

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.setupSimilarity = this.setupSimilarity.bind(this);
        this.state = {similarity: 'name'};
    }

    componentDidMount(): void {
        this.getSimilarity();
    }

    getSimilarity() {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'setup/similarity', {
                method: 'GET',
                headers: {'x-auth-token': token},
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => this.setState({similarity: data.similarity}));
                }
            })
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    setupSimilarity() {
        let similarity = document.getElementById(SEL_SIMILARITY) as HTMLSelectElement;
        let token = localStorage.getItem(TOKEN);
        if (token) {
            FetchHelper.fetchSetup(ENDPOINT + 'setup/similarity', {
                method: 'POST',
                headers: {'x-auth-token': token},
                body: JSON.stringify({similarity: similarity.value})
            }, this.flashRef);
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    render() {
        return (
            <section>
                <h2>Similarity setup</h2>
                <Flash ref={this.flashRef}/>
                <label htmlFor={SEL_SIMILARITY}>Similarity:</label>
                <SelectInput options={SIMILARITY_OPTIONS} id={SEL_SIMILARITY} name={SEL_SIMILARITY}
                             selected={this.state.similarity}/>
                <button className={styles.update} onClick={this.setupSimilarity}>Change</button>
            </section>
        );
    }

}

export default AdminSimilarity;
