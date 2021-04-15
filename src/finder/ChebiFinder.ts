import IFinder from "./IFinder";
import SingleStructure from "./SingleStructure";
import {ServerEnum} from "../enum/ServerEnum";
import Sleep from "../helper/Sleep";

const ENDPOINT_URI = 'https://guarded-atoll-36331.herokuapp.com/http://www.ebi.ac.uk:80/webservices/chebi/2.0/webservice';
const ENVELOPE_START = `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Body>`;
const ENVELOPE_END = "</Body></Envelope>";
const GET_COMPLETE_ENTITY_START = '<getCompleteEntity xmlns="https://www.ebi.ac.uk/webservices/chebi">';
const GET_COMPLETE_ENTITY_END = "</getCompleteEntity>";
const GET_LITE_ENTITY_START = `<getLiteEntity xmlns="https://www.ebi.ac.uk/webservices/chebi">`;
const GET_LITE_ENTITY_END = `</getLiteEntity>`;
const GET_COMPLETE_ENTITY_BY_LIST_START = `<getCompleteEntityByList xmlns="https://www.ebi.ac.uk/webservices/chebi">`;
const GET_COMPLETE_ENTITY_BY_LIST_END = `</getCompleteEntityByList>`;
const GET_STRUCTURE_SEARCH_START = `<getStructureSearch xmlns="https://www.ebi.ac.uk/webservices/chebi">`;
const GET_STRUCTURE_SEARCH_END = `</getStructureSearch>`;
const MAXIMUM_RESULTS = `<maximumResults>50</maximumResults>`;
const STARS = `<stars>ALL</stars>`;
const SMILES_SETUP = '<type>SMILES</type><structureSearchCategory>SIMILARITY</structureSearchCategory><totalResults>50</totalResults><tanimotoCutoff>0.25</tanimotoCutoff>';
const CHEBI_NAME = 'CHEBI NAME';
const FORMULA = 'FORMULA';
const MASS = 'MONOISOTOPIC MASS';

class ChebiFinder implements IFinder {

    constructor() {
        this.handleResponse = this.handleResponse.bind(this);
    }

    findByFormula(formula: string): Promise<SingleStructure[]> {
        return this.getLiteEntity(formula, FORMULA);
    }

    findByIdentifier(id: string): Promise<SingleStructure[]> {
        if (id === '') {
            return Sleep.noSleepPromise();
        }
        return fetch(ENDPOINT_URI, {
            method: 'POST',
            headers: {'Content-Type': 'text/xml;charset=UTF-8'},
            body: ChebiFinder.createEnvelope([GET_COMPLETE_ENTITY_START + ChebiFinder.setChebiId(id) + GET_COMPLETE_ENTITY_END])
        }).then(response => {
            if (response.status === 200) {
                return response.text().then(data => {
                    let parser = new DOMParser();
                    let xml = parser.parseFromString(data, 'text/xml');
                    let names = xml.getElementsByTagName("chebiAsciiName");
                    let smiles = xml.getElementsByTagName('smiles');
                    let formulaes = xml.getElementsByTagName('Formulae');
                    let formula = '';
                    if (formulaes.length > 0) {
                        formulaes = formulaes[0].getElementsByTagName('data');
                        if (formulaes.length > 0) {
                            formula = formulaes[0].innerHTML;
                        }
                    }
                    let mass = xml.getElementsByTagName('monoisotopicMass');
                    return [new SingleStructure(
                        id,
                        ServerEnum.CHEBI,
                        names.length > 0 ? names[0].innerHTML : '',
                        smiles.length > 0 ? smiles[0].innerHTML : '',
                        formula,
                        Number(mass.length > 0 ? mass[0].innerHTML : '')
                    )];
                });
            } else {
                return [];
            }
        });
    }

