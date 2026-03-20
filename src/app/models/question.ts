export interface Question {
    id: string;
    text: string;
    choices: {
        id: string;
        text: string;
    }[];
    correctChoiceId: string;
}
