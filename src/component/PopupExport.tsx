import * as React from "react";
import styles from "../main.module.scss"
import {saveAs} from 'file-saver'
import {TOKEN} from "../constant/ApiConstants";
import {ENDPOINT} from "../constant/Constants";

interface Props {
    label: string;
    onFail: () => void;
}

interface State {
    isActive: boolean;
    containerId: number;
}

class PopupExport extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.activate = this.activate.bind(this);
        this.all = this.all.bind(this);
        this.sequences = this.sequences.bind(this);
        this.blocks = this.blocks.bind(this);
        this.mergedBlocks = this.mergedBlocks.bind(this);
        this.modifications = this.modifications.bind(this);
        this.getFile = this.getFile.bind(this);
        this.deactivate = this.deactivate.bind(this);
        this.state = {isActive: false, containerId: 4};
    }

    activate(containerId: number) {
        this.setState({isActive: true, containerId: containerId});
    }

    deactivate() {
        this.setState({isActive: false});
    }

    all() {
        this.getFile('/export', 'archive.zip')
    }

    sequences() {
        this.getFile('/sequence/export');
    }

    blocks() {
        this.getFile('/block/export');
    }

    modifications() {
        this.getFile('/modification/export');
    }

    mergedBlocks() {
        this.getFile('/block/export/merge')
    }

    getFile(url: string, fileName: string = 'data.txt') {
        let token = localStorage.getItem(TOKEN);
        let headers: any = {method: 'GET'};
        if (token) {
            headers = {
                method: 'GET',
                headers: {'x-auth-token': token}
            };
        }
        fetch(ENDPOINT + 'container/' + this.state.containerId + url, headers).then(response => {
            if (response.status === 200) {
                return response.blob().then(blob => saveAs(blob, fileName));
            } else {
                this.props.onFail();
            }
        });
        this.deactivate();
    }

    render() {
        if (this.state.isActive) {
            return (
                <div className={styles.popup}>{this.props.label}
                    <button className={styles.popupYes + ' ' + styles.popupButton} onClick={this.all}>All</button>
                    <button className={styles.popupYes + ' ' + styles.popupButton} onClick={this.sequences}>Sequences
                    </button>
                    <button className={styles.popupYes + ' ' + styles.popupButton} onClick={this.blocks}>Blocks</button>
                    <button className={styles.popupYes + ' ' + styles.popupButton} onClick={this.mergedBlocks}>Merged blocks
                    </button>
                    <button className={styles.popupYes + ' ' + styles.popupButton}
                            onClick={this.modifications}>Modifications
                    </button>
                    <button className={styles.popupNo + ' ' + styles.popupButton} onClick={this.deactivate}>Cancel
                    </button>
                </div>
            )
        } else {
            return (
                <div className={styles.hidden + ' ' + styles.popup}>{this.props.label}
                    <button className={styles.popupYes + ' ' + styles.popupButton} onClick={this.all}>Export All
                    </button>
                    <button className={styles.popupYes + ' ' + styles.popupButton} onClick={this.sequences}>Export
                        Sequences
                    </button>
                    <button className={styles.popupYes + ' ' + styles.popupButton} onClick={this.blocks}>Export Blocks
                    </button>
                    <button className={styles.popupYes + ' ' + styles.popupButton} onClick={this.mergedBlocks}>Merged blocks
                    </button>
                    <button className={styles.popupYes + ' ' + styles.popupButton} onClick={this.modifications}>Export
                        Modifications
                    </button>
                    <button className={styles.popupNo + ' ' + styles.popupButton} onClick={this.deactivate}>Cancel
                    </button>
                </div>
            )
        }
    }
}

export default PopupExport;
