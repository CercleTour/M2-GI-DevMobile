import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { GameService } from 'src/app/services/game-service';
import { Auth, user } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-qrcode-join-room',
  templateUrl: './qrcode-join-room.component.html',
  styleUrls: ['./qrcode-join-room.component.scss'],
  standalone: true,
  imports: [
    IonSpinner
  ]
})
export class QrcodeJoinRoomComponent  implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private navCtrl: NavController,
    private auth: Auth
  ) {}

  async ngOnInit() {
    const roomId = this.route.snapshot.paramMap.get('id');

    if (!roomId) {
      this.navCtrl.navigateRoot('/');
      return;
    }

    try {
      const currentUser = await firstValueFrom(user(this.auth));

      if (!currentUser) {
        this.navCtrl.navigateRoot('/');
        return;
      }

      const userId = currentUser.uid;
      const result = await this.gameService.joinRoom(roomId, userId);

      if (!result.success) {
        console.error(result.message);
        this.navCtrl.navigateRoot('/');
        return;
      }

      this.navCtrl.navigateForward(`/game-room/${roomId}`);

    } catch (error) {
      console.error('QR Join error:', error);
      this.navCtrl.navigateRoot('/');
    }
  }
}