import React from "react";
import styles from "../main.module.scss";
import PasswordComponent from "../component/PasswordComponent";
import PassReset from "../component/PassReset";

class SettingPage extends React.Component<any, any> {

    render() {
        return (
            <section className={styles.page}>
                <PasswordComponent/>
                <PassReset/>
            </section>
        );
    }

}

export default SettingPage;
