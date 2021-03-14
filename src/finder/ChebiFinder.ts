import IFinder from "./IFinder";
import SingleStructure from "./SingleStructure";
import Sleep from "../helper/Sleep";
import {ServerEnum} from "../enum/ServerEnum";

const ENDPOINT_URI = 'https://thingproxy.freeboard.io/fetch/http://www.ebi.ac.uk:80/webservices/chebi/2.0/webservice';
const ENVELOPE_START = `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Body>`;
const ENVELOPE_END = "</Body></Envelope>";
const GET_COMPLETE_ENTITY_START = '<getCompleteEntity xmlns="https://www.ebi.ac.uk/webservices/chebi">';
const GET_COMPLETE_ENTITY_END = "</getCompleteEntity>";

class ChebiFinder implements IFinder {
    findByFormula(formula: string): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    findByIdentifier(id: string): Promise<SingleStructure[]> {
        return fetch(ENDPOINT_URI, {
            method: 'POST',
            headers: {'Content-Type': 'text/xml;charset=UTF-8'},
            body: this.createEnvelope([GET_COMPLETE_ENTITY_START + this.setChebiId(id) + GET_COMPLETE_ENTITY_END])
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
                        formula = formulaes[0].innerHTML;
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
        return Sleep.noSleepPromise();
    }

    findByMass(mass: number): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    findByName(name: string): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    findBySmiles(smiles: string): Promise<SingleStructure[]> {
        return Sleep.noSleepPromise();
    }

    private createEnvelope(params: string[]) {
        return ENVELOPE_START + params.reduce(param => param) + ENVELOPE_END;
    }

    private setChebiId(id: string): string {
        return `<chebiId>${id}</chebiId>`;
    }

}

export default ChebiFinder;
