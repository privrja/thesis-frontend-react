import * as React from "react";

interface Props {
    name: string;
    value: string
}

interface State {
    value: string;
}

class TextInput extends React.Component<Props, State> {


    constructor(props: Props) {
        super(props);
        this.state = {value: props.value};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event: any) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event: any) {
        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
    }

    render() {
        return <input type="text" name={this.props.name} value={this.state.value} onChange={this.handleChange}/>
    }
}

export default TextInput;
