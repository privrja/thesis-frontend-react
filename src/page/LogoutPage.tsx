import React from "react";
import Flash from "../component/Flash";
import FlashType from "../component/FlashType";
import {
    TOKEN,
    URL_PREFIX, USER_NAME
} from "../constant/ApiConstants";
import Sleep from "../helper/Sleep";
import Helper from "../helper/Helper";

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
        Sleep.sleep(500).then(() => {
            window.location.href = URL_PREFIX
        });
    }

    render() {
        return <Flash textBad='Logout failure!' textOk='Logout successful!' ref={this.flashRef}/>
    }

}

export default LogoutPage;
