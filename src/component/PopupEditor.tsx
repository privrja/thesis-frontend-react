import * as React from "react";
import styles from "../main.module.scss";
// @ts-ignore
import {Jsme} from 'jsme-react';
import {ENDPOINT} from "../constant/ApiConstants";

interface Props {
    id: string;
    className: string;
    onClose: (smiles: string) => void;
}

interface State {
    isActive: boolean;
    smiles: string;
}

class PopupEditor extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.deactivate = this.deactivate.bind(this);
        this.activate = this.activate.bind(this);
        this.smiles = this.smiles.bind(this);
        this.done = this.done.bind(this);
        this.state = {isActive: false, smiles: 'CCC'};
    }

    activate(smiles: string) {
        this.setState({isActive: true, smiles: smiles});
    }

    deactivate() {
        this.setState({isActive: false});
    }

    done() {
        fetch(ENDPOINT + 'smiles/unique', {
            method: 'POST',
            body: JSON.stringify([{smiles: this.state.smiles}])
        }).then(response => {
            console.log(response);
            if (response.status === 200) {
                response.json().then(data => this.props.onClose(data[0].unique));
            } else {
                this.props.onClose(this.state.smiles);
            }
            this.deactivate();
        });
    }

    smiles(smiles: string) {
        this.setState({smiles: smiles});
    }

    render() {
        if (this.state.isActive) {
            return (
                <div className={this.props.className} onClick={this.deactivate}>
                    <Jsme height="80vh" width="50wv" options="oldlook,star" smiles={this.state.smiles}
                          onChange={this.smiles}/>
                    <div>
                        <button onClick={this.done}>Done</button>
                        <button onClick={this.deactivate}>Cancel</button>
                    </div>
                </div>
            )
        } else {
            return <div className={this.props.className + ' ' + styles.hidden}>
            </div>
        }
    }
}

export default PopupEditor;
