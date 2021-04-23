import * as React from "react";
import {USER_NAME} from "../constant/ApiConstants";
import {Link} from "react-router-dom";
import {ENDPOINT} from "../constant/Constants";

interface State {
    mail?: string
}

class Footer extends React.Component<any, State> {

    constructor(props: any) {
        super(props);
        this.state = {mail: undefined};
    }

    componentDidMount(): void {
        this.contact();
    }

    contact() {
        if (!this.state.mail) {
            fetch(ENDPOINT + 'admin/mail', {method: 'GET'}).then(response => {
                if (response.status === 200) {
                    response.json().then(data => this.setState({mail: data.mail})).catch(() => this.setState({mail: undefined}));
                } else {
                    this.setState({mail: undefined});
                }
            }).catch(() => this.setState({mail: undefined}))
        }
    }

    render() {
        return (
            <footer>2020 - {(new Date()).getFullYear()} Jan Přívratský | <Link to={'/reference'}>References</Link> | <Link to={'/condition'}>Terms and conditions</Link> {localStorage.getItem(USER_NAME) ? '| Logged as ' + localStorage.getItem(USER_NAME) : ''} {this.state.mail ? ' | admin contact: ' + this.state.mail : ''} </footer>
        )
    }

}

export default Footer;