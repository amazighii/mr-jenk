import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/home')
            .then(m => m.Home),
    },
    {
        path: 'login',
        loadComponent: () => import('./login/login')
            .then(m => m.Login),
    },
    {
        path: 'register',
        loadComponent: () => import('./register/register')
            .then(m => m.Register),
    }
];
