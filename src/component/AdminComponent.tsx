import React from "react";
import AdminSimilarity from "./AdminSimilarity";
import AdminCondition from "./AdminCondition";
import {ADMIN, USER_NAME} from "../constant/ApiConstants";

interface State {
    visibility: boolean;
}

class AdminComponent extends React.Component<any, State> {

    constructor(props: any) {
        super(props);
        let name = localStorage.getItem(USER_NAME);
        if (name && name === ADMIN) {
            this.state = {visibility: true}
        } else {
            this.state = {visibility: false}
        }
    }

    render() {
        if (this.state.visibility) {
            return (
                <section>
                    <AdminSimilarity/>
                    <AdminCondition/>
                </section>
            );
        } else {
            return ('');
        }
    }

}

export default AdminComponent;
