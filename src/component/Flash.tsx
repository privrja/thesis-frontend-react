import * as React from "react";
import styles from "../main.module.scss"
import FlashType from "./FlashType";

interface Props {
    textOk?: string;
    textBad?: string;
    textPending?: string;
}

interface State {
    isActive: boolean;
    flashType: FlashType;
}

class Flash extends React.Component<Props, State> {
    public static defaultProps = {
        textOk: 'OK',
        textBad: 'Failure!',
        textPending: 'Pending ...'
    };

    constructor(props: Props) {
        super(props);

        this.state = {isActive: false, flashType: FlashType.OK};
    }

    activate(flashType: FlashType) {
        this.setState({isActive: true, flashType: flashType});
    }

    render() {
        if (this.state.isActive && this.state.flashType === FlashType.OK) {
            return <div className={styles.flashOk + " " + styles.flash}>{this.props.textOk}</div>
        } else if (this.state.isActive && this.state.flashType === FlashType.BAD) {
            return <div className={styles.flashBad + " " + styles.flash}>{this.props.textBad}</div>
        } else if (this.state.isActive && this.state.flashType === FlashType.PENDING) {
            return <div className={styles.flashPending + " " + styles.flash}>{this.props.textPending}</div>
        } else {
            return <div className={styles.hidden + " " + styles.flash}>{this.props.textBad}</div>
        }
    }

}

export default Flash;
