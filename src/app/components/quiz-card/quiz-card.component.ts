import { Component, Input, OnInit } from '@angular/core';
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
export class QuizCardComponent  implements OnInit {
  
  @Input() quiz!: Quiz;
  
  constructor() { }
  
  ngOnInit() {}
  
}
