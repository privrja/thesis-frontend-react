import * as React from "react";
import Flash from "./Flash";
import PopupYesNo from "./PopupYesNo";
import {SELECTED_CONTAINER, TOKEN} from "../constant/ApiConstants";
import FlashType from "./FlashType";

export interface ListState {
    selectedContainer: number;
    editable?: number;
    list: any[];
}

abstract class ListComponent<P extends any, S extends ListState> extends React.Component<any, S> {

    flashRef: React.RefObject<Flash>;
    popupRef: React.RefObject<PopupYesNo>;

    protected constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.popupRef = React.createRef();
        this.popup = this.popup.bind(this);
        this.delete = this.delete.bind(this);
        this.edit = this.edit.bind(this);
        this.editEnd = this.editEnd.bind(this);
        this.update = this.update.bind(this);
        this.listResponse = this.listResponse.bind(this);
    }

    componentDidMount(): void {
        if (this.state.selectedContainer) {
            this.list();
        }
    }

    getSelectedContainer(): number {
        let selectedContainer = localStorage.getItem(SELECTED_CONTAINER);
        if (!selectedContainer) {
            selectedContainer = '4';
            localStorage.setItem(SELECTED_CONTAINER, selectedContainer);
        }
        return parseInt(selectedContainer);
    }

    popup(key: number): void {
        this.popupRef.current!.key = key;
        this.popupRef.current!.activate();
    }

    edit(containerId: number): void {
        this.setState({editable: containerId});
    }

    editEnd(): void {
        this.setState({editable: undefined});
    }

    protected listResponse(response: Response) {
        if (response.status === 200) {
            response.json().then(response => this.setState({list: response}));
        } else {
            if (response.status === 401) {
                localStorage.removeItem(TOKEN);
            }
            response.json().then(response => this.flashRef.current!.activate(FlashType.BAD, response.message));
        }
    }


    abstract list(): void;
    abstract create(values: any): void;
    abstract delete(key: number): void;
    abstract update(key: number): void;

}

export default ListComponent;