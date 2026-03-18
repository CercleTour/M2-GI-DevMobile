import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Quiz } from 'src/app/models/quiz';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-quiz-card',
  templateUrl: './quiz-card.component.html',
  styleUrls: ['./quiz-card.component.scss'],
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent 
  ]
})
export class QuizCardComponent {
  
  @Input() quiz!: Quiz;
  

  @Output() quizClick = new EventEmitter<Quiz>();

  onClick() {
    this.quizClick.emit(this.quiz);
  }
}
