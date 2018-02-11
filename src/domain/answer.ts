export enum Value{
    True = 4,
    KindaTrue = 2,
    Neutral = 0,
    KindaFalse = -2,
    False = -4
}

export const answer_values = {
    True: {value: Value.True, text: "True"},
    KindaTrue: {value: Value.KindaTrue, text: "Kinda true"},
    Neutral: {value: Value.Neutral, text: "Not relevant"},
    KindaFalse: {value: Value.KindaFalse, text: "Kinda false"},
    False: {value: Value.False, text: "False"}
};

export interface Answer{
    qa: {[questionId: string]: Value};
    target_id: string;
    created_by: string;
    id?: string;
}




