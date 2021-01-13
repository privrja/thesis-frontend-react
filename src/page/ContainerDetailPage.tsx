import React from "react";
import styles from "../main.module.scss";
import {ENDPOINT, TOKEN} from "../constant/ApiConstants";

interface Container {
    containerName: string
    visibility: string
}

interface State {
    container: Container
}

class ContainerDetailPage extends React.Component<any, State> {

    constructor(props:any) {
        super(props);

        this.state = { container: {containerName: '', visibility: ''}};
    }

    componentDidMount(): void {
        this.container();
    }

    container() {
        const token = localStorage.getItem(TOKEN);
            fetch(ENDPOINT + 'container/' + this.props.match.params.id,token ? {
                method: 'GET',
                headers: {'x-auth-token': token}
            } : {
                method: 'GET'
            })
                .then(response => {
                    if (response.status === 404) {
                    }
                    return response;
                })
                .then(response => response.status === 200 ? response.json() : null)
                .then(response => this.setState({container: response}));
    }

    render() {
        return (
            <section className={styles.page}>
                <section>
                    <h1>Container {this.state.container.containerName} </h1>
                    <h2 id='collaborators'>Collaborators</h2>
                </section>
            </section>
        )
    }

}

export default ContainerDetailPage;
