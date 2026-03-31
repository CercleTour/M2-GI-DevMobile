import { Question } from "./question";

export interface Quiz {
    id: string;
    title: string;
    questions: Question[];
    description: string;
    authorId: string;
    isPublic: boolean; 
}
