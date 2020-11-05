<template>
	<div class="p-grid crud-demo">
		<div class="p-col-12">
			<div class="card">
				<Toast/>
				<Toolbar class="p-mb-4">
					<template v-slot:right>
						<Button label="Adicionar Imóvel" icon="pi pi-plus" class="p-button-raised p-button-secondary p-mr-2" 
							@click="openNew" />
					</template>
				</Toolbar>

				<DataTable ref="dt" :value="properties" v-model:selection="selectedProperty" dataKey="id" selectionMode="single"
					:rows="10" paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown" 
					:rowsPerPageOptions="[10,15,20]" :lazy="true" :paginator="true" :totalRecords="totalRecords" :loading="tableLoading" 
					@page="onPage($event)" @sort="onSort($event)"
					currentPageReportTemplate="Mostrando {first} de {last} do total de {totalRecords} imóveis">
					<template #empty>
						Nenhum imóvel foi encontrado!
					</template>
					<template #header>
						<div class="p-text-center">
							<h5 class="p-m-0 p-text-center">Listagem de Imóveis</h5>
						</div>
					</template>
					<Column field="id" header="ID" :sortable="true" headerStyle="width: 8%" bodyClass="p-text-center" 
						headerClass="p-text-center"></Column>
					<Column field="owner_email" header="Email do Proprietário" headerStyle="width: 24%" :sortable="true"></Column>
					<Column field="address" header="Endereço" :sortable="true"></Column>
					<Column field="status" header="Status" headerStyle="width: 11%" bodyClass="p-text-center" 
						headerClass="p-text-center">
						<template #body>
							<span class="p-tag p-tag-rounded p-tag-success" v-if="property.status">Contratado</span>
							<span class="p-tag p-tag-rounded p-tag-secondary" v-else>Não Contratado</span>
						</template>
					</Column>
					<Column headerStyle="width: 10%" bodyClass="p-text-center" headerClass="p-text-center">
						<template #body="slotProps">
							<Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-mr-2" @click="editProperty(slotProps.data)" />
							<Button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="confirmDeleteProperty(slotProps.data)" />
						</template>
					</Column>
				</DataTable>


				<Dialog v-model:visible="propertyDialog" :style="{width: '700px'}" :header="property.id ? 'Editar Imóvel' : 'Cadastrar Imóvel'" :modal="true" 
					class="p-fluid">
					<div class="p-field" :class="{'p-invalid': submitted && (!property.owner_email || !this.validateEmail(property.owner_email)) }">
						<label for="owner_email">Email do Proprietário: <span class="required">*</span></label>
						<InputText id="owner_email" v-model.trim="property.owner_email" required="true" autofocus maxlength="60" 
							:class="{'p-invalid': submitted && (!property.owner_email || !this.validateEmail(property.owner_email)) }" />
						<small class="p-invalid" v-if="submitted && !property.owner_email">Email é obrigatório!</small>
						<small class="p-invalid" style="display: block;" v-if="submitted && !this.validateEmail(property.owner_email)">Email inválido!</small>
					</div>

					<div class="p-field" :class="{'p-invalid': submitted && !property.address}">
						<label for="address">Endereço: <span class="required">*</span></label>
						<InputText id="address" v-model.trim="property.address" required="true" autofocus 
							:class="{'p-invalid': submitted && !property.address}" maxlength="200" />
						<small class="p-invalid" v-if="submitted && !property.address">Endereço é obrigatório!</small>
					</div>

					<div class="p-formgrid p-grid">
						<div class="p-field p-col" :class="{'p-invalid': submitted && !property.number}">
							<label for="number">Número:</label>
							<InputText id="number" v-model.trim="property.number" required="true" autofocus 
								:class="{'p-invalid': submitted && !property.number}" maxlength="10" />
							<small class="p-invalid" v-if="submitted && !property.number">Nº é obrigatório!</small>
						</div>

						<div class="p-field p-col" :class="{'p-invalid': submitted && !property.complement}">
							<label for="complement">Complemento:</label>
							<InputText id="complement" v-model.trim="property.complement" required="true" autofocus 
								:class="{'p-invalid': submitted && !property.complement}" maxlength="100" />
							<small class="p-invalid" v-if="submitted && !property.complement">Complemento é obrigatório!</small>
						</div>
					</div>
					
					<div class="p-field" :class="{'p-invalid': submitted && !property.neighborhood}">
						<label for="neighborhood">Bairro: <span class="required">*</span></label>
						<InputText id="neighborhood" v-model.trim="property.neighborhood" required="true" autofocus 
							:class="{'p-invalid': submitted && !property.neighborhood}" maxlength="60" />
						<small class="p-invalid" v-if="submitted && !property.neighborhood">Bairro é obrigatório!</small>
					</div>

					<div class="p-field" :class="{'p-invalid': submitted && !property.city}">
						<label for="city">Cidade: <span class="required">*</span></label>
						<InputText id="city" v-model.trim="property.city" required="true" autofocus 
							:class="{'p-invalid': submitted && !property.city}" maxlength="60" />
						<small class="p-invalid" v-if="submitted && !property.city">Cidade é obrigatória!</small>
					</div>

					<div class="p-field" :class="{'p-invalid': submitted && !property.state}">
						<label for="state">Estado: <span class="required">*</span></label>
						<Dropdown v-model="property.state" :options="states" optionLabel="state" optionValue="state" :filter="true" 
							placeholder="Selecione um Estado..." :class="{'p-invalid': submitted && !property.state}" />
						<small class="p-invalid" v-if="submitted && !property.state">Estado é obrigatório!</small>
					</div>

					<template #footer>
						<Button label="Salvar" icon="pi pi-check" class="p-button-raised p-button-primary" @click="saveProperty()" />
						<Button label="Cancelar" icon="pi pi-times" class="p-button-raised p-button-danger" @click="hideDialog"/>
					</template>

					<div class="p-field">
						<span class="required">*</span> Campo é obrigatório!
					</div>
				</Dialog>

				<Dialog v-model:visible="deletePropertyDialog" :style="{width: '300px'}" header="Confirmação" :modal="true">
					<div class="confirmation-content">
						<i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem" />
						<span v-if="property">Deseja deletar este imóvel?</span>
					</div>
					<template #footer>
						<Button label="Sim" icon="pi pi-check" class="p-button-raised p-button-primary" @click="deleteProperty()" />
						<Button label="Não" icon="pi pi-times" class="p-button-raised p-button-warning" @click="deletePropertyDialog = false"/>
					</template>
				</Dialog>

			</div>
		</div>
	</div>

