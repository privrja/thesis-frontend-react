import * as React from "react";
import {USER_NAME} from "../constant/ApiConstants";
import {Link} from "react-router-dom";

class Footer extends React.Component {

    render() {
        return (
            <footer>2020 - {(new Date()).getFullYear()} Jan Přívratský | <Link to={'/reference'}>References</Link> | <Link to={'/condition'}>Terms and conditions</Link> {localStorage.getItem(USER_NAME) ? '| Logged as ' + localStorage.getItem(USER_NAME) : ''}</footer>
        )
    }

}

export default Footer;
