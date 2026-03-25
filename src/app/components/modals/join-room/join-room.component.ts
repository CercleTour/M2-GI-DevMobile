import { Component } from '@angular/core';
import { ModalController, IonHeader, IonToolbar, IonContent, NavController, IonButton, IonInput, IonLabel, IonItem, IonButtons, IonTitle} from '@ionic/angular/standalone';
import { GameService } from 'src/app/services/game-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
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

  username: string = '';
  roomId: string = '';
  error: string = '';

  constructor(
    private modalCtrl: ModalController,
    private gameService: GameService,
    private navCtrl: NavController
  ) {}

  async join() {
    this.error = '';

    if (!this.username || !this.roomId) {
      this.error = 'Tous les champs sont requis';
      return;
    }

    const result = await this.gameService.joinRoom(this.roomId, this.username);

    if (!result.success) {
      this.error = result.message || 'Erreur';
      return;
    }

    // fermer la modal
    await this.modalCtrl.dismiss();

    // ✅ redirection correcte
    this.navCtrl.navigateForward(`/game-room/${this.roomId}?username=${this.username}`);
  }

  close() {
    this.modalCtrl.dismiss();
  }
}