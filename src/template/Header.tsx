import * as React from "react";
import HeaderTile from "./HeaderTile";
import styles from "../main.module.scss"
import {SELECTED_CONTAINER, TOKEN} from "../constant/ApiConstants";
import PopupYesNo from "../component/PopupYesNo";
import FetchHelper from "../helper/FetchHelper";
import {URL_PREFIX} from "../constant/Constants";

class Header extends React.Component {

    popupRef: React.RefObject<PopupYesNo>;

    constructor(props: any) {
        super(props);
        this.popupRef = React.createRef();
    }

    componentDidMount(): void {
        FetchHelper.conditions(this);
    }

    render() {
        return (
            <header>
                <PopupYesNo label={'You need to agree with'} defaultText={'<a href=\'' + URL_PREFIX + 'condition\'>Terms and conditions</a>'} onYes={FetchHelper.conditionsOk} onNo={FetchHelper.conditionsKo} ref={this.popupRef} />
                <div className={styles.headerContainer}>
                    <HeaderTile text={'MassSpecBlocks'} url={URL_PREFIX}/>
                    <HeaderTile text={'Containers'} url={URL_PREFIX + 'container'}/>
                    <HeaderTile text={'Sequences'}
                                url={URL_PREFIX + 'container/' + localStorage.getItem(SELECTED_CONTAINER ?? '4') + '/sequence'}/>
                    <HeaderTile text={'Blocks'}
                                url={URL_PREFIX + 'container/' + (localStorage.getItem(SELECTED_CONTAINER) ?? '4') + '/block'}/>
                    <HeaderTile text={'Modifications'}
                                url={URL_PREFIX + 'container/' + (localStorage.getItem(SELECTED_CONTAINER) ?? '4') + '/modification'}/>
                    {localStorage.getItem(TOKEN) ? <HeaderTile text={'Import'} url={URL_PREFIX + 'import'}/> : ''}
                    {localStorage.getItem(TOKEN) ? <HeaderTile text={'Settings'} url={URL_PREFIX + 'setup'}/> : ''}
                    {localStorage.getItem(TOKEN) ? <HeaderTile text={'Logout'} url={URL_PREFIX + 'logout'}/> :
                        <HeaderTile text={'Login'} url={URL_PREFIX + 'login'}/>}
                </div>
            </header>
        )
    }

}

export default Header;
