import axios from 'axios';

export default class PropertyService {

	URL = 'http://localhost:3000/api/v1';

	getProperties(tableOptions = null) {
		let path = '';
		if (tableOptions) {
			path = '?' + tableOptions;
		}
		return axios.get(`${this.URL}/properties` + path).then(res => res.data);
	}

	getAvaliableProperties() {
		return axios.get(`${this.URL}/properties?available=true`).then(res => res.data.data);
	}

	deleteProperty(id) {
		return axios.delete(`${this.URL}/properties/${id}`).then(res => res.data.data);
	}

	saveProperty(property) {
		if (property.id) {
			return axios.put(`${this.URL}/properties/${property.id}`, property).then(res => res.data.data);	
		}

		return axios.post(`${this.URL}/properties`, property).then(res => res.data.data);
	}

	getStates() {
		return [
			{ 'state': 'AL', 'name': 'Alagoas' },
			{ 'state': 'AC', 'name': 'Acre' },
			{ 'state': 'AP', 'name': 'Amapá' },
			{ 'state': 'AM', 'name': 'Amazonas' },
			{ 'state': 'BA', 'name': 'Bahia' },
			{ 'state': 'CE', 'name': 'Ceará' },
			{ 'state': 'DF', 'name': 'Distrito Federal' },
			{ 'state': 'ES', 'name': 'Espírito Santo' },
			{ 'state': 'GO', 'name': 'Goías' },
			{ 'state': 'MA', 'name': 'Maranhão' },
			{ 'state': 'MT', 'name': 'Mato Grosso' },
			{ 'state': 'MS', 'name': 'Mato Grosso do Sul' },
			{ 'state': 'MG', 'name': 'Minas Gerais' },
			{ 'state': 'PA', 'name': 'Pará' },
			{ 'state': 'PB', 'name': 'Paraíba' },
			{ 'state': 'PR', 'name': 'Paraná' },
			{ 'state': 'PE', 'name': 'Pernambuco' },
			{ 'state': 'PI', 'name': 'Piauí' },
			{ 'state': 'RJ', 'name': 'Rio de Janeiro' },
			{ 'state': 'RN', 'name': 'Rio Grande do Norte' },
			{ 'state': 'RS', 'name': 'Rio Grande do Sul' },
			{ 'state': 'RO', 'name': 'Rondônia' },
			{ 'state': 'RR', 'name': 'Roraíma' },
			{ 'state': 'SC', 'name': 'Santa Catarina' },
			{ 'state': 'SP', 'name': 'São Paulo' },
			{ 'state': 'SE', 'name': 'Sergipe' },
			{ 'state': 'TO', 'name': 'Tocantins' },
		];
	}
}
