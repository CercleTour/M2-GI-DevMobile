import { Component } from '@angular/core';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonContent,
  NavController,
  IonButton,
  IonInput,
  IonLabel,
  IonItem,
  IonButtons,
  IonTitle, 
} from '@ionic/angular/standalone';

import { GameService } from 'src/app/services/game-service';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-join-room',
  standalone: true,
  templateUrl: './join-room.component.html',
  styleUrl: './join-room.component.scss',
  imports: [
    IonHeader,
    IonLabel,
    IonInput,
    IonItem,
    IonButton,
    IonButtons,
    IonContent,
    IonTitle,
    IonToolbar,
    FormsModule
  ]
})
export class JoinRoomComponent {

  roomId: string = '';
  error: string = '';

  userId = '';

  constructor(
    private modalCtrl: ModalController,
    private gameService: GameService,
    private navCtrl: NavController,
    private auth: Auth
  ) {}

  async ngOnInit() {
    const currentUser = await firstValueFrom(user(this.auth));

    if (!currentUser) {
      this.error = 'Utilisateur non connecté';
      return;
    }

    this.userId = currentUser.uid;
    const roomId = await this.gameService.getRoomByPlayer(this.userId);
    if(roomId) {
      await this.modalCtrl.dismiss();
      this.navCtrl.navigateForward(`/game-room/${roomId}`);
    }
  }

  async join() {
    this.error = '';

    if (!this.roomId) {
      this.error = 'Room ID requis';
      return;
    }

    // 🔹 Join room with userId
    const result = await this.gameService.joinRoom(this.roomId, this.userId);

    if (!result.success) {
      this.error = result.message || 'Erreur';
      return;
    }

    // 🔹 Close modal
    await this.modalCtrl.dismiss();

    // 🔹 Navigate (no username needed anymore)
    this.navCtrl.navigateForward(`/game-room/${this.roomId}`);
  }

  close() {
    this.modalCtrl.dismiss();
  }
}