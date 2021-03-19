import * as React from "react";
import styles from "../main.module.scss"

interface Props {
    label: string;
    onYes: Function;
    onNo?: Function;
}

interface State {
    isActive: boolean;
    text: string;
}

class PopupYesNo extends React.Component<Props, State> {

    key: number;

    constructor(props: Props) {
        super(props);

        this.key = -1;
        this.state = {isActive: false, text: ''};
        this.yes = this.yes.bind(this);
        this.no = this.no.bind(this);
    }

    activate(text: string = '') {
        this.setState({isActive: true, text: text});
    }

    no() {
        this.setState({isActive: false});
        if(this.props.onNo) {
            this.props.onNo(this.key);
        }
    }

    yes() {
        this.setState({isActive: false});
        this.props.onYes(this.key);
    }

    render() {
        if (this.state.isActive) {
            return (
                <div className={styles.popup}>{this.props.label} {this.state.text}
                    <button className={styles.popupYes + ' ' + styles.popupButton} onClick={this.yes}>Yes</button>
                    <button className={styles.popupNo + ' ' + styles.popupButton} onClick={this.no}>No</button>
                </div>
            )
        } else {
            return (
                <div className={styles.hidden + ' ' + styles.popup}>{this.props.label}
                    <button className={styles.popupYes + ' ' + styles.popupButton} onClick={this.yes}>Yes</button>
                    <button className={styles.popupNo + ' ' + styles.popupButton} onClick={this.no}>No</button>
                </div>
            )
        }
    }
}

export default PopupYesNo;
