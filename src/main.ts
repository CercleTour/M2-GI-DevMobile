import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, withHashLocation, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { initializeApp } from "firebase/app";
import { provideFirebaseApp } from "@angular/fire/app";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";
import { environment } from "./environments/environment";
import { provideAuth, getAuth } from '@angular/fire/auth';

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideZoneChangeDetection(),{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withHashLocation(), withPreloading(PreloadAllModules)),
    provideAuth(() => getAuth()),
  ],
});
