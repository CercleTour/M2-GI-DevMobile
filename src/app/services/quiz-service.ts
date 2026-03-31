    import { inject, Injectable } from '@angular/core';
    import { combineLatest, from, Observable, of, switchMap, tap } from 'rxjs';
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
      getDoc,
      setDoc,
      query,
      where,
    } from '@angular/fire/firestore';

    @Injectable({
      providedIn: 'root',
    })
    export class QuizService {

      private firestore: Firestore = inject(Firestore);

      private quizzes: Quiz[] = [];

      getAll(): Observable<Quiz[]> {
        const quizzesCollection = collection(this.firestore, 'quizzes');

        return collectionData(quizzesCollection, { idField: 'id' }).pipe(
          switchMap(async (quizzes: any[]) => {

            const result = await Promise.all(
              quizzes.map(async quiz => {
                const questions = await this.loadQuestions(quiz.questions);       
                return {
                  ...quiz,
                  questions
                };
              })
            );

            return result;
          })
        );
      }

      getById(quizId: string): Observable<Quiz | undefined> {
        const quizRef = doc(this.firestore, `quizzes/${quizId}`);

        return docData(quizRef, { idField: 'id' }).pipe(
          switchMap(async (quiz: any) => {
            if (!quiz) return undefined;

            const questions = await this.loadQuestions(quiz.questions);
            return {
              ...quiz,
              questions
            };
          })
        );
      }
      
      getByUserId(userId: string): Observable<Quiz[]> {
        const quizzesCollection = collection(this.firestore, 'quizzes');

        const q = query(quizzesCollection, where('authorId', '==', userId));

        return collectionData(q, { idField: 'id' }).pipe(
          switchMap(async (quizzes: any[]) => {
            return Promise.all(
              quizzes.map(async quiz => ({
                ...quiz,
                questions: await this.loadQuestions(quiz.questions)
              }))
            );
          })
        );
      }

      getPublic(): Observable<Quiz[]> {
        const quizzesCollection = collection(this.firestore, 'quizzes');

        const q = query(quizzesCollection, where('isPublic', '==', true));

        return collectionData(q, { idField: 'id' }).pipe(
          switchMap(async (quizzes: any[]) => {
            return Promise.all(
              quizzes.map(async quiz => ({
                ...quiz,
                questions: await this.loadQuestions(quiz.questions)
              }))
            );
          })
        );
      }

      getOthersPublic(userId: string): Observable<Quiz[]> {
        const quizzesCollection = collection(this.firestore, 'quizzes');

        const q = query(quizzesCollection, where('isPublic', '==', true));

        return collectionData(q, { idField: 'id' }).pipe(
          switchMap(async (quizzes: any[]) => {

            console.log('🌍 All public quizzes:', quizzes);

            // 🔥 filter out current user's quizzes
            const others = quizzes.filter(q => q.authorId !== userId);

            console.log('👥 Public quizzes from others:', others);

            return Promise.all(
              others.map(async quiz => ({
                ...quiz,
                questions: await this.loadQuestions(quiz.questions)
              }))
            );
          })
        );
      }

      async loadQuestions(questionRefs: any[]) {
        const questions = await Promise.all(
          questionRefs.map(ref => getDoc(ref))
        );

        return questions.map(q => ({
          id: q.id,
          ...(q.data() as any)
        }));
      }

    async deleteQuiz(quizId: string): Promise<void> {
      const quizRef = doc(this.firestore, `quizzes/${quizId}`);

      // 1. Get quiz data
      const quizSnap = await getDoc(quizRef);

      if (!quizSnap.exists()) {
        console.warn('Quiz not found');
        return;
      }

      const quizData = quizSnap.data();

      // 2. Extract question refs
      const questionRefs = quizData['questions'] || [];

      // 3. Delete all questions
      await Promise.all(
        questionRefs.map((ref: any) => deleteDoc(ref))
      );

      // 4. Delete quiz
      await deleteDoc(quizRef);
    }

    async saveQuiz(quiz: Quiz): Promise<void> {
      const quizRef = doc(this.firestore, 'quizzes', quiz.id);

      const questionsCollection = collection(this.firestore, 'questions');

      const questionRefs = await Promise.all(
        quiz.questions.map(async (q, index) => {
          const questionRef = doc(questionsCollection, q.id);
          await setDoc(questionRef, {
            text: q.text,
            choices: q.choices,
            correctChoiceId: q.correctChoiceId,
          });

          return questionRef;
        })
      );

      await setDoc(quizRef, {
        title: quiz.title,
        description: quiz.description,
        questions: questionRefs,
        authorId: quiz.authorId,
        isPublic: quiz.isPublic
      });
    }

    async toggleVisibility(quizId: string, isPublic: boolean): Promise<void> {
      const quizRef = doc(this.firestore, `quizzes/${quizId}`);

      await updateDoc(quizRef, {
        isPublic
      });
    }
  }