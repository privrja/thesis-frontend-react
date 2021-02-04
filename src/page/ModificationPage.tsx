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
    modifications: Modification[];
}

const TXT_EDIT_MODIFICATION_NAME = 'txt-edit-modificationName';
const TXT_EDIT_FORMULA = 'txt-edit-formula';
const TXT_EDIT_MASS = 'txt-edit-mass';
const TXT_EDIT_C_TERMINAL = 'txt-edit-c-terminal';
const TXT_EDIT_N_TERMINAL = 'txt-edit-n-terminal';
const MODIFICATION_NAME = 'modificationName';
const MODIFICATION_FORMULA = 'modificationFormula';
const MODIFICATION_MASS = 'modificationMass';
const N_TERMINAL = 'nTerminal';
const C_TERMINAL = 'cTerminal';

interface Values {
    modificationName: string;
    modificationFormula: string;
    modificationMass: number;
    nTerminal: boolean;
    cTerminal: boolean;
}

class ModificationPage extends ListComponent<any, State> {

    constructor(props: any) {
        super(props);
        this.listResponse = this.listResponse.bind(this);
        this.state = {modifications: [], selectedContainer: this.props.match.params.id};
    }

    list() {
        const token = localStorage.getItem(TOKEN);
        if (token !== null) {
            fetch(ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + '/modification', {
                method: 'GET',
                headers: {'x-auth-token': token}
            }).then(this.listResponse);
        } else {
            fetch(ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + '/modification', {
                method: 'GET',
            }).then(this.listResponse);
        }
    }

    private listResponse(response: Response) {
        if (response.status === 200) {
            response.json().then(response => this.setState({modifications: response}));
        } else {
            if (response.status === 401) {
                localStorage.removeItem(TOKEN);
            }
            response.json().then(response => this.flashRef.current!.activate(FlashType.BAD, response.message));
        }
    }

    delete(key: number) {
        const token = localStorage.getItem(TOKEN);
        if (token !== null) {
            fetch(this.getEndpoint(key), {
                method: 'DELETE',
                headers: {'x-auth-token': token}
            }).then(response => {
                if (response.status === 204) {
                    this.flashRef.current!.activate(FlashType.OK, 'Modification ' + ' deleted');
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
        return this.state.modifications.find(modification => modification.id === key);
    }

    getEndpoint(blockId: number) {
        return ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + '/modification/' + blockId;
    }

    update(key: number) {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            // TODO get data
            fetch(this.getEndpoint(key), {
                method: 'PUT',
                headers: {'x-auth-token': token},
                body: JSON.stringify({})
            }).then(response => {
                if (response.status === 204) {
                    this.flashRef.current!.activate(FlashType.OK, 'Modification ' + ' updated');
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
        // TODO
        console.log(values);
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
                                    modificationFormula: '',
                                    modificationMass: 0,
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
                                    <Field id={MODIFICATION_NAME} name={MODIFICATION_NAME} placeholder='Modification Name'/>

                                    <label htmlFor={MODIFICATION_FORMULA}>Formula name:</label>
                                    <Field id={MODIFICATION_FORMULA} name={MODIFICATION_FORMULA} placeholder='Modification Formula'/>

                                    <label htmlFor={MODIFICATION_MASS}>Mass:</label>
                                    <Field id={MODIFICATION_MASS} name={MODIFICATION_MASS} placeholder='Your new Modification Mass'/>

                                    <label htmlFor={N_TERMINAL}>N-terminal:</label>
                                    <Field type={'checkbox'} id={N_TERMINAL} name={N_TERMINAL}/>

                                    <label htmlFor={C_TERMINAL}>N-terminal:</label>
                                    <Field type={'checkbox'} id={C_TERMINAL} name={C_TERMINAL}/>

                                    <button type="submit" className={styles.create}>Create new container</button>
                                </Form>
                            </Formik>

                        </div> : <div/>
                    }

                    {this.state.modifications.length > 1 ?
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
                            {this.state.modifications.map(modification => (
                                <tr key={modification.id}>
                                    <td>{modification.id}</td>
                                    <td onClick={() => this.edit(modification.id)}>{this.state.editable === modification.id ?<TextInput value={modification.modificationName} name={TXT_EDIT_MODIFICATION_NAME} id={TXT_EDIT_MODIFICATION_NAME}/> : modification.modificationName}</td>
                                    <td onClick={() => this.edit(modification.id)}>{this.state.editable === modification.id ?<TextInput value={modification.modificationFormula} name={TXT_EDIT_FORMULA} id={TXT_EDIT_FORMULA}/> : modification.modificationFormula}</td>
                                    <td onClick={() => this.edit(modification.id)}>{this.state.editable === modification.id ?<TextInput value={modification.modificationMass.toString()} name={TXT_EDIT_MASS} id={TXT_EDIT_MASS}/> : modification.modificationMass}</td>
                                    <td onClick={() => this.edit(modification.id)}>{this.state.editable === modification.id ?<CheckInput checked={modification.nTerminal} name={TXT_EDIT_N_TERMINAL} id={TXT_EDIT_N_TERMINAL}/> : NameHelper.booleanValue(modification.nTerminal)}</td>
                                    <td onClick={() => this.edit(modification.id)}>{this.state.editable === modification.id ?<CheckInput checked={modification.cTerminal} name={TXT_EDIT_C_TERMINAL} id={TXT_EDIT_C_TERMINAL}/> : NameHelper.booleanValue(modification.cTerminal)}</td>
                                    <td>
                                        {this.state.editable === modification.id ? <button className={styles.update} onClick={() => this.update(modification.id)}>Update</button> : <div/>}
                                        {this.state.editable === modification.id ? <button className={styles.delete} onClick={this.editEnd}>Cancel</button> : <div/>}
                                        <button className={styles.update}>Editor</button>
                                        <button className={styles.delete} onClick={() => this.popup(modification.id)}>Delete</button>
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
