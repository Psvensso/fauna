export type WeightHash = { [questionId: string]: number };
export type TargetWeight = { id: string; weights: WeightHash };
export type TargetWeightHash = { [targetObjectKey: string]: TargetWeight };
export type Weight = [string, number];
export type Opinion = [string, AnswerValue];
export type AnswerValue = -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4;
export type QuestionRank = [string, number];

/**
 * 
 */

export class NeuralNetwork {
  public weightsHash: TargetWeightHash;
  constructor(weightsHash: TargetWeight[]) {
    this.weightsHash = {};
    for (let i = 0; i < weightsHash.length; i++) {
      this.addTargetObject(weightsHash[i]);
    }
  }

  public addTargetObject(targetWeight: TargetWeight) {
    this.weightsHash[targetWeight.id] = targetWeight;
  }

  /**
   * Adds weight to the answers for that object
   * @param correctTargetObjectId
   * @param answers
   */
  public train(correctTargetObjectId: string, answers: Opinion[]) {
    const tO = this.weightsHash[correctTargetObjectId];
    for (let i = 0; i < answers.length; i++) {
      const a = answers[i];
      tO.weights[a[0]] = tO.weights[a[0]] || 0;
      tO.weights[a[0]] += a[1];
    }
  }

  /**
   * Given a set of answers it guesses/ranks the target objects
   */
  public guessTargetObjects(answers: Opinion[]): Weight[] {
    const guesses: Weight[] = [];
    const targetObjectKeys = Object.keys(this.weightsHash);
    for (let i = 0; i < targetObjectKeys.length; i++) {
      const distanceSum = distance(answers, this.weightsHash[targetObjectKeys[i]]);
      guesses.push([targetObjectKeys[i], distanceSum]);
    }
    return guesses;
  }

  /**
   * Given a set of TargetObjects it provides the next answers that
   * divides the set as close to 50% as possible.
   * And i dont want to be asked the same question twice.
   */
  public provideNextQuestion(_qIds: string[], weightsHash: TargetWeight[]): QuestionRank[] {
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

export function distance(answers: Opinion[], _t: TargetWeight): number {
  if (answers.length < 1) {
    return 0;
  }

  let weightedSum = 0;
  for (let j = 0; j < answers.length; j++) {
    const questionId = answers[j][0];
    const answerValue = answers[j][1];
    const weight = _t.weights[questionId];
    const tempWeight = weight + answerValue;
    const answerSum = tempWeight * answerValue;
    weightedSum += answerSum;
  }

  const allAnswersSum = answers.reduce((acc, answ) => acc + answ[1], 0);
  if (allAnswersSum === 0) {
    return 0;
  }

  // The weights total can/should be cached (=more memory)?
  const allWeightsSum = Object
  .keys(_t.weights)
  .reduce((acc, key) => acc + _t.weights[key], 0);

  const max = allWeightsSum + allAnswersSum;

  if (weightedSum > max) {
    return max / weightedSum;
  }

  return weightedSum / max;
}
