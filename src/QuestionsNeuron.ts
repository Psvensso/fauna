export type QuestionId = string | number;
export type Target = { id: string; weights: { [questionId: string]: number } };
export type TargetsHash = { [targetObjectKey: string]: Target };
export type Weight = [QuestionId, number];
export type Answer = [QuestionId, AnswerValue];
export type AnswerValue = -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4;
export type QuestionRank = [string, number];

export class QuestionsNeuron {

    public targetsHash: TargetsHash;

    constructor(weightsHash: Target[]) {
        this.targetsHash = {};
        weightsHash.forEach((t) => { this.targetsHash[t.id] = t; });
    }

    /**
     * Adds the answers/opinion to the internal model
     * ToDo: Should this be done with a easing function? It cant be linear
     * @param targetId
     * @param opinions
     */
    public addWeightsToTarget(targetId: string, opinions: Answer[]) {
        const tO = this.targetsHash[targetId];
        for (let i = 0; i < opinions.length; i++) {
            const a = opinions[i];
            tO.weights[a[0]] = tO.weights[a[0]] || 0;
            tO.weights[a[0]] += a[1];
        }
    }

    /**
     * Given a set of answers it guesses/ranks the target objects
     */
    public guessTargetObjects(answers: Answer[]): Weight[] {
        const guesses: Weight[] = [];
        const targetObjectKeys = Object.keys(this.targetsHash);
        for (let i = 0; i < targetObjectKeys.length; i++) {
            const { score } = ScoreTarget(answers, this.targetsHash[targetObjectKeys[i]]);
            guesses.push([targetObjectKeys[i], score]);
        }
        return guesses;
    }

    /**
     * Given a set of TargetObjects it provides the next answers that
     * divides the set as close to 50% as possible.
     * And i dont want to be asked the same question twice.
     */
    public provideNextQuestion(_qIds: string[], weightsHash: Target[]): QuestionRank[] {
        const allQuestions: { [questionId: string]: string } = {};

        for (let i = 0; i < weightsHash.length; i++) {
            const qKeys = Object.keys(weightsHash[i].weights);
            for (let j = 0; j < qKeys.length; j++) {
                allQuestions[qKeys[i]] = qKeys[i];
            }
        }

        const margins: { [questionId: string]: number } = {};
        const qArr = Object.keys(allQuestions);
        for (let k = 0; k < qArr.length; k++) {
            for (let l = 0; l < weightsHash.length; l++) {
                const targetObject = weightsHash[l];
                const id = targetObject.id;
                const adjustmentMargin = targetObject.weights[k] > 0 ? 1 : -1;
                margins[id] = (margins[id] || 0) + adjustmentMargin;
            }
        }

        return Object.keys(margins)
            .map(questionId => {
                const y: QuestionRank = [questionId, margins[questionId]];
                return y;
            })
            .sort((a, b) => {
                return a[1] - b[1];
            });
    }
}

/**
 * Function to calculate the score of a target given a set of answers.
 * Based on a set of answers, give a score to the target.
 * This should all use matrices and math.js but to prove the point we do it manually for now.
 * @param prevAnswers
 * @param target
 */
export function ScoreTarget(prevAnswers: Answer[], target: Target): { score: number, debugObj?: any} {
    if (prevAnswers.length < 1) {
        return { score: 0};
    }

    /// We need to get the sum of all previous answers, we need this later
    /// but we check it here so we can return 0 if we dont have any "meaningfull" previous answers.
    const allAnswersSum = prevAnswers.reduce((acc, answ) => acc + answ[1], 0);
    if (allAnswersSum === 0) {
        return { score: 0 };
    }

    let weightedSum = 0;
    for (let j = 0; j < prevAnswers.length; j++) {
        const questionId = prevAnswers[j][0];
        const answerValue = prevAnswers[j][1];
        const concensusWeight = target.weights[questionId];
        const tempWeight = concensusWeight + answerValue;

        /// ToDo WARNING! This needs some thought. Is it enough no multiply the opinion vs
        /// the concensus weight?
        const answerSum = tempWeight * answerValue;
        weightedSum += answerSum;
    }

    /// The total weight of the target object.
    /// ToDo: give this a thought, can it be cached?
    const totalWeightOfTheTarget = Object.keys(target.weights).reduce((acc, key) => acc + target.weights[key], 0);

    ///The maximum score
    ///ToDo: Give this some thought, is this really the max?
    const max = totalWeightOfTheTarget + allAnswersSum;

    let debugObj = {
        max, 
        totalWeightOfTheTarget,
        weightedSum,
        allAnswersSum
    };

    if (weightedSum > max) {
        return { score: max / weightedSum, debugObj };
    }

    return { score: weightedSum / max, debugObj };
}
