import React from "react";
import Flash from "./Flash";
import styles from "../main.module.scss";
import {SelectInput, SelectOption} from "./SelectInput";
import {ENDPOINT, TOKEN} from "../constant/ApiConstants";
import FlashType from "./FlashType";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import FetchHelper from "../helper/FetchHelper";

const SIMILARITY_OPTIONS = [
  new SelectOption('name', 'name'),
  new SelectOption('tanimoto', 'tanimoto')
];

const SEL_SIMILARITY = 'sel-similarity';

class AdminSimilarity extends React.Component<any, any>{

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.setupSimilarity = this.setupSimilarity.bind(this);
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
                <h3>Similarity setup</h3>
                <Flash ref={this.flashRef}/>
                <label htmlFor={SEL_SIMILARITY}>Similarity:</label>
                <SelectInput options={SIMILARITY_OPTIONS} id={SEL_SIMILARITY} name={SEL_SIMILARITY} />
                <button className={styles.update} onClick={this.setupSimilarity}>Change</button>
            </section>
        );
    }

}

export default AdminSimilarity;
