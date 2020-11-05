import axios from 'axios';

export default class ContractService {

	URL = 'http://localhost:3000/api/v1';

	getContracts(tableOptions = null) {
		let path = '';
		if (tableOptions) {
			path = '?' + tableOptions;
		}
		return axios.get(`${this.URL}/contracts` + path).then(res => res.data);
	}

	deleteContract(id) {
		return axios.delete(`${this.URL}/contracts/${id}`).then(res => res.data.data);
	}

	saveContract(contract) {
		if (contract.id) {
			return axios.put(`${this.URL}/contracts/${contract.id}`, contract).then(res => res.data.data);	
		}

		return axios.post(`${this.URL}/contracts`, contract).then(res => res.data.data);
	}

	getPersonTypes() {
		return [
			{'label': 'Pessoa Física', 'value': 'PF'},
			{'label': 'Pessoa Jurídica', 'value': 'PJ'}
		];
	}
}
