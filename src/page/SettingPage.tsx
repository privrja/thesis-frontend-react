import React from "react";
import styles from "../main.module.scss";
import PasswordComponent from "../component/PasswordComponent";

class SettingPage extends React.Component<any, any> {

    render() {
        return (
            <section className={styles.page}>
                <PasswordComponent/>
            </section>
        );
    }

}

export default SettingPage;
