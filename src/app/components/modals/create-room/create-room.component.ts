import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { GameService } from 'src/app/services/game-service';
import { Quiz } from 'src/app/models/quiz';
import { Observable } from 'rxjs';
import { QuizService } from 'src/app/services/quizService';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
})
export class CreateRoomComponent implements OnInit {

  quizzes$: Observable<Quiz[]> = new Observable();
  selectedQuizId: string | null = null;
  error: string = '';

  constructor(
    private modalCtrl: ModalController,
    private gameService: GameService,
    private quizService: QuizService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    // récupérer la liste des quizzes
    this.quizzes$ = this.quizService.getAll();
  }

  selectQuiz(quizId: string) {
    this.selectedQuizId = quizId;
  }

  async createRoom() {
    this.error = '';

    if (!this.selectedQuizId) {
      this.error = 'Veuillez sélectionner un quiz';
      return;
    }

    // récupérer le quiz complet
    const quiz = await this.quizService.getById(this.selectedQuizId).toPromise();
    if (!quiz) {
      this.error = 'Quiz introuvable';
      return;
    }

    // créer la room
    const roomId = await this.gameService.createRoom(quiz);

    // fermer la modal
    await this.modalCtrl.dismiss();

    // redirection vers la game-room (MJ peut observer la room)
    this.navCtrl.navigateForward(`/admin-game-room/${roomId}`);  }

  close() {
    this.modalCtrl.dismiss();
  }
}