export interface GameQuestion {
    index: number;
    text: string;
    choices: {
        id: string;
        text: string;
        responseCount: number;
    }[];
}