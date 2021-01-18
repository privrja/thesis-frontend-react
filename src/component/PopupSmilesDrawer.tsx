import * as React from "react";
import styles from "../main.module.scss";

interface Props {
    id: string;
    className: string;
}

interface State {
    isActive: boolean;
}

class PopupSmilesDrawer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.deactivate = this.deactivate.bind(this);
        this.state = {isActive: false};
    }

    activate() {
        this.setState({isActive: true});
    }

    deactivate() {
        this.setState({isActive: false});
    }

    render() {
        if (this.state.isActive) {
            return (
                <div className={this.props.className} onClick={this.deactivate}>
                    <canvas id={this.props.id}/>
                </div>
            )
        } else {
            return <div className={this.props.className + ' ' + styles.hidden}>
                <canvas id={this.props.id}/>
            </div>
        }
    }
}

export default PopupSmilesDrawer;
