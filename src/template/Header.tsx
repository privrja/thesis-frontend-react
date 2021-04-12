import * as React from "react";
import HeaderTile from "./HeaderTile";
import styles from "../main.module.scss"
import {SELECTED_CONTAINER, TOKEN} from "../constant/ApiConstants";
import PopupYesNo from "../component/PopupYesNo";
import FetchHelper from "../helper/FetchHelper";

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
                <PopupYesNo label={'You need to agree with'}
                            defaultText={'<Link href=\'/condition\'>Terms and conditions</Link>'}
                            onYes={FetchHelper.conditionsOk} onNo={FetchHelper.conditionsKo} ref={this.popupRef}/>
                <div className={styles.headerContainer}>
                    <HeaderTile text={'MassSpecBlocks'} url={'/'}/>
                    <HeaderTile text={'Containers'} url={'/container'}/>
                    <HeaderTile text={'Sequences'}
                                url={'/container/' + localStorage.getItem(SELECTED_CONTAINER ?? '1') + '/sequence'}/>
                    <HeaderTile text={'Blocks'}
                                url={'/container/' + (localStorage.getItem(SELECTED_CONTAINER) ?? '1') + '/block'}/>
                    <HeaderTile text={'Modifications'}
                                url={'/container/' + (localStorage.getItem(SELECTED_CONTAINER) ?? '1') + '/modification'}/>
                    { localStorage.getItem(TOKEN) ? <HeaderTile text={'Import'} url={'/import'}/> : ''}
                    { localStorage.getItem(TOKEN) ? <HeaderTile text={'Settings'} url={'/setup'}/> : ''}
                    { localStorage.getItem(TOKEN) ? <HeaderTile text={'Logout'} url={'/logout'}/> : <HeaderTile text={'Login'} url={'/login'}/>}
                </div>
            </header>
        )
    }

}

export default Header;
