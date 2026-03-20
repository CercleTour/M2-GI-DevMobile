import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Room } from '../../models/room';
import { GameService } from '../../services/game-service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonFab, IonFabButton, IonIcon, ModalController } from '@ionic/angular/standalone';
import { AsyncPipe, NgIf, NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss'],
  imports: [
    IonContent,
    AsyncPipe,
    NgClass
  ]
})
export class GameRoomPage implements OnInit {

  roomId!: string;
  username!: string;
  lastEventTimestamp: number = 0;

  game_status: string = 'waiting';
  question: {
    questionTitle: string;
    questionsChoices: {text: string, id: string, responseCount: number}[];
    questionIndex: number;
  } = {
    questionTitle:'', 
    questionsChoices: [], 
    questionIndex: -1
  };
  selectedAnswerId: string | null = null;
  correctAnswerId: string | null = null;

  room$!: Observable<Room | null>;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService
  ) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id')!;
    this.username = this.route.snapshot.queryParamMap.get('username')!;

    this.room$ = this.gameService.watchRoom(this.roomId);

    // écoute des changements
    this.room$.subscribe(room => {
      if (!room) return;

      if(room.currentEvent.eventTimestamp === this.lastEventTimestamp) return; // pas de nouvel événement
      this.lastEventTimestamp = room.currentEvent.eventTimestamp;

      console.log('New event received:', room.currentEvent);

      this.game_status = room.currentEvent.data.type;

      switch(room.currentEvent.data.type) {
        case 'waiting':
          // TODO : afficher un message d'attente
          break;
        case 'question_send':
          this.question = room.currentEvent.data;
          break;
        case 'show_answer':
          /*
          Code coté GameService :
          await this.sendEvent(roomId, 'show_answer', {
            question_count: counts, // Record<string, number> with 0 for unanswered
            correct_answer: question.correctChoiceId
          });
          */
          this.correctAnswerId = room.currentEvent.data.correct_answer;
          
          this.question?.questionsChoices.forEach(choice => {
            choice.responseCount = room.currentEvent.data.question_count[choice.id] ?? 0;
          });
          break;
        case 'show_score':
          // TODO : faire en sorte que le MJ envoit l'event  
          // TODO : afficher les scores
          break;
        case 'closed':
          // TODO : faire en sorte que le MJ envoit l'event  
          // TODO : afficher un message de fin de partie
          break;
        default:
          console.log('Unknown event type:', room.currentEvent.data.type);
          break;
      }
    });
  }
  selectAnswer(choiceId: string) {
    if (this.game_status !== 'question_send') return;

    this.selectedAnswerId = choiceId;

    this.gameService.submitAnswer(
      this.roomId,
      this.username,
      choiceId,
      this.question!.questionIndex
    );
  }
}