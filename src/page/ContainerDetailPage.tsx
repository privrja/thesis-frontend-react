import React from "react";
import styles from "../main.module.scss";
import Collaborator from "./Collaborator";
import Family from "./Family";
import Helper from "../helper/Helper";

class ContainerDetailPage extends React.Component<any, any> {

    componentDidMount(): void {
        Helper.resetStorage();
    }

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
