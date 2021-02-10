import * as React from "react";

interface Props {
    name: string;
    id: string;
    value: string;
    size?: number;
}

interface State {
    value: string;
}

class TextInput extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {value: props.value};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: any) {
        this.setState({value: event.target.value});
    }

    render() {
        return <input type="text" id={this.props.id} name={this.props.name} value={this.state.value} onChange={this.handleChange} size={this.props.size}/>
    }
}

export default TextInput;
