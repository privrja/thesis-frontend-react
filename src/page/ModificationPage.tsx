import * as React from "react";
import "react-app-polyfill/ie11";
import styles from "../main.module.scss"
import {
    CONTAINER,
    SMODIFICATION,
    TOKEN
} from "../constant/ApiConstants";
import Flash from "../component/Flash";
import PopupYesNo from "../component/PopupYesNo";
import TextInput from "../component/TextInput";
import ListComponent, {ListState} from "../component/ListComponent";
import NameHelper from "../helper/NameHelper";
import CheckInput from "../component/CheckInput";
import {Field, Form, Formik, FormikHelpers} from "formik";
import Helper from "../helper/Helper";
import ContainerHelper from "../helper/ContainerHelper";
import {DECIMAL_PLACES, ENDPOINT, SHOW_ID} from "../constant/Constants";
import ComputeHelper from "../helper/ComputeHelper";

const TXT_EDIT_MODIFICATION_NAME = 'txt-edit-modificationName';
const TXT_EDIT_FORMULA = 'txt-edit-formula';
const TXT_EDIT_MASS = 'txt-edit-mass';
const TXT_EDIT_C_TERMINAL = 'txt-edit-c-terminal';
const TXT_EDIT_N_TERMINAL = 'txt-edit-n-terminal';
const MODIFICATION_NAME = 'modificationName';
const MODIFICATION_FORMULA = 'formula';
const N_TERMINAL = 'nTerminal';
const C_TERMINAL = 'cTerminal';
const TXT_FILTER_MODIFICATION_ID = 'txt-filter-id';
const TXT_FILTER_MODIFICATION_NAME = 'txt-filter-modificationName';
const TXT_FILTER_MODIFICATION_FORMULA = 'txt-filter-modificationFormula';
const TXT_FILTER_MODIFICATION_MASS_FROM = 'txt-filter-modificationMass-from';
const TXT_FILTER_MODIFICATION_MASS_TO = 'txt-filter-modificationMass-to';
const TXT_FILTER_MODIFICATION_N_TERMINAL = 'txt-filter-nTerminal';
const TXT_FILTER_MODIFICATION_C_TERMINAL = 'txt-filter-cTerminal';
const SORT_ID = 'id';
const SORT_MODIFICATION_NAME = MODIFICATION_NAME;
const SORT_MODIFICATION_FORMULA = 'modificationFormula';
const SORT_MODIFICATION_MASS = 'modificationMass';
const SORT_C_TERMINAL = C_TERMINAL;
const SORT_N_TERMINAL = N_TERMINAL;

interface Values {
    modificationName: string;
    formula: string;
    nTerminal: boolean;
    cTerminal: boolean;
}

class ModificationPage extends ListComponent<any, ListState> {

    constructor(props: any) {
        super(props);
        this.filter = this.filter.bind(this);
        this.clear = this.clear.bind(this);
        this.state = {
            list: [],
            selectedContainer: this.props.match.params.id,
            selectedContainerName: ContainerHelper.getSelectedContainerName(),
            lastSortParam: 'modificationName',
            lastSortOrder: 'asc'
        };
    }

    componentDidMount(): void {
        super.componentDidMount();
        Helper.resetStorage();
    }

    findName(key: number): string {
        return this.find(key).modificationName;
    }

    getEndpoint() {
        return ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + SMODIFICATION;
    }

    create(values: Values): void {
        this.defaultCreate(this.getEndpoint(), values);
    }

    update(key: number) {
        let modificationName = document.getElementById(TXT_EDIT_MODIFICATION_NAME) as HTMLInputElement;
        let formula = document.getElementById(TXT_EDIT_FORMULA) as HTMLInputElement;
        let mass = document.getElementById(TXT_EDIT_MASS) as HTMLInputElement;
        let nTerminal = document.getElementById(TXT_EDIT_N_TERMINAL) as HTMLInputElement;
        let cTerminal = document.getElementById(TXT_EDIT_C_TERMINAL) as HTMLInputElement;
        this.defaultUpdate(this.getEndpointWithId(key), key, {
            modificationName: modificationName.value,
            formula: formula.value,
            mass: mass.value,
            nTerminal: nTerminal.checked,
            cTerminal: cTerminal.checked
        });
    }

