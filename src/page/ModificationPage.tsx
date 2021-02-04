import * as React from "react";
import "react-app-polyfill/ie11";
import styles from "../main.module.scss"
import {CONTAINER, ENDPOINT, TOKEN} from "../constant/ApiConstants";
import Flash from "../component/Flash";
import FlashType from "../component/FlashType";
import PopupYesNo from "../component/PopupYesNo";
import TextInput from "../component/TextInput";
import ListComponent, {ListState} from "../component/ListComponent";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import Modification from "../structure/Modification";
import NameHelper from "../helper/NameHelper";
import CheckInput from "../component/CheckInput";
import {Field, Form, Formik, FormikHelpers} from "formik";

interface State extends ListState {
    list: Modification[];
}

const TXT_EDIT_MODIFICATION_NAME = 'txt-edit-modificationName';
const TXT_EDIT_FORMULA = 'txt-edit-formula';
const TXT_EDIT_MASS = 'txt-edit-mass';
const TXT_EDIT_C_TERMINAL = 'txt-edit-c-terminal';
const TXT_EDIT_N_TERMINAL = 'txt-edit-n-terminal';
const MODIFICATION_NAME = 'modificationName';
const MODIFICATION_FORMULA = 'formula';
const MODIFICATION_MASS = 'mass';
const N_TERMINAL = 'nTerminal';
const C_TERMINAL = 'cTerminal';

interface Values {
    modificationName: string;
    formula: string;
    mass?: number;
    nTerminal: boolean;
    cTerminal: boolean;
}

class ModificationPage extends ListComponent<any, State> {

    constructor(props: any) {
        super(props);
        this.find = this.find.bind(this);
        this.state = {list: [], selectedContainer: this.props.match.params.id};
    }

    list() {
        const token = localStorage.getItem(TOKEN);
        if (token !== null) {
            fetch(this.getEndpoint(), {
                method: 'GET',
                headers: {'x-auth-token': token}
            }).then(this.listResponse);
        } else {
            fetch(this.getEndpoint(), {
                method: 'GET',
            }).then(this.listResponse);
        }
    }

    delete(key: number) {
        const token = localStorage.getItem(TOKEN);
        if (token !== null) {
            fetch(this.getEndpointWithId(key), {
                method: 'DELETE',
                headers: {'x-auth-token': token}
            }).then(response => {
                if (response.status === 204) {
                    this.flashRef.current!.activate(FlashType.OK, 'Modification ' + this.find(key)?.modificationName + ' deleted');
                    this.list();
                } else {
                    response.json().then(data => {
                        this.flashRef.current!.activate(FlashType.BAD, data.message);
                    });
                }
            });
        } else {
            this.flashRef.current!.activate(FlashType.BAD);
        }
    }

    find(key: number) {
        return this.state.list.find(modification => modification.id === key);
    }

    getEndpointWithId(blockId: number) {
        return ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + '/modification/' + blockId;
    }

    getEndpoint() {
        return ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + '/modification';
    }

    update(key: number) {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            let modificationName = document.getElementById(TXT_EDIT_MODIFICATION_NAME) as HTMLInputElement;
            let formula = document.getElementById(TXT_EDIT_FORMULA) as HTMLInputElement;
            let mass = document.getElementById(TXT_EDIT_MASS) as HTMLInputElement;
            let nTerminal = document.getElementById(TXT_EDIT_N_TERMINAL) as HTMLInputElement;
            let cTerminal = document.getElementById(TXT_EDIT_C_TERMINAL) as HTMLInputElement;
            fetch(this.getEndpointWithId(key), {
                method: 'PUT',
                headers: {'x-auth-token': token},
                body: JSON.stringify({
                    modificationName: modificationName.value,
                    formula: formula.value,
                    mass: mass.value,
                    nTerminal: nTerminal.value,
                    cTerminal: cTerminal.value
                })
            }).then(response => {
                if (response.status === 204) {
                    this.flashRef.current!.activate(FlashType.OK, 'Modification ' + modificationName.value + ' updated');
                    this.list();
                } else {
                    response.json().then(data => {
                        this.flashRef.current!.activate(FlashType.BAD, data.message);
                    });
                }
            });
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
        this.editEnd();
    }

    create(values: Values): void {
        console.log(values);
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(this.getEndpoint(), {
                method: 'POST',
                headers: {'x-auth-token': token},
                body: JSON.stringify(values)
            }).then(response => {
                if (response.status !== 201) {
                    response.json().then(data => this.flashRef.current!.activate(FlashType.BAD, data.message));
                } else {
                    this.flashRef.current!.activate(FlashType.OK);
                    this.list();
                }
            });
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    render() {
        return (
            <section className={styles.page}>
                <section className={styles.pageTable}>
                    <h1>Modifications</h1>
                    <PopupYesNo label={"Realy want to delete modification?"} onYes={this.delete} ref={this.popupRef}/>
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
                                           placeholder='Modification Name'/>

                                    <label htmlFor={MODIFICATION_FORMULA}>Formula name:</label>
                                    <Field id={MODIFICATION_FORMULA} name={MODIFICATION_FORMULA}
                                           placeholder='Modification Formula'/>

                                    <label htmlFor={MODIFICATION_MASS}>Mass:</label>
                                    <Field id={MODIFICATION_MASS} name={MODIFICATION_MASS}
                                           placeholder='Your new Modification Mass'/>

                                    <label htmlFor={N_TERMINAL}>N-terminal:</label>
                                    <Field type={'checkbox'} id={N_TERMINAL} name={N_TERMINAL}/>

                                    <label htmlFor={C_TERMINAL}>N-terminal:</label>
                                    <Field type={'checkbox'} id={C_TERMINAL} name={C_TERMINAL}/>

                                    <button type="submit" className={styles.create}>Create new container</button>
                                </Form>
                            </Formik>

                        </div> : <div/>
                    }

                    {this.state.list.length > 1 ?
                        <table>
                            <thead>
                            <tr>
                                <th>Id</th>
                                <th>Modification name</th>
                                <th>Formula</th>
                                <th>Mass</th>
                                <th>N-terminal</th>
                                <th>C-terminal</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.list.map(modification => (
                                <tr key={modification.id}>
                                    <td>{modification.id}</td>
                                    <td onClick={() => this.edit(modification.id)}>{this.state.editable === modification.id ?
                                        <TextInput value={modification.modificationName}
                                                   name={TXT_EDIT_MODIFICATION_NAME}
                                                   id={TXT_EDIT_MODIFICATION_NAME}/> : modification.modificationName}</td>
                                    <td onClick={() => this.edit(modification.id)}>{this.state.editable === modification.id ?
                                        <TextInput value={modification.modificationFormula} name={TXT_EDIT_FORMULA}
                                                   id={TXT_EDIT_FORMULA}/> : modification.modificationFormula}</td>
                                    <td onClick={() => this.edit(modification.id)}>{this.state.editable === modification.id ?
                                        <TextInput value={modification.modificationMass.toString()} name={TXT_EDIT_MASS}
                                                   id={TXT_EDIT_MASS}/> : modification.modificationMass}</td>
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
                                        <button className={styles.update}>Editor</button>
                                        <button className={styles.delete}
                                                onClick={() => this.popup(modification.id)}>Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        : <div/>
                    }
                </section>
            </section>
        )
    }

}

export default ModificationPage;
