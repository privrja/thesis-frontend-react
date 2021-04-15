import React from "react";
import styles from "../main.module.scss";
import PasswordComponent from "../component/PasswordComponent";
import ChemSpiderKey from "../component/ChemSpiderKey";
import AdminComponent from "../component/AdminComponent";
import DeleteAccount from "../component/DeleteAccount";
import MailReset from "../component/MailReset";
import {CHEMSPIDER_ONE_KEY} from "../constant/Constants";

class SettingPage extends React.Component<any, any> {

    render() {
        return (
            <section className={styles.page}>
                <PasswordComponent/>
                <MailReset/>
                {CHEMSPIDER_ONE_KEY && CHEMSPIDER_ONE_KEY.length > 0 ? '' : <ChemSpiderKey/> }
                <DeleteAccount/>
                <AdminComponent/>
            </section>
        );
    }

}

export default SettingPage;
