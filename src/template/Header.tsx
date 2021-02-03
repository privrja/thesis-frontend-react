import * as React from "react";
import HeaderTile from "./HeaderTile";
import styles from "../main.module.scss"
import {SELECTED_CONTAINER, TOKEN} from "../constant/ApiConstants";

class Header extends React.Component {

    render() {
        return (
            <header>
                <div className={styles.headerContainer}>
                    <HeaderTile text={'MassSpecBlocks'} url={'/'}/>
                    <HeaderTile text={'Containers'} url={'/container'}/>
                    <HeaderTile text={'Sequences'} url={'/sequence'}/>
                    <HeaderTile text={'Blocks'} url={'/container/' + (localStorage.getItem(SELECTED_CONTAINER) ?? '1') + '/block'}/>
                    <HeaderTile text={'Modifications'} url={'/modification'}/>
                    <HeaderTile text={'Import'} url={'/import'}/>
                    <HeaderTile text={'Settings'} url={'/setup'}/>
                    {localStorage.getItem(TOKEN) ? <HeaderTile text={'Logout'} url={'/logout'}/> : <HeaderTile text={'Login'} url={'/login'}/>}
                </div>
            </header>
        )
    }

}

export default Header;
