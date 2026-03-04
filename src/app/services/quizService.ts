import { inject, Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { Quiz } from '../models/quiz';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  deleteDoc,
  updateDoc,
  getDoc
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class QuizService {

  private firestore: Firestore = inject(Firestore);

  private quizzes: Quiz[] = [
    {
      id: '000',
      title: 'Quiz 0',
      questions: [],
      description: '1st quiz, with id 000'
    }
  ];

  getAll(): Observable<Quiz[]> {
    const quizzesCollection = collection(this.firestore, 'quizzes');
    return collectionData(quizzesCollection, { idField: 'id' }) as Observable<Quiz[]>;
  }

  getById(quizId: string): Observable<Quiz | undefined> {
    const quizRef = doc(this.firestore, `quizzes/${quizId}`);
    return docData(quizRef, { idField: 'id' }) as Observable<Quiz | undefined>;
  }
  
  async loadQuestions(questionRefs: any[]) {
    const questions = await Promise.all(
      questionRefs.map(ref => getDoc(ref))
    );

    return questions.map(q => q.data());
  }
  addQuiz(quiz: Quiz): Observable<Quiz> {
    const quizzesCollection = collection(this.firestore, 'quizzes');

    return from(
      addDoc(quizzesCollection, {
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions
      }).then(() => quiz)
    );
  }

  deleteQuiz(quizId: string): Promise<void> {
    const quizRef = doc(this.firestore, `quizzes/${quizId}`);
    return deleteDoc(quizRef);
  }

  updateQuiz(updatedQuiz: Quiz): Observable<Quiz> {
    const quizRef = doc(this.firestore, 'quizzes', updatedQuiz.id);

    const questionRefs = updatedQuiz.questions.map(q =>
      doc(this.firestore, 'questions', q.id)
    );

    return from(
      updateDoc(quizRef, {
        title: updatedQuiz.title,
        description: updatedQuiz.description,
        questions: questionRefs
      }).then(() => updatedQuiz)
    );
  }
}