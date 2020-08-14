import React from "react";
import styles from "../main.module.scss"

interface Props {
    text: string;
    url: string;
}

class HeaderTile extends React.Component<Props> {

    render() {
        return (
            <div className={styles.headerTile}><a className={styles.headerRef}
                                                  href={this.props.url}>{this.props.text}</a></div>
        )
    }

}

export default HeaderTile;