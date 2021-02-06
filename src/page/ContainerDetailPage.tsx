import React from "react";
import styles from "../main.module.scss";
import Collaborator from "./Collaborator";
import Family from "./Family";

class ContainerDetailPage extends React.Component<any, any> {
    render() {
        return (
            <section className={styles.page}>
                <Collaborator containerId={this.props.match.params.id}/>
                <Family type={'block'} containerId={this.props.match.params.id}/>
                <Family type={'sequence'} containerId={this.props.match.params.id}/>
            </section>
        )
    }
}

export default ContainerDetailPage;
