import * as React from "react";
import "react-app-polyfill/ie11";
import styles from "../main.module.scss"
import {
    ADMIN,
    CONTAINER,
    SELECTED_CONTAINER,
    SELECTED_CONTAINER_NAME,
    TOKEN, USER_NAME
} from "../constant/ApiConstants";
import Flash from "../component/Flash";
import {Field, Form, Formik, FormikHelpers} from "formik";
import {SelectInput, SelectOption} from "../component/SelectInput";
import FlashType from "../component/FlashType";
import PopupYesNo from "../component/PopupYesNo";
import TextInput from "../component/TextInput";
import ListComponent, {ListState} from "../component/ListComponent";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import PopupExport from "../component/PopupExport";
import ContainerHelper from "../helper/ContainerHelper";
import Helper from "../helper/Helper";
import {ENDPOINT, SHOW_ID} from "../constant/Constants";
import FetchHelper from "../helper/FetchHelper";

interface Container {
    id: number,
    containerName: string,
    visibility: string,
    mode: string
}

interface FreeContainer {
    id: number,
    containerName: string,
    visibility: string
}

interface State extends ListState {
    list: Container[];
    freeContainers: FreeContainer[];
}

interface Values {
    containerName: string;
    visibility: string;
}

const visibilityOptions = [
    new SelectOption('PRIVATE'), new SelectOption('PUBLIC')
];

const SEL_EDIT_VISIBILITY = 'sel-edit-visibility';
const TXT_EDIT_CONTAINER_NAME = 'txt-edit-containerName';

class ContainerPage extends ListComponent<any, State> {

    popupExportRef: React.RefObject<PopupExport>;

    constructor(props: any) {
        super(props);
        this.popupExportRef = React.createRef();
        this.freeContainers = this.freeContainers.bind(this);
        this.clone = this.clone.bind(this);
        this.state = {
            list: [],
            freeContainers: [],
            selectedContainer: ContainerHelper.getSelectedContainer(),
        };
    }

    componentDidMount(): void {
        this.list();
        this.freeContainers();
        Helper.resetStorage();
    }

    freeContainers() {
        fetch(ENDPOINT + 'free/container/', {
            method: 'GET',
        })
            .then(response => response.json())
            .then(response => this.setState({freeContainers: response}));
    }

    selectContainer(containerId: number, containerName: string) {
        this.setState({selectedContainer: containerId, selectedContainerName: containerName});
        localStorage.setItem(SELECTED_CONTAINER, containerId.toString());
        localStorage.setItem(SELECTED_CONTAINER_NAME, containerName);
        FetchHelper.refresh(this.props.history, '/container');
    }

    create(values: Values): void {
        this.defaultCreate(this.getEndpoint(), {
            containerName: values.containerName,
            visibility: values.visibility
        }, (response) => {
            let containerId = response.headers.get('Location').split('/');
            this.selectContainer(Number(containerId[containerId.length - 1]), values.containerName);
        });
    }

    delete(key: number) {
        this.defaultDelete(this.getEndpointWithId(key), key, this.freeContainers);
    }

