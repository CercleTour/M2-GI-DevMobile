import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Question } from '../models/question';
import { Quiz } from '../models/quiz';

@Injectable({
  providedIn: 'root',
})
export class QuizService {

  private quizzes: Quiz[] = [
    {
      id: '000',
      title: 'Quiz 0',
      questions: [],
      description: '1st quiz, with id 000'
    }
  ];

  getAll(): Observable<Quiz[]> {
    return of(this.quizzes);
  }

  get(quizId: string): Observable<Quiz | undefined> {
    return of(this.quizzes.find(q => q.id === quizId));
  }

  addQuiz(quiz: Quiz): Observable<Quiz> {
    this.quizzes = [...this.quizzes, quiz];
    return of(quiz);
  }

  deleteQuiz(quizId: string): Observable<void> {
    this.quizzes = this.quizzes.filter(q => q.id !== quizId);
    return of(void 0);
  }

  updateQuiz(updatedQuiz: Quiz): Observable<Quiz> {
    this.quizzes = this.quizzes.map(q =>
      q.id === updatedQuiz.id ? updatedQuiz : q
    );
    return of(updatedQuiz);
  }
}