    filter() {
        let id = document.getElementById(TXT_FILTER_MODIFICATION_ID) as HTMLInputElement;
        let name = document.getElementById(TXT_FILTER_MODIFICATION_NAME) as HTMLInputElement;
        let formula = document.getElementById(TXT_FILTER_MODIFICATION_FORMULA) as HTMLInputElement;
        let mass_from = document.getElementById(TXT_FILTER_MODIFICATION_MASS_FROM) as HTMLInputElement;
        let mass_to = document.getElementById(TXT_FILTER_MODIFICATION_MASS_TO) as HTMLInputElement;
        let nTerminal = document.getElementById(TXT_FILTER_MODIFICATION_N_TERMINAL) as HTMLInputElement;
        let cTerminal = document.getElementById(TXT_FILTER_MODIFICATION_C_TERMINAL) as HTMLInputElement;

        let filter =
            this.addFilter(
                this.addFilter(
                    this.addFilter(
                        this.addFilter(
                            this.addFilter(
                                this.addFilter(
                                    SHOW_ID ? this.addFilter('', SORT_ID, id.value) : ''
                                    , SORT_MODIFICATION_NAME, name.value)
                                , SORT_MODIFICATION_FORMULA, formula.value)
                            , 'modificationMassFrom', mass_from.value)
                        , 'modificationMassTo', mass_to.value)
                    , SORT_N_TERMINAL, nTerminal.value.toLowerCase())
                , SORT_C_TERMINAL, cTerminal.value.toLowerCase());
        this.setState({filter: filter}, this.list);
    }

    clear() {
        if (SHOW_ID) {
            this.clearConcreteFilter(TXT_FILTER_MODIFICATION_ID);
        }
        this.clearConcreteFilter(TXT_FILTER_MODIFICATION_NAME);
        this.clearConcreteFilter(TXT_FILTER_MODIFICATION_FORMULA);
        this.clearConcreteFilter(TXT_FILTER_MODIFICATION_MASS_FROM);
        this.clearConcreteFilter(TXT_FILTER_MODIFICATION_MASS_TO);
        this.clearConcreteFilter(TXT_FILTER_MODIFICATION_N_TERMINAL);
        this.clearConcreteFilter(TXT_FILTER_MODIFICATION_C_TERMINAL);
        this.setState({lastSortOrder: undefined, lastSortParam: undefined}, this.filter);
    }

    refreshFormula(event: any) {
        try {
            let mass = ComputeHelper.computeMass(event.target.value);
            (document.getElementById(TXT_EDIT_MASS) as HTMLInputElement).value = isNaN(mass) ? '' : mass.toFixed(DECIMAL_PLACES);
        } catch (e) {
            /** Empty on purpose - wrong formula input*/
        }
    }

