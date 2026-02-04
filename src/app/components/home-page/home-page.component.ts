import { Component, OnInit } from '@angular/core';
import { Quiz } from 'src/app/models/quiz';
import { QuizService } from 'src/app/services/quizService';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonGrid, 
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { QuizCardComponent } from '../quiz-card/quiz-card.component';
/*

    

*/
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
    QuizCardComponent
  ],
})
export class HomePageComponent  implements OnInit {
  
  quizzes: Quiz[] = [];
  private itemsPerLine = 4;
  private lines: Array<number> = [];
  constructor(private quizService: QuizService) { }
  
  ngOnInit() {
    this.quizService.getAll().subscribe((quizzes) => {
      this.quizzes = quizzes;
    });
  }
}