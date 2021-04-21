import * as React from "react";
import styles from "../main.module.scss";

class ReferencePage extends React.Component<any, any> {

    render() {
        return (
            <section className={styles.page}>
                <section className={styles.divLeft}>
                    <h3>Smiles Drawer</h3>
                    <p>SmilesDrawer is an javascript library for drawing SMILES.<br/>
                        Daniel Probst and Jean-Louis Reymond, SmilesDrawer: Parsing and Drawing SMILES-Encoded Molecular
                        Structures Using Client-Side JavaScript, Journal of Chemical Information and Modeling 2018 58
                        (1), 1-7,<br/>
                        DOI: <a href={'https://doi.org/10.1021/acs.jcim.7b00425'}>10.1021/acs.jcim.7b00425</a><br/>
                        Github <a href={'https://github.com/reymond-group/smilesDrawer'}>version</a>, I used forked <a
                            href={'https://github.com/privrja/smilesDrawer'}>version</a>
                    </p>
                    <h3>JSME Molecule Editor</h3>
                    <p>JSME editor is used to editing structures in javascript
                        B. Bienfait and P. Ertl, JSME: a free molecule editor in JavaScript, J. Cheminformatics 5:24
                        (2013),<br/>
                        DOI: <a href={'https://doi.org/10.1186/1758-2946-5-24'}>10.1186/1758-2946-5-24</a><br/>
                        I used version of react component on github <a
                            href={'https://github.com/douglasconnect/jsme-react'}>version</a>
                    </p>

                    <h3>CycloBranch</h3>
                    <p><a href={'https://ms.biomed.cas.cz/cyclobranch'}>CycloBranch</a> is as program used in Mass
                        Spectrometry developed by Jiří Novák.<br/>
                        DOI: <a href={'https://doi.org/10.1021/acs.analchem.0c00170'}>10.1021/acs.analchem.0c00170</a>
                    </p>

                    <h3>PubChem</h3>
                    <p><a href={'https://pubchem.ncbi.nlm.nih.gov'}>PubChem</a> is chemical database where use can
                        search information about structures through MSB.<br/>
                        DOI: <a href={'https://doi.org/10.1093/nar/gky1033'}>10.1093/nar/gky1033</a>
                    </p>

                    <h3>ChemSpider</h3>
                    <p><a href={'https://www.chemspider.com'}>ChemSpider</a> is chemical database where use can search
                        information about structures through MSB.</p>

                    <h3>ChEBI</h3>
                    <p><a href={'https://www.ebi.ac.uk/chebi'}>ChEBI</a> is chemical database used by MSB to serach
                        information.<br/>
                        DOI: <a href={'https://doi.org/10.1093/nar/gkv1031'}>10.1093/nar/gkv1031</a>
                    </p>

                    <h3>Norine</h3>
                    <p><a href={'https://bioinfo.lifl.fr/norine/'}>Norine</a> is a chemical database used by MSB to
                        search information.<br/>
                        DOI: <a href={'https://doi.org/10.1093/nar/gkm792'}>10.1093/nar/gkm792</a>
                    </p>

                    <h3>PDB</h3>
                    <p><a href={'https://www.rcsb.org'}>PDB</a> is a chemical database used by MSB to search
                        information.<br/>
                        DOI: <a href={'https://doi.org/10.1093/nar/28.1.235'}>10.1093/nar/28.1.235</a>
                    </p>

                    <h3>Bbdgnc</h3>
                    <p>Bbdgnc is first version of this application developed for my bachelor's thesis. <br/>
                        Github: <a href={'https://github.com/privrja/bbdgnc'}>version</a></p>

                    <h3>Container sources</h3>
                    <p>Container Nonribosomal Peptides and Siderophores is filled based on many articles:
                        <ul>
                            <li><a href={'https://link.springer.com/article/10.1007/s13361-015-1211-1#citeas'}>https://link.springer.com/article/10.1007/s13361-015-1211-1#citeas</a></li>
                            <li><a href={'https://doi.org/10.1016/j.bbapap.2016.12.003'}>https://doi.org/10.1016/j.bbapap.2016.12.003</a></li>
                            <li><a href={'https://doi.org/10.1002/mas.21461'}>https://doi.org/10.1002/mas.21461</a></li>
                            <li><a href={'https://doi.org/10.1039/b906679a'}>https://doi.org/10.1039/b906679a</a></li>
                            <li><a href={'https://bertrandsamuel.free.fr/siderophore_base/siderophores.php'}>http://bertrandsamuel.free.fr/siderophore_base/siderophores.php</a></li>
                        </ul>
                        Container Siderophores and Secondary Metabolites (MS) is based on <a href={'https://doi.org/10.1002/mas.21461'}>https://doi.org/10.1002/mas.21461</a>
                    </p>

                    <h3>MassSpecBlock documentation</h3>
                    <p>All documentation and info about MassSpecBlocks can be found on GitHub <a
                        href={'https://github.com/privrja/MassSpecBlocks'}>https://github.com/privrja/MassSpecBlocks</a>
                    </p>


                </section>
            </section>
        );
    }

}

export default ReferencePage;
