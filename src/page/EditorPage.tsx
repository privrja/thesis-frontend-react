import * as React from "react";
// @ts-ignore
import {Jsme} from 'jsme-react';
import styles from "../main.module.scss";
import {EDITOR_BACK, EDITOR_SMILES, ENDPOINT} from "../constant/ApiConstants";

interface State {
    smiles: string;
}

class EditorPage extends React.Component<any, State> {

    constructor(props: any) {
        super(props);
        this.smiles = this.smiles.bind(this);
        this.back = this.back.bind(this);
        this.state = {smiles: this.props.match.params.smiles};
    }

    smiles(smiles: string) {
        this.setState({smiles: smiles});
    }

    back() {
        fetch(ENDPOINT + 'smiles/unique', {
            method: 'POST',
            body: JSON.stringify([{smiles: this.state.smiles}])
        }).then(response => {
            console.log(response);
            if (response.status === 200) {
                response.json().then(data => localStorage.setItem(EDITOR_SMILES, data[0].unique));
            } else {
                localStorage.setItem(EDITOR_SMILES, this.state.smiles);
            }
            this.cancel();
        });
    }

    cancel() {
        let back = localStorage.getItem(EDITOR_BACK);
        if (back) {
            document.location.href = back;
        }
    }

    render() {
        return (
            <section className={styles.page}>
                <section>
                <Jsme height="70vh" width="50wv" options="oldlook,star" smiles={this.props.match.params.smiles} onChange={this.smiles}/>
                    { localStorage.getItem(EDITOR_BACK) ? <div><button onClick={this.back}>Go Back</button><button onClick={this.cancel}>Cancel</button></div> : '' }
                    <button onClick={() => document.location.reload()}>Reset</button>
                </section>
            </section>
        );
    }

}

export default EditorPage;
