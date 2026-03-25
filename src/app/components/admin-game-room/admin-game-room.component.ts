import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { GameService } from 'src/app/services/game-service';
import { Room } from 'src/app/models/room';
import { Observable } from 'rxjs';
import { AsyncPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-admin-game-room',
  templateUrl: './admin-game-room.component.html',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    AsyncPipe,
    NgClass
  ]
})
export class AdminGameRoomComponent implements OnInit {

  roomId!: string;
  room$!: Observable<Room | null>;
  game_status: string = 'waiting';
  question: any = { questionTitle: '', questionsChoices: [], questionIndex: -1 };
  correctAnswerId: string | null = null;
  counts: Record<string, number> = {};
  lastEventTimestamp: number = 0;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService
  ) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id')!;

    this.room$ = this.gameService.watchRoom(this.roomId);

    this.room$.subscribe(room => {
      if (!room) return;

      if (room.currentEvent.eventTimestamp === this.lastEventTimestamp) return;
      this.lastEventTimestamp = room.currentEvent.eventTimestamp;

      this.game_status = room.currentEvent.data.type;

      if(this.game_status === 'question_send') {
        this.question = room.currentEvent.data;
        this.correctAnswerId = null;
      } else if(this.game_status === 'show_answer') {
        this.counts = room.currentEvent.data.question_count;
        this.correctAnswerId = room.currentEvent.data.correct_answer;
      }
    });
  }

  async startGame() {
    await this.gameService.startGame(this.roomId);
  }

  async showResults() {
    await this.gameService.getAnswers(this.roomId);
  }

  async nextQuestion() {
    await this.gameService.nextQuestion(this.roomId);
  }
}