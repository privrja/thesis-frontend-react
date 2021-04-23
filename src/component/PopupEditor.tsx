import * as React from "react";
import styles from "../main.module.scss";
// @ts-ignore
import {Jsme} from 'jsme-react';
import {ENDPOINT} from "../constant/Constants";

interface Props {
    id: string;
    className: string;
    onClose: (smiles: string) => void;
}

interface State {
    isActive: boolean;
    firstSmiles: string;
    smiles: string;
}

class PopupEditor extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.deactivate = this.deactivate.bind(this);
        this.activate = this.activate.bind(this);
        this.smiles = this.smiles.bind(this);
        this.done = this.done.bind(this);
        this.state = {isActive: false, firstSmiles: 'CCC', smiles: 'CCC'};
    }

    activate(smiles: string) {
        this.setState({isActive: true, firstSmiles: smiles, smiles: smiles});
    }

    deactivate() {
        this.setState({isActive: false});
    }

    done() {
        fetch(ENDPOINT + 'smiles/unique', {
            method: 'POST',
            body: JSON.stringify([{smiles: this.state.smiles}])
        }).then(response => {
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
                <div className={this.props.className}>
                    <Jsme height="80vh" width="50wv" options="oldlook,star" smiles={this.state.firstSmiles}
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
