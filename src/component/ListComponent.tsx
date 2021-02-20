import * as React from "react";
import Flash from "./Flash";
import PopupYesNo from "./PopupYesNo";
import {TOKEN} from "../constant/ApiConstants";
import FlashType from "./FlashType";
import {ERROR_LOGIN_NEEDED, OK_CREATED} from "../constant/FlashConstants";

export interface ListState {
    selectedContainer: number;
    editable?: number;
    list: any[];
}

abstract class ListComponent<P extends any, S extends ListState> extends React.Component<P, S> {

    flashRef: React.RefObject<Flash>;
    popupRef: React.RefObject<PopupYesNo>;

    protected constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.popupRef = React.createRef();
        this.popup = this.popup.bind(this);
        this.edit = this.edit.bind(this);
        this.editEnd = this.editEnd.bind(this);
        this.getEndpoint = this.getEndpoint.bind(this);
        this.getEndpointWithId = this.getEndpointWithId.bind(this);
        this.find = this.find.bind(this);
        this.findName = this.findName.bind(this);
        this.defaultList = this.defaultList.bind(this);
        this.defaultCreate = this.defaultCreate.bind(this);
        this.defaultUpdate = this.defaultUpdate.bind(this);
        this.defaultDelete = this.defaultDelete.bind(this);
        this.create = this.create.bind(this);
        this.list = this.list.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    componentDidMount(): void {
        if (this.state.selectedContainer) {
            this.list();
        }
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

    defaultList(endpoint: string) {
        this.defaultListTransformation(endpoint, response => this.setState({list: response}));
    }

    defaultListTransformation(endpoint: string, transformationCallback: (e: any) => void) {
        const token = localStorage.getItem(TOKEN);
        fetch(endpoint, token ? {
            method: 'GET',
            headers: {'x-auth-token': token}
        } : {
            method: 'GET'
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem(TOKEN);
            }
            return response;
        }).then(response => { if (response.status === 200) { response.json().then(transformationCallback)}});
    }

    defaultCreate(endpoint: string, body: any, successCallback: () => void = () => { /* Empty on purpose */ }) {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(endpoint, {
                method: 'POST',
                headers: {'x-auth-token': token, 'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            }).then(response => {
                if (response.status === 201) {
                    this.flashRef.current!.activate(FlashType.OK, OK_CREATED);
                    this.list();
                    successCallback();
                } else {
                    this.badResponse(response);
                }
            })
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    defaultUpdate(endpoint: string, key: number, body: any, successCallback: () => void = () => { /* Empty on purpose */ }) {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(endpoint, {
                method: 'PUT',
                headers: {'x-auth-token': token},
                body: JSON.stringify(body)
            }).then(response => {
                if (response.status === 204) {
                    this.flashRef.current!.activate(FlashType.OK, this.findName(key) + ' updated');
                    this.list();
                    successCallback();
                } else {
                    this.badResponse(response);
                }
            });
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
        this.editEnd();
    }

    defaultDelete(endpoint: string, key: number, successCallback: () => void = () => { /* Empty on purpose */ }) {
        const token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(endpoint, {
                method: 'DELETE',
                headers: {'x-auth-token': token}
            }).then(response => {
                if (response.status === 204) {
                    this.flashRef.current!.activate(FlashType.OK, this.findName(key) + ' deleted');
                    successCallback();
                    this.list();
                } else {
                    this.badResponse(response);
                }
            });
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED)
        }
    }

    protected badResponse(response: any) {
        this.flashRef.current!.activate(FlashType.BAD, '');
        if (response.status === 401) {
            localStorage.removeItem(TOKEN);
        }
        response.json().then((data: any) => this.flashRef.current!.activate(FlashType.BAD, data.message));
    }

    getEndpointWithId(key: number) {
        return this.getEndpoint() + '/' + key;
    }

    list(): void {
        this.defaultList(this.getEndpoint());
    }

    delete(key: number): void {
        this.defaultDelete(this.getEndpointWithId(key), key);
    }

    find(key: number): any {
        return this.state.list.find(e => e.id === key);
    }

    abstract create(values: any): void;

    abstract update(key: number): void;

    abstract findName(key: number): string

    abstract getEndpoint(): string;
}

export default ListComponent;
