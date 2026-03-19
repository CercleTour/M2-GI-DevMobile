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

  game_status: string = 'waiting';

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

      if (room.status === 'waiting') {
      } else if (room.status === 'question_send') {
      } else if (room.status === 'show_answer') {
      } else if (room.status === 'show_score') {
      } else if (room.status === 'closed') {
      } else {}
    });
  }
}