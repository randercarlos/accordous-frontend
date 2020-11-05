import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/imoveis'
    },
    {
        path: '/imoveis',
        name: 'imoveis',
        component: () => import('./views/PropertyCrud.vue'),
    },
    {
        path: '/contratos',
        name: 'contratos',
        component: () => import('./views/ContractCrud.vue'),
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
