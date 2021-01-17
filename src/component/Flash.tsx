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

    private customText = '';

    constructor(props: Props) {
        super(props);

        this.state = {isActive: false, flashType: FlashType.OK};
    }

    activate(flashType: FlashType, customText?: string) {
        this.customText = customText === undefined ? '' : customText;
        this.setState({isActive: true, flashType: flashType});
    }

    deactivate() {
        this.setState({isActive: false, flashType: FlashType.OK});
    }

    render() {
        if (this.state.isActive && this.state.flashType === FlashType.OK) {
            return <div className={styles.flashOk + " " + styles.flash}>{this.props.textOk} {this.customText}</div>
        } else if (this.state.isActive && this.state.flashType === FlashType.BAD) {
            return <div className={styles.flashBad + " " + styles.flash}>{this.props.textBad} {this.customText}</div>
        } else if (this.state.isActive && this.state.flashType === FlashType.PENDING) {
            return <div className={styles.flashPending + " " + styles.flash}>{this.props.textPending} {this.customText}</div>
        } else {
            return <div className={styles.hidden + " " + styles.flash}>{this.props.textBad}</div>
        }
    }

}

export default Flash;
