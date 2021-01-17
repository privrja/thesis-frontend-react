import React from "react";
import Flash from "../component/Flash";
import FlashType from "../component/FlashType";
import {TOKEN} from "../constant/ApiConstants";
import Sleep from "../helper/Sleep";

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
        this.flashRef.current!.activate(FlashType.OK);
        Sleep.sleep(500).then(() => {
            window.location.href = '/'
        });
    }

    render() {
        return <Flash textBad='Logout failure!' textOk='Logout successful!' ref={this.flashRef}/>
    }

}

export default LogoutPage;