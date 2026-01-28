import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonCheckbox
} from '@ionic/angular/standalone';

import {
  form,
  FormField,
  minLength,
  required
} from '@angular/forms/signals';

@Component({
  selector: 'app-signal-form',
  standalone: true,
  templateUrl: './signal-form.component.html',
  styleUrls: ['./signal-form.component.scss'],
  imports: [
    CommonModule,

    // Ionic
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonCheckbox,

    // Forms signals
    FormField
  ],
})
export class SignalFormComponent {
  
  quizModel = signal/*<Quiz>*/({
    title: '',
    questions: [{
      id: crypto.randomUUID(),
      text: '1+1=2 ?', 
      options: [
        {id: crypto.randomUUID(), text: "vrais", isCorrect: true}, 
        {id: crypto.randomUUID(), text: "faux", isCorrect: false}
      ]}, 
      {
        id: crypto.randomUUID(),
        text: '11*12=122 ?',
        options: [
          {id: crypto.randomUUID(), text: "vrais", isCorrect: false}, 
          {id: crypto.randomUUID(), text: "faux", isCorrect: true}
        ]
      },
      ],
    description: ''
  });
  quizForm = form(this.quizModel, (quiz) => {
    required(quiz.title, { message: 'Title is required'})
    minLength(quiz.questions, 1, { message: 'At least one question is required'})
    
  });
  
  // Ajouter les forms des questions + delete d'un question form + add questoin form
  addQuestion() {/*
    console.log('Adding question');
    console.log(this.quizModel().questions);
    this.quizModel().set
    this.quizModel().questions = [...this.quizModel().questions, {text: 'New Question'}];
    console.log(this.quizModel().questions);
    */
    this.quizModel.update(quiz => ({
      ...quiz,
      questions: [
        ...quiz.questions,
        { 
          id: crypto.randomUUID(),
          text: 'New Question',  
          options: [
            {id: crypto.randomUUID(), text: "Option 1", isCorrect: false}, 
            {id: crypto.randomUUID(), text: "Option 2", isCorrect: false}
          ]
        }
      ]
    }));
  }
  
  constructor() { }
  
  onSubmit(event: Event) {
    event.preventDefault();
    
    const quizResult = this.quizModel()
    console.log('Quiz Submitted:', quizResult);
  }
  
}
