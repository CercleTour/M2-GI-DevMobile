import { Injectable } from '@angular/core';
import { Firestore, doc, collection, setDoc, updateDoc, getDoc, docData, collectionData } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Quiz } from '../models/quiz';
import { Room } from '../models/room';
import { deleteDoc } from 'firebase/firestore';
import { Question } from '../models/question';
import { QuizService } from './quizService';

@Injectable({
  providedIn: 'root',
})

export class GameService {

  constructor(
    private firestore: Firestore,
    private quizService: QuizService
  ) { }

  private async getRoom(roomId: string): Promise<Room | null> {
    const roomRef = doc(this.firestore, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    return roomSnap.exists() ? (roomSnap.data() as Room) : null;
  }
  private async updateRoom(room: Partial<Room> & { roomId: string }): Promise<void> {
    const roomRef = doc(this.firestore, 'rooms', room.roomId);
    await updateDoc(roomRef, room);
  }
  private async deleteRoom(roomId: string): Promise<void> {
    const roomRef = doc(this.firestore, 'rooms', roomId);
    await deleteDoc(roomRef);
  }
  private async sendEvent(roomId: string, eventType: string, eventData: any) {
    const roomRef = doc(this.firestore, 'rooms', roomId);

    await updateDoc(roomRef, {
      currentEvent: {
        type: eventType,
        data: eventData,
        eventTimestamp: Date.now()
      }
    });
  }
  private async sendQuestionEvent(roomId: string, question: Question, questionIndex: number) {
    await this.sendEvent(roomId, 'question_send', {
      questionTitle: question.text,
      questionsChoices: {...question.choices, responseCount: -1},
      questionIndex
    }
  );
  }
  private async getQuizWithQuestions(quizId: string): Promise<Quiz | undefined> {
    return await this.quizService.getById(quizId).toPromise();
  }

  watchRoom(roomId: string): Observable<Room | null> {
    const roomRef = doc(this.firestore, 'rooms', roomId);
    return docData(roomRef).pipe(
      map(data => data as Room)
    );
  }

  /**
   * Create a new room for the given quiz, and return the room ID. The room is created with status "waiting".
   * 
   * @param quiz 
   * @returns 
   */
  async createRoom(quiz: Quiz) : Promise<string> {
    const newRoom: Room = {
      roomId: crypto.randomUUID(),
      currentQuestionIndex: 0,
      status: 'waiting',
      quizId: quiz.id,
      players: [],
      currentEvent: {
        eventTimestamp: Date.now(),
        data: {}
      }
    };
    const roomRef = doc(this.firestore, 'rooms', newRoom.roomId);
    await setDoc(roomRef, newRoom);
    return newRoom.roomId;
  }

  async closeRoom(roomId: string): Promise<void> {
    await this.deleteRoom(roomId);
  }

  /**
   * Add a player to the room if the username is not already taken, and if the room exists.
   * 
   * @param roomId 
   * @param playerName 
   * @returns 
   */
  async joinRoom(roomId: string, playerName: string): Promise<{ success: boolean; message?: string }> {
    const room : Room | null = await this.getRoom(roomId);
    if (!room) {
      return { success: false, message: 'Room not found' };
    }
    if (room.players.some(p => p.username === playerName)) {
      return { success: false, message: 'Username already taken' };
    }
    room.players.push({ username: playerName, answers: [] });
    await this.updateRoom({
      roomId,
      players: room.players
    });
    return { success: true };
  }

  /**
   * Start the game and get the first question of the quiz.
   * 
   * @param roomId 
   * @returns 
   */
  async startGame(roomId: string) {
    const room : Room | null = await this.getRoom(roomId);
    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    const quiz = await this.getQuizWithQuestions(room.quizId);
    if (!quiz) {
      return { success: false, message: 'Quiz not found' };
    }
    const question = quiz.questions[0];
    
    await this.updateRoom({
      roomId: room.roomId,
      status: 'question_send'
    });

    await this.sendQuestionEvent(roomId, question, 0);

    return { success: true};
  }

  async nextQuestion(roomId: string): Promise<{ success: boolean; message?: string }> {
    const room = await this.getRoom(roomId);
    if (!room) return { success: false, message: 'Room not found' };

    const quiz = await this.getQuizWithQuestions(room.quizId);
    if (!quiz) return { success: false, message: 'Quiz not found' };

    const nextIndex = room.currentQuestionIndex + 1;

    await this.updateRoom({
      roomId,
      currentQuestionIndex: nextIndex,
      status: 'question_send'
    });

    const question = quiz.questions[nextIndex];

    await this.sendQuestionEvent(roomId, question, nextIndex);
    return { success: true };
  }

  /**
   * Fetch all answers for the current question in the room, for all players registered in the room.
   * 
   * @param roomId 
   * @returns 
   */
  async getAnswers(roomId: string) {
    const room = await this.getRoom(roomId);
    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    const quiz = await this.getQuizWithQuestions(room.quizId);
    if (!quiz) {
      return { success: false, message: 'Quiz not found' };
    }

    const currentQuestionIndex = room.currentQuestionIndex;
    const question = quiz.questions[currentQuestionIndex];

    const answers = room.players.map(p => ({
      username: p.username,
      answer: p.answers[currentQuestionIndex] ?? null
    }));

    const counts: Record<string, number> = {};

    question.choices.forEach(choice => { counts[choice.id] = 0; });
    counts['0'] = 0;

    answers.forEach(a => {
      counts[a.answer??'0']++;
    });

    await this.sendEvent(roomId, 'show_answer', {
      question_count: counts, // Record<string, number> with 0 for unanswered
      correct_answer: question.correctChoiceId
    });

    return { success: true, answers };
  }

  /**
   * Player submits an answer for the current question in the room.
   * Many checks are done to ensure the validity of the answer submission
   *  
   * @param roomId 
   * @param playerName 
   * @param answer 
   * @param questionIndex 
   * @returns 
   */
  async submitAnswer(roomId: string, playerName: string, answer: string, questionIndex: number): Promise<{ success: boolean; message?: string }> {
    const room : Room | null = await this.getRoom(roomId);
    if (!room) {
      return { success: false, message: 'Room not found' };
    }
    const player = room.players.find(p => p.username === playerName);
    if (!player) {
      return { success: false, message: 'Player not found in room' };
    }
    if(room.status !== 'question_send') {
      return { success: false, message: 'You can\'t submit an answer at this time' };
    }
    if(room.currentQuestionIndex !== questionIndex) {
      return { success: false, message: 'Invalid question index' };
    }
    player.answers[questionIndex] = answer;
    await this.updateRoom(room);
    return { success: true };
  }
}
