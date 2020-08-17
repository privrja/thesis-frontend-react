import * as React from "react";
import "react-app-polyfill/ie11";
import styles from "../main.module.scss"
import {ENDPOINT, SELECTED_CONTAINER, TOKEN} from "../constant/ApiConstants";

interface Container {
    id: number,
    name: string,
    visibility: string,
    mode: string
}

interface FreeContainer {
    id: number,
    name: string,
    visibility: string
}

interface State {
    containers: Array<Container>;
    freeContainers: Array<FreeContainer>;
    selectedContainer?: number;
}

class ContainerPage extends React.Component<any, State> {

    constructor(props: any) {
        super(props);

        let selectedContainer = localStorage.getItem(SELECTED_CONTAINER);
        if (selectedContainer) {
            this.state = {containers: [], freeContainers: [], selectedContainer: parseInt(selectedContainer)};
        } else {
            this.state = {containers: [], freeContainers: []};
        }
    }

    componentDidMount(): void {
        this.containers();
        this.freeContainers();
    }

    containers() {
        const token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'container', {
                method: 'GET',
                headers: {'x-auth-token': token}
            })
                .then(response => response.json())
                .then(response => this.setState({containers: response}));
        }
    }

    freeContainers() {
        fetch(ENDPOINT + 'free/container', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(response => this.setState({freeContainers: response}));
    }

    selectContainer(containerId: number) {
        this.setState({selectedContainer: containerId});
        localStorage.setItem(SELECTED_CONTAINER, containerId.toString());
    }

    render() {
        return (
            <section className={styles.page}>
                <section className={styles.pageTable}>
                    <h1>Container</h1>

                    <h2>Your containers</h2>

                    <table>
                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>Container name</th>
                            <th>Visibility</th>
                            <th>Mode</th>
                            <th>Is selected</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.containers.map(container => (
                            <tr key={container.id}>
                                <td>{container.id}</td>
                                <td>{container.name}</td>
                                <td>{container.visibility}</td>
                                <td>{container.mode}</td>
                                <td>{container.id === this.state.selectedContainer ? '1' : '0'}</td>
                                <td>
                                    <button onClick={() => this.selectContainer(container.id)}>Select</button>
                                    <button>Detail</button>
                                    <button>Collaborators</button>
                                    <button>Edit</button>
                                    <button>Delete</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <h2>Public containers</h2>

                    <table>
                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>Container name</th>
                            <th>Is selected</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.freeContainers.map(container => (
                            <tr key={container.id}>
                                <td>{container.id}</td>
                                <td>{container.name}</td>
                                <td>{container.id.toString() === localStorage.getItem(SELECTED_CONTAINER) ? '1' : '0'}</td>
                                <td>
                                    <button onClick={() => this.selectContainer(container.id)}>Select</button>
                                    <button>Detail</button>
                                    <button>Clone</button>
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
