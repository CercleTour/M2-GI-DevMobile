import { Component, OnInit, inject } from '@angular/core';
import { Quiz } from 'src/app/models/quiz';
import { QuizService } from 'src/app/services/quizService';
import { IonButton, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonFab, IonFabButton, IonIcon, ModalController, IonButtons } from '@ionic/angular/standalone';
import { QuizCardComponent } from '../quiz-card/quiz-card.component';
import { CreateQuizModal } from '../modals/create-quiz/create-quiz.modal';
import { add, logOutOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { JoinRoomComponent } from '../modals/join-room/join-room.component';
import { CreateRoomComponent } from '../modals/create-room/create-room.component';
import { QuizDetailModal } from '../modals/detail-quiz/quiz-detail.modal';
import { AuthService } from 'src/app/services/auth-service';
import { Router } from '@angular/router';

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
    IonButtons
],
})


export class HomePageComponent  implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  quizzes: Quiz[] = [];
  private itemsPerLine = 4;
  private lines: Array<number> = [];
  constructor(private quizService: QuizService) {
    addIcons
    ({  add,
        logOutOutline,
     });
  }
  
  ngOnInit() {
    this.quizService.getAll().subscribe((quizzes) => {
      this.quizzes = quizzes;
    });
  }

  async createQuiz() {

    const modal = await this.modalCtrl.create({
      component: CreateQuizModal
    });

    await modal.present();

    const result = await modal.onDidDismiss();

    if(result.data) {
      console.log("Created quiz:", result.data);
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

  // For debug
  async addTestQuiz() {
    const testQuiz: Quiz = {
      id: '',
      title: 'Math & General Knowledge',
      description: 'A simple test quiz with two questions',
      questions: [
        {
          id: '',
          text: 'What is 2 + 2?',
          choices: [
            { id: 'a', text: '3' },
            { id: 'b', text: '4' },
            { id: 'c', text: '5' }
          ],
          correctChoiceId: 'b'
        },
        {
          id: '',
          text: 'What is the capital of France?',
          choices: [
            { id: 'a', text: 'Berlin' },
            { id: 'b', text: 'Madrid' },
            { id: 'c', text: 'Paris' }
          ],
          correctChoiceId: 'c'
        }
      ]
    };

    try {
      const id = await this.quizService.addQuiz(testQuiz);
      console.log('Test quiz created with ID:', id);
    } catch (error) {
      console.error('Error creating test quiz:', error);
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
    await this.authService.logout();
    this.router.navigateByUrl('/login-page');
  }
}