export interface Question {
    id: string;
    text: string;
    choices: Array<{
        id: string;
        text: string;
    }>;
    correctChoiceId: string;
}
