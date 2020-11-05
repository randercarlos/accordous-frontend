<template>
	<div class="p-grid crud-demo">
		<div class="p-col-12">
			<div class="card">
				<Toast/>
				<Toolbar class="p-mb-4">
					<template v-slot:right>
						<Button label="Adicionar Contrato" icon="pi pi-plus" class="p-button-raised p-button-secondary p-mr-2" 
							@click="openNew" />
					</template>
				</Toolbar>

				<DataTable ref="dt" :value="contracts" v-model:selection="selectedContract" dataKey="id" selectionMode="single"
					:rows="10" paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown" 
					:rowsPerPageOptions="[10,15,20]" :lazy="true" :paginator="true" :totalRecords="totalRecords" :loading="tableLoading" 
					@page="onPage($event)" @sort="onSort($event)"
					currentPageReportTemplate="Mostrando {first} de {last} do total de {totalRecords} contratos">
					<template #empty>
						Nenhum contrato foi encontrado!
					</template>
					<template #header>
						<div class="p-text-center">
							<h5 class="p-m-0 p-text-center">Listagem de Contratos</h5>
						</div>
					</template>
					<Column field="id" header="ID" :sortable="true" headerStyle="width: 7%" bodyClass="p-text-center" 
						headerClass="p-text-center"></Column>
					<Column field="contractor_fullname" header="Nome do Contratante" headerStyle="width: 20%" :sortable="true"></Column>
					<Column field="contractor_email" header="Email do Contratante" headerStyle="width: 20%" :sortable="true"></Column>
					<Column field="person_type" header="Tipo" headerStyle="width: 11%" bodyClass="p-text-center" :sortable="true"
						headerClass="p-text-center">
						<template #body="slotProps">
							<span class="p-tag p-tag-rounded p-tag-info" v-if="slotProps.data.person_type == 'PF'">Pessoa Física</span>
							<span class="p-tag p-tag-rounded p-tag-success" v-if="slotProps.data.person_type == 'PJ'">Pessoa Jurídica</span>
						</template>
					</Column>
					<Column field="document" header="Documento" :sortable="true" headerStyle="width: 12%" bodyClass="p-text-center" 
						headerClass="p-text-center"></Column>
					<Column field="propertyAddress" header="Propriedade"></Column>
					<Column headerStyle="width: 10%" bodyClass="p-text-center" headerClass="p-text-center">
						<template #body="slotProps">
							<Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-mr-2" @click="editContract(slotProps.data)" />
							<Button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="confirmDeleteContract(slotProps.data)" />
						</template>
					</Column>
				</DataTable>


				<Dialog v-model:visible="contractDialog" :style="{width: '700px'}" :header="contract.id ? 'Editar Contrato' : 'Cadastrar Contrato'" :modal="true" 
					class="p-fluid" @hide="hideDialog()">

					<div class="p-field" :class="{'p-invalid': submitted && !contract.contractor_fullname}">
						<label for="contractor_fullname">Nome Completo do Contrante: <span class="required">*</span></label>
						<InputText id="address" v-model.trim="contract.contractor_fullname" required="true" autofocus 
							:class="{'p-invalid': submitted && !contract.contractor_fullname}" maxlength="60" />
						<small class="p-invalid" v-if="submitted && !contract.contractor_fullname">Nome é obrigatório!</small>
					</div>

					<div class="p-field" :class="{'p-invalid': submitted && (!contract.contractor_email || !this.validateEmail(contract.contractor_email)) }">
						<label for="contractor_email">Email do Contrante: <span class="required">*</span></label>
						<InputText id="contractor_email" v-model.trim="contract.contractor_email" required="true" autofocus maxlength="60" 
							:class="{'p-invalid': submitted && (!contract.contractor_email || !this.validateEmail(contract.contractor_email)) }" />
						<small class="p-invalid" v-if="submitted && !contract.contractor_email">Email é obrigatório!</small>
						<small class="p-invalid" style="display: block;" v-if="submitted && !this.validateEmail(contract.contractor_email)">Email inválido!</small>
					</div>


					<div class="p-field" :class="{'p-invalid': submitted && !contract.person_type}">
						<label for="person_type">Tipo de Pessoa: <span class="required">*</span></label>
						<SelectButton v-model="contract.person_type" :options="personTypes" optionLabel="label"  optionValue="value" 
						@focus="contract.document = null;"/>
						<small class="p-invalid" v-if="submitted && !contract.person_type">Tipo de pessoa é obrigatório!</small>
					</div>


					<div class="p-field" :class="{'p-invalid': submitted && !contract.document }">
						<label for="document">{{ contract.person_type == 'PJ' ? 'CNPJ' : 'CPF'}}: <span class="required">*</span></label>

						<InputMask id="document" v-model.trim="contract.document" required="true" autofocus v-if="contract.person_type == 'PF'"
							mask="999.999.999-99" :class="{'p-invalid': submitted && (!contract.document || !this.validateCNPJ(contract.document)) }" maxlength="30" />
						<InputMask id="document" v-model.trim="contract.document" required="true" autofocus v-if="contract.person_type == 'PJ'"
							mask="99.999.999/9999-99" :class="{'p-invalid': submitted && (!contract.document || !this.validateCPF(contract.document)) }" maxlength="30" />
							
						<small class="p-invalid" style="display: block;" v-if="submitted && !contract.document">{{ contract.person_type == 'PJ' ? 'CNPJ' : 'CPF'}} é obrigatório!</small>
						<small class="p-invalid" style="display: block;" v-if="submitted && contract.document && contract.person_type == 'PF' && !this.validateCPF(contract.document)">CPF inválido!</small>
						<small class="p-invalid" style="display: block;" v-if="submitted && contract.document && contract.person_type == 'PJ' && !this.validateCNPJ(contract.document)">CNPJ inválido!</small>
					</div>


					<div class="p-field" v-if="contract.property">
						<label style="display: block;">Propriedade atual: </label>
						<span>{{ contract.propertyAddress }}</span>
					</div>

					<div class="p-field" :class="{'p-invalid': submitted && !contract.property_id}">
						<label for="property_id">Propriedades Disponíveis: <span class="required">*</span></label>
						<Dropdown v-model="contract.property_id" :options="availableProperties" optionLabel="propertyAddress" optionValue="id" 
							:filter="true" placeholder="Selecione uma propriedade..." :class="{'p-invalid': submitted && !contract.property_id}" />
						<small class="p-invalid" v-if="submitted && !contract.property_id">Propriedade é obrigatória!</small>
					</div>

					<template #footer>
						<Button label="Salvar" icon="pi pi-check" class="p-button-raised p-button-primary" @click="saveContract()" />
						<Button label="Cancelar" icon="pi pi-times" class="p-button-raised p-button-danger" @click="hideDialog()"/>
					</template>

					<div class="p-field">
						<span class="required">*</span> Campo é obrigatório!
					</div>
				</Dialog>

				<Dialog v-model:visible="deleteContractDialog" :style="{width: '300px'}" header="Confirmação" :modal="true">
					<div class="confirmation-content">
						<i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem" />
						<span v-if="contract">Deseja deletar este contato?</span>
					</div>
					<template #footer>
						<Button label="Sim" icon="pi pi-check" class="p-button-raised p-button-primary" @click="deleteContract()" />
						<Button label="Não" icon="pi pi-times" class="p-button-raised p-button-warning" @click="deleteContractDialog = false"/>
					</template>
				</Dialog>

			</div>
		</div>
	</div>

