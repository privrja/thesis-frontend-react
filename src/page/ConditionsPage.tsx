import * as React from "react";
import styles from "../main.module.scss";

class ConditionsPage extends React.Component<any> {

    render() {
        return (
            <section className={styles.page}>
                <section>
                    <h1>Terms and Conditions</h1>

                    <h2>1) Usage of App</h2>
                    <p>Using of MassSpecBlocks is free. Source codes are licensed under MIT license.</p>

                    <h2>2) Usage of Registration data</h2>
                    <p>The name doesn't have to be your'e real name. E-mail is not required and it will be used only for
                        password recovery (Not implemented yet). Password is only hashed and then stored in DB for
                        authentification. There are no restrictions for password.</p>

                    <h2>3) Cookies</h2>
                    <p>The site use cookies. Only for this application like storing your session and so on. No third
                        party and advertisements usage. By using MassSpecBlocks you agree with cookie usage.</p>

                    <h2>4) Usage technologies</h2>
                    <p>MassSpecBlock use modified smilesDrawer [https://github.com/privrja/smilesDrawer] originally
                        developed by Jean-Louis Reymond Research Group at the University of Bern, main author Daniel
                        Probst.
                        Use JSME editor originally developed by B. Bienfait and P. Ertl. JSME Molecule Editor [https://jsme-editor.github.io/].
                        Use React for frontend (MIT License), Symfony for backend (MIT License), Mysql free version.
                        MassSpecBlocks is based on Building Blocks Database Generator of Natural Compounds (Bbdgnc)
                        [https://github.com/privrja/bbdgnc].</p>
                </section>
            </section>
        )
    }

}

export default ConditionsPage;

