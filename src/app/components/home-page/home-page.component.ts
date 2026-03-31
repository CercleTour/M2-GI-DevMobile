import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Quiz } from 'src/app/models/quiz';
import { QuizService } from 'src/app/services/quiz-service';
import { IonButton, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonFab, IonFabButton, IonIcon, ModalController, IonButtons, IonFooter } from '@ionic/angular/standalone';
import { QuizCardComponent } from '../quiz-card/quiz-card.component';
import { CreateQuizModal } from '../modals/create-quiz/create-quiz.modal';
import { addIcons } from 'ionicons';
import {
  add,
  addOutline,
  logOutOutline,
  playOutline,
  enterOutline
} from 'ionicons/icons';

import { JoinRoomComponent } from '../modals/join-room/join-room.component';
import { CreateRoomComponent } from '../modals/create-room/create-room.component';
import { QuizDetailModal } from '../modals/detail-quiz/quiz-detail.modal';
import { AuthService } from 'src/app/services/auth-service';
import { Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    QuizCardComponent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonButton,
    IonButtons,
    IonFooter
  ],
})
export class HomePageComponent implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);

  quizzes: Quiz[] | null = null;
  myQuizzes: Quiz[] | null = null;
  publicQuizzes: Quiz[] | null = null;

  private subscriptions = new Subscription();

  constructor(private quizService: QuizService) {
    addIcons({
      add,
      addOutline,
      logOutOutline,
      playOutline,
      enterOutline
    });
  }

  ngOnInit() {
    this.resetState();

    const authSub = this.authService.getConnectedUser().subscribe(user => {
      if (!user) return;

      const mySub = this.quizService.getByUserId(user.uid).subscribe(my => {
        this.myQuizzes = my;
        this.updateCombined();
      });

      const pubSub = this.quizService.getOthersPublic(user.uid).subscribe(pub => {
        this.publicQuizzes = pub;
        this.updateCombined();
      });

      this.subscriptions.add(mySub);
      this.subscriptions.add(pubSub);
    });

    this.subscriptions.add(authSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private resetState() {
    this.quizzes = null;
    this.myQuizzes = null;
    this.publicQuizzes = null;
  }

  private updateCombined() {
    if (!this.myQuizzes || !this.publicQuizzes) return;

    const filteredPublic = this.publicQuizzes.filter(
      pub => !this.myQuizzes!.some(my => my.id === pub.id)
    );

    this.quizzes = [...this.myQuizzes, ...filteredPublic];
  }

  async createQuiz() {
    const modal = await this.modalCtrl.create({
      component: CreateQuizModal
    });

    await modal.present();

    const result = await modal.onDidDismiss();

    if (result.data) {
      try {
        const quiz: Quiz = result.data;

        const user = await firstValueFrom(this.authService.getConnectedUser());
        if (!user) {
          throw new Error('User not authenticated');
        }

        quiz.authorId = user.uid;
        quiz.isPublic = false;

        await this.quizService.saveQuiz(quiz);

      } catch (error) {
        console.error('Error saving quiz:', error);
      }
    }
  }

  async openQuiz(quiz: Quiz) {
    try {
      const modal = await this.modalCtrl.create({
        component: QuizDetailModal,
        componentProps: { quiz }
      });

      await modal.present();

    } catch (error) {
      console.error('Modal error:', error);
    }
  }

  async openJoinRoomModal() {
    const modal = await this.modalCtrl.create({
      component: JoinRoomComponent
    });

    await modal.present();
  }

  async openCreateRoomModal() {
    const modal = await this.modalCtrl.create({
      component: CreateRoomComponent,
      componentProps: {
        quizzes: this.quizzes
      }
    });

    await modal.present();
  }

  async logout() {
    // 🔥 stop all live subscriptions
    this.subscriptions.unsubscribe();

    // 🧹 clear local state
    this.resetState();

    // 🔐 logout
    await this.authService.logout();

    // 🚀 redirect
    this.router.navigateByUrl('/login-page');
  }
}