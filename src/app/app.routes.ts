import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './services/auth-service';


const isAuthenticated = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getConnectedUser().pipe(
    map((user) => {
      if (!user) {
        router.navigateByUrl('/login-page');
      }
      return !!user;
    })
  );
};

export const routes: Routes = [
  {
    path: 'home',
    canActivate: [isAuthenticated],
    loadComponent: () =>
      import('./components/home-page/home-page.component').then(m => m.HomePageComponent),
  },
  {
    path: 'form',
    canActivate: [isAuthenticated],
    loadComponent: () =>
      import('./components/signal-form/signal-form.component').then(m => m.SignalFormComponent),
  },
  {
    path: 'game-room/:id',
    canActivate: [isAuthenticated],
    loadComponent: () =>
      import('./components/game-page/game-page.component').then(m => m.GameRoomPage),
  },
  {
    path: 'admin-game-room/:id',
    canActivate: [isAuthenticated],
    loadComponent: () =>
      import('./components/admin-game-room/admin-game-room.component').then(m => m.AdminGameRoomComponent),
  },

  {
    path: 'login-page',
    loadComponent: () =>
      import('./components/login-page/login-page.page').then(m => m.LoginPagePage),
  },
  {
    path: 'register-page',
    loadComponent: () =>
      import('./components/register-page/register-page.page').then(m => m.RegisterPagePage),
  },

  // redirect
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];