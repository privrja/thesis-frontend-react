import React from "react";
import styles from "../main.module.scss";
import PasswordComponent from "../component/PasswordComponent";
import ChemSpiderKey from "../component/ChemSpiderKey";
import AdminComponent from "../component/AdminComponent";
import DeleteAccount from "../component/DeleteAccount";

class SettingPage extends React.Component<any, any> {

    render() {
        return (
            <section className={styles.page}>
                <PasswordComponent/>
                <ChemSpiderKey/>
                <DeleteAccount/>
                <AdminComponent/>
            </section>
        );
    }

}

export default SettingPage;
