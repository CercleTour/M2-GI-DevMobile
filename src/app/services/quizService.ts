import { Injectable } from '@angular/core';
import { Question } from '../models/question';
import { Quiz } from '../models/quiz';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  
  private quizzes: Quiz[] = [
    {
      id: "000",
      title: "Quiz 0",
      questions: [],
      description: "1st quiz, with id 000"
    }
  ];
  
  getAll(): Promise<Quiz[]> {
    return Promise.resolve(this.quizzes);
  }
  
  get(quizId: string): Promise<Quiz | undefined> {
    return Promise.resolve(
      this.quizzes.find(q => q.id === quizId)
    );
  }
  
  addQuiz(quiz: Quiz): Promise<Quiz> {
    this.quizzes = [...this.quizzes, quiz];
    return Promise.resolve(quiz);
  }
  
  deleteQuiz(quizId: string): Promise<void> {
    this.quizzes = this.quizzes.filter(q => q.id !== quizId);
    return Promise.resolve();
  }
  
  updateQuiz(updatedQuiz: Quiz): Promise<Quiz> {
    this.quizzes = this.quizzes.map(q => 
      q.id === updatedQuiz.id ? updatedQuiz : q
    );
    return Promise.resolve(updatedQuiz);
  }
  
}
