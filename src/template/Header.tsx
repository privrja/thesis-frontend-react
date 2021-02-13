import * as React from "react";
import HeaderTile from "./HeaderTile";
import styles from "../main.module.scss"
import {SELECTED_CONTAINER, TOKEN, URL_PREFIX} from "../constant/ApiConstants";

class Header extends React.Component {

    render() {
        return (
            <header>
                <div className={styles.headerContainer}>
                    <HeaderTile text={'MassSpecBlocks'} url={URL_PREFIX}/>
                    <HeaderTile text={'Containers'} url={URL_PREFIX + 'container'}/>
                    <HeaderTile text={'Sequences'} url={URL_PREFIX + 'container/' + localStorage.getItem(SELECTED_CONTAINER ?? '4') + '/sequence'}/>
                    <HeaderTile text={'Blocks'} url={URL_PREFIX + 'container/' + (localStorage.getItem(SELECTED_CONTAINER) ?? '4') + '/block'}/>
                    <HeaderTile text={'Modifications'} url={'/' + URL_PREFIX + 'container/'+ (localStorage.getItem(SELECTED_CONTAINER) ?? '4') + '/modification'}/>
                    <HeaderTile text={'Import'} url={URL_PREFIX + 'import'}/>
                    <HeaderTile text={'Settings'} url={URL_PREFIX + 'setup'}/>
                    {localStorage.getItem(TOKEN) ? <HeaderTile text={'Logout'} url={URL_PREFIX + 'logout'}/> : <HeaderTile text={'Login'} url={URL_PREFIX + 'login'}/>}
                </div>
            </header>
        )
    }

}

export default Header;
