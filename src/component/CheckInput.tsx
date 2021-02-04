import * as React from "react";

interface Props {
    name: string;
    id: string;
    checked: boolean
}

interface State {
    checked: boolean;
}

class CheckInput extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {checked: props.checked};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange() {
        this.setState({checked: !this.state.checked});
    }

    render() {
        return <input type="checkbox" id={this.props.id} name={this.props.name} checked={this.state.checked} onChange={this.handleChange}/>
    }
}

export default CheckInput;
