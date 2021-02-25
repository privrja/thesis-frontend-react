import * as React from "react";
import {URL_PREFIX} from "../constant/ApiConstants";

class Footer extends React.Component {

    render() {
        return (
            <footer>@2020 - 2020 Jan Přívratský | <a href={URL_PREFIX + 'reference'}>References</a> | <a href={URL_PREFIX + 'condition'}>Terms and conditions</a></footer>
        )
    }

}

export default Footer;
