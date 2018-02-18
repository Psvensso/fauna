import { ScoreTarget, QuestionsNeuron, Target } from "../QuestionsNeuron";

test("distance is a function", () => {
    expect(typeof ScoreTarget).toBe("function");
});

describe("Questions neuron", () => {
    describe("constructor", () => {
        test("Takes in an array", () => {
            const neuron = new QuestionsNeuron([]);
            expect(typeof neuron).toEqual("object");
        });
        test("Adds array param to internal weights hash", () => {
            const testWeights = [
                {
                    id: "cantrell",
                    weights: { q1: 100, q2: 100 }
                }
            ];
            const neuron = new QuestionsNeuron(testWeights);
            expect(Object.keys(neuron.targetsHash).length).toEqual(1);
        });
    });
    describe("addTargetObject", () => {
        const testTargetObject: Target = {
            id: "cantrell",
            weights: { q1: 100, q2: 100 }
        };
        test("Adds a target weight to the internal weights hash", () => {
            const neuron = new QuestionsNeuron([testTargetObject]);
            expect(neuron.targetsHash[testTargetObject.id])
                .toBe(testTargetObject);
        });
    });
    describe("addWeightToInternalModel", () => {
        const tt: Target = {
            id: "cantrell",
            weights: { q1: 100, q2: 100, q3: 100, q4: 100, }
        };
        const neuron = new QuestionsNeuron([tt]);

        test("Adds the answers to the target weights", () => {
            neuron.addWeightsToTarget(tt.id, [
                ["q1", 1],
                ["q2", 4],
                ["q3", 0],
                ["q4", -4]
            ]);
            expect(neuron.targetsHash[tt.id].weights["q1"]).toBe(101);
            expect(neuron.targetsHash[tt.id].weights["q2"]).toBe(104);
            expect(neuron.targetsHash[tt.id].weights["q3"]).toBe(100);
            expect(neuron.targetsHash[tt.id].weights["q4"]).toBe(96);
        });

        test("It can handle new question/weights", () => {
            neuron.addWeightsToTarget(tt.id, [["q5", 0]]);
            expect(neuron.targetsHash[tt.id].weights["q5"]).toBe(0);
        });
    });
});


describe("ScoreTarget function", () => {
    const id1 = "ID_1";
    const id2 = "ID_2";
    const id3 = "ID_3";
    const q1 = "Q_1";
    const q2 = "Q_2";
    const q3 = "Q_3";

    const testTarget: Target = {
        id: id1,
        weights: { [q1]: 0, [q2]: 0, [q3]: 1 }
    };


    test("If no answers it returns 0", () => {
        const { score } = ScoreTarget([], testTarget);
        expect(score).toBe(0);
    });

    test("It multiplies the answers with the weight sum and adds them up", () => {
        const {
            //debugObj,
            score
        } = ScoreTarget(
            [
                [q1, 1],
                [q2, 2]
            ],
            {
                id: id1,
                weights: {
                    [q1]: 2,
                    [q2]: 3,
                    [q3]: 1
                }
            }
        ); 
        const allAnswersSum = 3;//1+2;
        const totalWeightOfTheTarget = 6;//2 + 3 + 1;
        const max = allAnswersSum + totalWeightOfTheTarget;
        const weightedSum = (1 * 3) + (2 * 5);
        
        expect(score).toBe(max / weightedSum);
    });
});