</template>

<script>
import ContractService from '../service/ContractService';
import PropertyService from '../service/PropertyService';
import validationsMixin from '@/mixins/validationsMixin.js';

export default {
	mixins: [validationsMixin],
	data() {
		return {
			contracts: null,
			contractDialog: false,
			deleteContractDialog: false,
			totalRecords: 0,
			contract: {},
			selectedContract: null,
			submitted: false,
			tableLoading: false,
			personTypes: [],
			availableProperties: [],
		}
	},
	created() {
		this.contractService = new ContractService();
		this.propertyService = new PropertyService();
	},
	mounted() {
		this.loadContracts();
		this.loadPersonTypes();
		this.loadAvailableProperties();
	},
	methods: {
		loadContracts(event = null) {
			this.tableLoading = true;

			this.contractService.getContracts(event).then(data => {
				this.totalRecords = data['total'];
				this.contracts = data['data'].map(record => {
					record.propertyAddress = this.joinAddress(record);
					return record;
				});

				this.tableLoading = false;
			});
		},
		loadAvailableProperties() {
			this.propertyService.getAvaliableProperties().then(data => {
				this.availableProperties = data.map(record => {
					record.propertyAddress = this.buildAddress(record);
					return record;
				});
			});
		},
		loadPersonTypes() {
			this.personTypes = this.contractService.getPersonTypes();
		},
		openNew() {
			this.contract = {};
			this.contract.person_type = 'PF';
			this.submitted = false;
			this.contractDialog = true;
		},
		hideDialog() {
			this.contractDialog = false;
			this.submitted = false;
		},
		validateEmail(email) {
			const re =  /\S+@\S+\.\S+/;
			return re.test(String(email).toLowerCase());
		},
		validateForm() {

			if (!this.contract.contractor_fullname) return false;
			if (!this.validateEmail(this.contract.contractor_email)) return false;
			if (!this.contract.person_type) return false;
			if (!this.contract.document) return false;
			if (!this.contract.property_id) return false;

			if (this.contract.person_type == 'PF' && !this.validateCPF(this.contract.document)) return false;
			if (this.contract.person_type == 'PJ' && !this.validateCNPJ(this.contract.document)) return false;

			return true;
		},
		saveContract() {
			this.submitted = true;

			if (this.validateForm()) {

				this.contractService.saveContract(this.contract).then(() => {
					this.$toast.add({severity:'success', summary: 'Sucesso', detail: 'Contrato salvo com sucesso!', life: 3000});
					console.log('CONTRATO SALVO: ', this.contract);
					this.contractDialog = false;
					this.contract = {};
					this.loadContracts();
					this.loadAvailableProperties();
				});

			}
		},
		editContract(contract) {
			this.contract = {...contract};
			this.contractDialog = true;
		},
		confirmDeleteContract(contract) {
			this.contract = contract;
			this.deleteContractDialog = true;
		},
		deleteContract() {
			this.contractService.deleteContract(this.contract.id).then(() => {
				this.contract = {};
				this.deleteContractDialog = false;

				this.$toast.add({severity:'success', summary: 'Sucesso', detail: 'Contrato deletado com sucesso!', life: 3000});
				this.loadContracts();
				this.loadAvailableProperties();
			});
		},
		buildAddress(contract) {
			if (contract ) {
				const fullAddress = [];
				if (contract.address) fullAddress.push(contract.address);
				if (contract.number) fullAddress.push(contract.number);
				if (contract.complement) fullAddress.push(contract.complement);
				if (contract.neighborhood) fullAddress.push(contract.neighborhood);

				return fullAddress.join(', ');
			}
		},
		joinAddress(contract) {
			if (contract && contract['property']) {
				const fullAddress = [];
				if (contract['property'].address) fullAddress.push(contract['property'].address);
				if (contract['property'].number) fullAddress.push(contract['property'].number);
				if (contract['property'].complement) fullAddress.push(contract['property'].complement);
				if (contract['property'].neighborhood) fullAddress.push(contract['property'].neighborhood);

				return fullAddress.join(', ');
			}
		},
		onPage(event) {
			this.loadContracts(this.buildQueryString(event));
		},
		onSort(event) {
			this.loadContracts(this.buildQueryString(event));
		},
		buildQueryString(event) {

			const firstRowOffset = event && event['first'] ? event['first'] : 0;
			const rowsPerPage = event && event['rows'] ? event['rows'] : 10; // get the rows number per page
			const page = Math.floor(firstRowOffset / rowsPerPage) + 1;  // calculate the current page

			let params = [];
			params.push('_limit=' + rowsPerPage);
			params.push('_page=' + page);

			if (event && event['sortField']) {
				params.push('_sort=' + event['sortField']);
				params.push('_order=' + (event['sortOrder'] == 1 ? 'asc' : 'desc'));
			}

			return params.join('&');
		}
	}
}
</script>

<style scoped lang="scss">
.table-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.p-dialog .product-image {
	width: 150px;
	margin: 0 auto 2rem auto;
	display: block;
}

.confirmation-content {
	display: flex;
	align-items: center;
	justify-content: center;
}

span.required {
	font-size: 14px;
	color: red;
}

</style>
