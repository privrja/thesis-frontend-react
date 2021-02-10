import * as React from "react";
import styles from "../main.module.scss";

class ReferencePage extends React.Component<any, any> {

    render() {
        return (
            <section className={styles.page}>
                <section className={styles.divLeft}>
                    <h3>Smiles Drawer</h3>
                    <p>SmilesDrawer is an javascript library for drawing SMILES.<br/>
                        Daniel Probst and Jean-Louis Reymond, SmilesDrawer: Parsing and Drawing SMILES-Encoded Molecular Structures Using Client-Side JavaScript, Journal of Chemical Information and Modeling 2018 58 (1), 1-7, <br/>
                        DOI: <a href={'https://doi.org/10.1021/acs.jcim.7b00425'}>https://doi.org/10.1021/acs.jcim.7b00425</a><br/>
                        Github <a href={'https://github.com/reymond-group/smilesDrawer'}>version</a>, I used forked <a href={'https://github.com/privrja/smilesDrawer'}>version</a>
                    </p>
                    <h3>JSME Molecule Editor</h3>
                    <p>JSME editor is used to editing structures in javascript
                        B. Bienfait and P. Ertl, JSME: a free molecule editor in JavaScript, J. Cheminformatics 5:24 (2013),<br/>
                        DOI: <a href={'https://doi.org/10.1186/1758-2946-5-24'}>https://doi.org/10.1186/1758-2946-5-24</a><br/>
                        I used version of react component on github <a href={'https://github.com/douglasconnect/jsme-react'}>version</a>
                    </p>

                    <h3>Bbdgnc</h3>
                    <p>Bbdgnc is first version of this application developed for my bachelor's thesis. <br/>
                        Github: <a href={'https://github.com/privrja/bbdgnc'}>version</a></p>
                </section>
            </section>
        );
    }

}

export default ReferencePage;
