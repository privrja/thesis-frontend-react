import * as React from "react";
import styles from "../main.module.scss"
import {Link} from "react-router-dom";

interface Props {
    text: string;
    url: string;
}

class HeaderTile extends React.Component<Props> {

    render() {
        return (
            <div className={styles.headerTile}>
                <Link className={styles.headerRef} to={this.props.url}>{this.props.text}</Link>
            </div>
        )
    }

}

export default HeaderTile;