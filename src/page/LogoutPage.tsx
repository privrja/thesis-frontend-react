import React from "react";
import Flash from "../component/Flash";
import FlashType from "../component/FlashType";
import {
    TOKEN,
    USER_NAME
} from "../constant/ApiConstants";
import Helper from "../helper/Helper";
import FetchHelper from "../helper/FetchHelper";

class LogoutPage extends React.Component<any> {

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
    }

    componentDidMount(): void {
        this.logout();
    }

    logout() {
        localStorage.removeItem(TOKEN);
        localStorage.removeItem(USER_NAME);
        this.flashRef.current!.activate(FlashType.OK);
        Helper.resetUserStorage();
        FetchHelper.refresh(this.props.history);
    }

    render() {
        return <Flash textBad='Logout failure!' textOk='Logout successful!' ref={this.flashRef}/>
    }

}

export default LogoutPage;
