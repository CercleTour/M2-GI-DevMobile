import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Room } from '../models/room';
import { GameService } from '../services/game-service';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.page.html',
})
export class GameRoomPage implements OnInit {

  roomId!: string;
  username!: string;
  lastEventTimestamp: number = 0;

  game_status: string = 'waiting';
  total_players: number = 0;

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

      switch(room.currentEvent.data.type) {
        case 'waiting':
          // TODO : afficher un message d'attente
          break;
        case 'player_joined':
          // TODO : afficher un compteur de joueurs en temps réel
          break;
        case 'question_send':
          // TODO : afficher la question
          break;
        case 'show_answer':
          // TODO : faire en sorte que le MJ envoit l'event  
          // TODO : afficher la bonne réponse et les réponses des joueurs
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
}