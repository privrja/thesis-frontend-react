import React from "react";
import HeaderTile from "./HeaderTile";
import styles from "../main.module.scss"

class Header extends React.Component {

    render() {
        return (
            <header>
                <div className={styles.headerContainer}>
                    <HeaderTile text={'BBDGNC'}/>
                    <HeaderTile text={'Containers'}/>
                    <HeaderTile text={'Sequences'}/>
                    <HeaderTile text={'Blocks'}/>
                    <HeaderTile text={'Modification'}/>
                    <HeaderTile text={'Import'}/>
                    <HeaderTile text={'Export'}/>
                    <HeaderTile text={'Settings'}/>
                    <HeaderTile text={'Login'}/>
                </div>
            </header>
        )
    }

}

export default Header;
