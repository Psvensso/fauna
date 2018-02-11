import { Answer } from "../domain/answer";
import { Question } from "../domain/question";
import { Target } from "../domain/target";
const { keys } = Object;
type Weight = number;

interface MapLike<T> {
    [key: string]: T;
}
type WeightHash = MapLike<Weight>;

export function MergeRow(row: WeightHash = {}, bRow: WeightHash) {
    for (const k of keys(bRow)) {
        if (typeof row[k] !== "number") {
            row[k] = bRow[k];
            continue;
        }
        row[k] = row[k] + bRow[k];
    }
    return row;
}

export type ComputeArgs = {
    questions: MapLike<Question>;
    targets: MapLike<Target>;
    answers: MapLike<Answer>;
};

export const computeMatrix = (matrix: MapLike<MapLike<number>>, { questions, answers, targets }: ComputeArgs) => {
    for (const k of keys(answers)) {
        const { id, target_id, qa } = answers[k];
        // Init
        matrix[target_id] = MergeRow(matrix[target_id], qa);
    }
    return matrix;
};