    update(key: number) {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            let name = document.getElementById(TXT_EDIT_CONTAINER_NAME) as HTMLInputElement;
            let visibility = document.getElementById(SEL_EDIT_VISIBILITY) as HTMLSelectElement;
            fetch(this.getEndpointWithId(key), {
                method: 'PUT',
                headers: {'x-auth-token': token},
                body: JSON.stringify({containerName: name.value, visibility: visibility.value})
            }).then(response => {
                if (response.status === 204) {
                    this.flashRef.current!.activate(FlashType.OK, 'Updated');
                    this.list();
                    this.freeContainers();
                } else {
                    response.json().then(data => {
                        this.flashRef.current!.activate(FlashType.BAD, data.message);
                    });
                }
            });
            this.editEnd();
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    findName(key: number): string {
        return this.find(key).containerName;
    }

    getEndpoint(): string {
        return ENDPOINT + CONTAINER;
    }

    clone(containerId: number) {
        this.flashRef.current!.activate(FlashType.PENDING);
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(this.getEndpointWithId(containerId) + '/clone', {
                method: 'POST',
                headers: {'x-auth-token': token}
            }).then(response => {
                if (response.status === 201) {
                    this.flashRef.current!.activate(FlashType.OK);
                    this.list();
                    let uri = response.headers.get('Location');
                    if (uri) {
                        let containerIdArray = uri.split('/');
                        fetch(uri, {
                            method: 'GET',
                            headers: {'x-auth-token': token ?? ''}
                        }).then(responseCloned => {
                            if (responseCloned.status === 200) {
                                responseCloned.json().then(data => this.selectContainer(Number(containerIdArray[containerIdArray.length - 1]), data.containerName));
                            }
                        });
                    }
                } else {
                    response.json().then(data => this.flashRef.current!.activate(FlashType.BAD, data.message)).catch(() => this.flashRef.current!.activate(FlashType.BAD));
                }
            }).catch(() => this.flashRef.current!.activate(FlashType.BAD));
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    render() {
        return (
            <section className={styles.page}>
                <section className={styles.pageTable}>
                    <PopupYesNo label={"Really want to delete"} onYes={this.delete} ref={this.popupRef}/>
                    <PopupExport label={'Export'}
                                 onFail={() => this.flashRef.current!.activate(FlashType.BAD, 'Export failed')}
                                 ref={this.popupExportRef}/>
                    <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>

                    {localStorage.getItem(TOKEN) !== null ?
                        <div><h2>Create new container</h2>

                            <Formik
                                initialValues={{
                                    containerName: '',
                                    visibility: 'PRIVATE'
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
                                <Form id="containerCreate">
                                    <label htmlFor="containerName">Container name:</label>
                                    <Field id="containerName" name="containerName"
                                           placeholder='Your new Container Name'/>
                                    {localStorage.getItem(USER_NAME) === ADMIN
                                        ? <span>
                                            <label htmlFor="visibility">Container visibility:</label>
                                            <Field name={'visibility'} id={'visibility'} as={'select'}>
                                                <option value={'PRIVATE'} selected={true}>PRIVATE</option>
                                                <option value={'PUBLIC'}>PUBLIC</option>
                                            </Field>
                                        </span> : ''}

                                    <button type="submit" className={styles.create}>Create new container</button>
                                </Form>
                            </Formik>

                            <h2>Your containers - {this.state.list.length} rows</h2>
                            <table>
                                <thead>
                                <tr>
                                    {SHOW_ID ?
                                        <th onClick={() => this.sortBy('id')}>Id {this.sortIcons('id')}</th> : ''}
                                    <th onClick={() => this.sortBy('containerName')}>Container
                                        name {this.sortIcons('containerName')}</th>
                                    <th onClick={() => this.sortBy('visibility')}>Visibility {this.sortIcons('visibility')}</th>
                                    <th onClick={() => this.sortBy('mode')}>Mode {this.sortIcons('mode')}</th>
                                    <th>Is selected</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.state.list.map(container => (
                                    <tr key={container.id}>
                                        {SHOW_ID ? <td>{container.id}</td> : ''}
                                        <td onClick={() => this.edit(container.id)}>{this.state.editable === container.id ?
                                            <TextInput className={styles.filter} value={container.containerName}
                                                       name={TXT_EDIT_CONTAINER_NAME}
                                                       id={TXT_EDIT_CONTAINER_NAME}/> : container.containerName}</td>
                                        <td onClick={() => this.edit(container.id)}>{this.state.editable === container.id ?
                                            <SelectInput id={SEL_EDIT_VISIBILITY} name={SEL_EDIT_VISIBILITY}
                                                         options={visibilityOptions}
                                                         selected={container.visibility}/> : container.visibility}</td>
                                        <td>{container.mode}</td>
                                        <td>{container.id.toString() === this.state.selectedContainer.toString() ? 'Yes' : 'No'}</td>
                                        <td>
                                            {this.state.editable === container.id ? <button className={styles.update}
                                                                                            onClick={() => this.update(container.id)}>Update</button> :
                                                <div/>}
                                            {this.state.editable === container.id ?
                                                <button className={styles.delete}
                                                        onClick={this.editEnd}>Cancel</button> :
                                                <div/>}
                                            <button onClick={() => {
                                                this.selectContainer(container.id, container.containerName);
                                                this.props.history.push('/container');
                                            }}>Select
                                            </button>
                                            <button
                                                onClick={() => this.props.history.push('/container/' + container.id)}>Details
                                            </button>
                                            <button className={styles.create}
                                                    onClick={() => this.clone(container.id)}>Clone
                                            </button>
                                            <button
                                                onClick={() => this.popupExportRef.current!.activate(container.id)}>Export
                                            </button>
                                            <button className={styles.delete}
                                                    onClick={() => this.popup(container.id)}>Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div> : ''
                    }

                    <h2>Public containers - {this.state.freeContainers.length} rows</h2>
                    <table>
                        <thead>
                        <tr>
                            {SHOW_ID ?
                                <th onClick={() => this.sortBy('id', ENDPOINT + 'free/container/', response => this.setState({freeContainers: response}))}>Id {this.sortIcons('id')}</th> : ''}
                            <th onClick={() => this.sortBy('containerName', ENDPOINT + 'free/container/', response => this.setState({freeContainers: response}))}>Container
                                Name {this.sortIcons('containerName')}</th>
                            <th>Is selected</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.freeContainers.map(container => (
                            <tr key={container.id}>
                                {SHOW_ID ? <td>{container.id}</td> : ''}
                                <td>{container.containerName}</td>
                                <td>{container.id.toString() === localStorage.getItem(SELECTED_CONTAINER) ? 'Yes' : 'No'}</td>
                                <td>
                                    <button onClick={() => {
                                        this.selectContainer(container.id, container.containerName);
                                        this.props.history.push('/container');
                                    }}>Select
                                    </button>
                                    <button className={styles.create} onClick={() => this.clone(container.id)}>Clone
                                    </button>
                                    {localStorage.getItem(USER_NAME) === 'admin' ? <button
                                        onClick={() => this.props.history.push('/container/' + container.id)}>Details</button> : ''}
                                    <button onClick={() => this.popupExportRef.current!.activate(container.id)}>Export
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

export default ContainerPage;