</template>

<script>
import PropertyService from '../service/PropertyService';

export default {
	data() {
		return {
			properties: null,
			propertyDialog: false,
			deletePropertyDialog: false,
			totalRecords: 0,
			property: {},
			selectedProperty: null,
			submitted: false,
			tableLoading: false,
			states: [],
		}
	},
	// propertyService: null,
	created() {
		this.propertyService = new PropertyService();
	},
	mounted() {
		this.loadProperties();
		this.loadStates();
	},
	methods: {
		loadStates() {
			this.states = this.propertyService.getStates();
		},
		loadProperties(event = null) {
			this.tableLoading = true;

			this.propertyService.getProperties(event).then(data => {
				this.totalRecords = data['total'];
				this.properties = data['data'].map(record => {
					record.address = this.joinAddress(record);
					return record;
				});

				this.tableLoading = false;
			});
		},
		openNew() {
			this.property = {};
			this.submitted = false;
			this.propertyDialog = true;
		},
		hideDialog() {
			this.propertyDialog = false;
			this.submitted = false;
		},
		validateForm() {

			if (!this.property.owner_email) return false;
			if (!this.validateEmail(this.property.owner_email)) return false;
			if (!this.property.address) return false;
			if (!this.property.neighborhood) return false;
			if (!this.property.city) return false;
			if (!this.property.state) return false;

			return true;
		},
		validateEmail(email) {
			const re =  /\S+@\S+\.\S+/;
			return re.test(String(email).toLowerCase());
		},
		saveProperty() {
			this.submitted = true;

			if (this.validateForm()) {

				this.propertyService.saveProperty(this.property).then(() => {
					this.$toast.add({severity:'success', summary: 'Sucesso', detail: 'Imóvel salvo com sucesso!', life: 3000});
					this.propertyDialog = false;
					this.property = {};
					this.loadProperties();
				});

			}
		},
		editProperty(property) {
			console.log('EDIT: ', property);
			this.property = {...property};
			this.propertyDialog = true;
		},
		confirmDeleteProperty(property) {
			this.property = property;
			this.deletePropertyDialog = true;
		},
		deleteProperty() {
			this.propertyService.deleteProperty(this.property.id).then(() => {
				this.property = {};
				this.deletePropertyDialog = false;

				this.$toast.add({severity:'success', summary: 'Sucesso', detail: 'Imóvel deletado com sucesso!', life: 3000});
				this.loadProperties();
			});
		},
		joinAddress(property) {
			if (property) {
				const fullAddress = [];
				if (property.address) fullAddress.push(property.address);
				if (property.number) fullAddress.push(property.number);
				if (property.city) fullAddress.push(property.city);
				if (property.state) fullAddress.push(property.state);

				return fullAddress.join(', ');
			}
		},
		onPage(event) {
			this.loadProperties(this.buildQueryString(event));
		},
		onSort(event) {
			this.loadProperties(this.buildQueryString(event));
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