    render() {
        return (
            <section className={styles.page}>
                <section className={styles.pageTable}>
                    <PopupYesNo label={"Really want to delete"} onYes={this.delete} ref={this.popupRef}/>
                    <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>

                    {localStorage.getItem(TOKEN) !== null ?
                        <div>
                            <h2>Create new modification</h2>
                            <Formik
                                initialValues={{
                                    modificationName: '',
                                    formula: '',
                                    nTerminal: false,
                                    cTerminal: false,
                                }}
                                onSubmit={(
                                    values: Values,
                                    {setSubmitting}: FormikHelpers<Values>
                                ) => {
                                    setTimeout(() => {
                                        this.create(values);
                                        setSubmitting(false);
                                    }, 500);
                                }}
                            >
                                <Form id="modificationCreate">
                                    <label htmlFor={MODIFICATION_NAME}>Modification name:</label>
                                    <Field id={MODIFICATION_NAME} name={MODIFICATION_NAME}
                                           placeholder='Modification name'/>

                                    <label htmlFor={MODIFICATION_FORMULA}>Formula:</label>
                                    <Field id={MODIFICATION_FORMULA} name={MODIFICATION_FORMULA}
                                           placeholder='Modification formula'/>

                                    <label htmlFor={N_TERMINAL}>N-terminal:</label>
                                    <Field type={'checkbox'} id={N_TERMINAL} name={N_TERMINAL}/>

                                    <label htmlFor={C_TERMINAL}>C-terminal:</label>
                                    <Field type={'checkbox'} id={C_TERMINAL} name={C_TERMINAL}/>

                                    <button type="submit" className={styles.create}>Create new modification</button>
                                </Form>
                            </Formik>

                        </div> : ''
                    }

                    <h2>List of modifications - {this.state.selectedContainerName} - {this.state.list.length} rows</h2>
                    <table className={styles.tableLarge}>
                        <thead>
                        <tr>
                            {SHOW_ID ? <th onClick={() => this.sortBy(SORT_ID)}>Id {this.sortIcons(SORT_ID)}</th> : ''}
                            <th onClick={() => this.sortBy(SORT_MODIFICATION_NAME)}>Name {this.sortIcons(SORT_MODIFICATION_NAME)}</th>
                            <th onClick={() => this.sortBy(SORT_MODIFICATION_FORMULA)}>Formula {this.sortIcons(SORT_MODIFICATION_FORMULA)}</th>
                            <th onClick={() => this.sortBy(SORT_MODIFICATION_MASS)}>Mass {this.sortIcons(SORT_MODIFICATION_MASS)}</th>
                            <th onClick={() => this.sortBy(SORT_N_TERMINAL)}>N-terminal {this.sortIcons(SORT_N_TERMINAL)}</th>
                            <th onClick={() => this.sortBy(SORT_C_TERMINAL)}>C-terminal {this.sortIcons(SORT_C_TERMINAL)}</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            {SHOW_ID ? <td><input className={styles.filter} type={'text'}
                                                  onKeyDown={(e) => this.enterCall(e, this.filter)}
                                                  id={TXT_FILTER_MODIFICATION_ID} placeholder={'Id'}/></td> : ''}
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)}
                                       id={TXT_FILTER_MODIFICATION_NAME} placeholder={'Name'}/></td>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)}
                                       id={TXT_FILTER_MODIFICATION_FORMULA} placeholder={'Formula'}/></td>
                            <td>
                                <input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)}
                                       id={TXT_FILTER_MODIFICATION_MASS_FROM} placeholder={'Mass from'}/>
                                <input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)}
                                       id={TXT_FILTER_MODIFICATION_MASS_TO} placeholder={'Mass to'}/>
                            </td>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)}
                                       id={TXT_FILTER_MODIFICATION_N_TERMINAL} placeholder={'N terminal'}/></td>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)}
                                       id={TXT_FILTER_MODIFICATION_C_TERMINAL} placeholder={'C terminal'}/></td>
                            <td>
                                <button onClick={this.filter}>Filter</button>
                                <button className={styles.delete} onClick={this.clear}>Clear</button>
                            </td>
                        </tr>
                        {this.state.list.map(modification => (
                            <tr key={modification.id}>
                                {SHOW_ID ? <td>{modification.id}</td> : ''}
                                <td onClick={() => this.edit(modification.id)}>{this.state.editable === modification.id ?
                                    <TextInput className={styles.filter} value={modification.modificationName}
                                               name={TXT_EDIT_MODIFICATION_NAME}
                                               id={TXT_EDIT_MODIFICATION_NAME}/> : modification.modificationName}</td>
                                <td onClick={() => this.edit(modification.id)}>{this.state.editable === modification.id ?
                                    <TextInput className={styles.filter} value={modification.modificationFormula} name={TXT_EDIT_FORMULA} onChange={this.refreshFormula}
                                               id={TXT_EDIT_FORMULA}/> : modification.modificationFormula}</td>
                                <td onClick={() => this.edit(modification.id)}>{this.state.editable === modification.id ?
                                    <TextInput className={styles.filter}
                                               value={modification.modificationMass.toFixed(DECIMAL_PLACES)}
                                               name={TXT_EDIT_MASS}
                                               id={TXT_EDIT_MASS}/> : modification.modificationMass.toFixed(DECIMAL_PLACES)}</td>
                                <td onClick={() => this.edit(modification.id)}>{this.state.editable === modification.id ?
                                    <CheckInput checked={modification.nTerminal} name={TXT_EDIT_N_TERMINAL}
                                                id={TXT_EDIT_N_TERMINAL}/> : NameHelper.booleanValue(modification.nTerminal)}</td>
                                <td onClick={() => this.edit(modification.id)}>{this.state.editable === modification.id ?
                                    <CheckInput checked={modification.cTerminal} name={TXT_EDIT_C_TERMINAL}
                                                id={TXT_EDIT_C_TERMINAL}/> : NameHelper.booleanValue(modification.cTerminal)}</td>
                                <td>
                                    {this.state.editable === modification.id ? <button className={styles.update}
                                                                                       onClick={() => this.update(modification.id)}>Update</button> :
                                        <div/>}
                                    {this.state.editable === modification.id ?
                                        <button className={styles.delete} onClick={this.editEnd}>Cancel</button> :
                                        <div/>}
                                    <button className={styles.delete}
                                            onClick={() => this.popup(modification.id)}>Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            </section>
        )
    }

}

export default ModificationPage;