    findByIdentifiers(ids: string[]): Promise<SingleStructure[]> {
        if(ids.length === 0) {
            return Sleep.noSleepPromise();
        }
        ids.unshift('');
        return fetch(ENDPOINT_URI, {
            method: 'POST',
            headers: {'Content-Type': 'text/xml;charset=UTF-8'},
            body: ChebiFinder.createEnvelope([GET_COMPLETE_ENTITY_BY_LIST_START + ids.reduce((acc, itm) => acc + `<ListOfChEBIIds>${itm}</ListOfChEBIIds>`) + GET_COMPLETE_ENTITY_BY_LIST_END])
        }).then(response => {
            if (response.status === 200) {
                return response.text().then(data => {
                    let parser = new DOMParser();
                    let xml = parser.parseFromString(data, 'text/xml');
                    let structures = Array.from(xml.getElementsByTagName('return'));
                    return structures.map(elem => {
                        let id = elem.getElementsByTagName('chebiId');
                        let name = elem.getElementsByTagName('chebiAsciiName');
                        let smiles = elem.getElementsByTagName('smiles');
                        let mass = elem.getElementsByTagName('monoisotopicMass');
                        let formulaes = elem.getElementsByTagName('Formulae');
                        let formula = '';
                        if (formulaes.length > 0) {
                            formulaes = formulaes[0].getElementsByTagName('data');
                            if (formulaes.length > 0) {
                                formula = formulaes[0].innerHTML;
                            }
                        }
                        return new SingleStructure(
                            id.length > 0 ? id[0].innerHTML : '',
                            ServerEnum.CHEBI,
                            name.length > 0 ? name[0].innerHTML : '',
                            smiles.length > 0 ? smiles[0].innerHTML : '',
                            formula,
                            Number(mass.length > 0 ? mass[0].innerHTML : '')
                        );
                    });
                }).catch(() => []);
            } else {
                return [];
            }
        }).catch(() => []);
    }

    findByMass(mass: number): Promise<SingleStructure[]> {
        return this.getLiteEntity(mass.toString(), MASS);
    }

    findByName(name: string): Promise<SingleStructure[]> {
        return this.getLiteEntity(name, CHEBI_NAME);
    }

    findBySmiles(smiles: string): Promise<SingleStructure[]> {
        if (smiles === '') {
            return Sleep.noSleepPromise();
        }
        return fetch(ENDPOINT_URI, {
            method: 'POST',
            headers: {'Content-Type': 'text/xml;charset=UTF-8'},
            body: ChebiFinder.createEnvelope([GET_STRUCTURE_SEARCH_START + ChebiFinder.setStructure(smiles) + SMILES_SETUP + GET_STRUCTURE_SEARCH_END])
        }).then(this.handleResponse).catch(() => []);
    }

    private handleResponse(response: any): Promise<SingleStructure[]> {
        if (response.status === 200) {
            return response.text().then((data: any) => {
                let parser = new DOMParser();
                let xml = parser.parseFromString(data, 'text/xml');
                let ids = Array.from(xml.getElementsByTagName('chebiId')).map(elem => elem.innerHTML);
                return this.findByIdentifiers(ids);
            }).catch(() => []);
        } else {
            return Sleep.noSleepPromise();
        }
    }

    private static createEnvelope(params: string[]) {
        return ENVELOPE_START + params.reduce(param => param) + ENVELOPE_END;
    }

    private static setChebiId(id: string): string {
        return `<chebiId>${id}</chebiId>`;
    }

    private static setSearch(search: string): string {
        return `<search>${search}</search>`;
    }

    private static setCategory(category: string): string {
        return `<searchCategory>${category}</searchCategory>`;
    }

    private static setStructure(structure: string): string {
        return `<structure>${structure}</structure>`;
    }

    private getLiteEntity(search: string, category: string): Promise<SingleStructure[]> {
        if (search === '') {
            return Sleep.noSleepPromise();
        }
        return fetch(ENDPOINT_URI, {
            method: 'POST',
            headers: {'Content-Type': 'text/xml;charset=UTF-8'},
            body: ChebiFinder.createEnvelope([GET_LITE_ENTITY_START + ChebiFinder.setSearch(search) + ChebiFinder.setCategory(category) + MAXIMUM_RESULTS + STARS + GET_LITE_ENTITY_END])
        }).then(this.handleResponse).catch(() => []);
    }

}

export default ChebiFinder;
