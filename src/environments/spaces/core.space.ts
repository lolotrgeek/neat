import { BodyId } from "../../body/Body";
import { robustNormalize } from "../../utils/robustNormalize";



interface Actionable {
    action: (...args: any[]) => void;
    /** the minimum should be 1, even if there are no  */
    argCount: number;
}

interface CoreIndividual {
    id: string;
    energy: number;
    position: [number, number];
}

interface CoreObservables {
}

/**
 * Core Space is the base line space that contains the minimum actionables and observables for any space in the environment.
 */
export class Space {
    public actionables: Actionable[] = []
    public observables: CoreObservables = []

    /** NOTE: these must be set from the environment to the max and min of activation ranges across all individuals. */
    public outputMin: number = -1;
    public outputMax: number = 1;

    public transactionMin: number = 0;
    public transactionMax: number = 100;

    // TODO: actionables and observables are methods that return the actionables and observables for the space

    constructor() {
        this.actionables = [
            { action: this.transact, argCount: 2 },
            { action: this.mate, argCount: 1 },
            { action: this.move, argCount: 2 }
        ];
    }

    /**
     * Transacts energy from one individual to another.
     * @param to - The raw output value from the neuron for selecting an individual.
     * @param amountIn - The raw output value indicating the amountIn in the transaction.
     */
    public transact(individuals: string[], to: number, amountIn: number) {
        // Normalize the outputs robustly.
        const normalizedTo = robustNormalize(to, this.outputMin, this.outputMax);
        const normalizedAmountIn = robustNormalize(amountIn, this.outputMin, this.outputMax);

        // Map the normalized 'to' value to an index in the individuals array.
        const index = Math.min(
            individuals.length - 1,
            Math.max(0, Math.floor(normalizedTo * individuals.length))
        );

        // Map the normalized amountIn to the transaction range.
        const amountOut = normalizedAmountIn * (this.transactionMax - this.transactionMin) + this.transactionMin;
        const individualId = individuals[index];

        console.log(`Transacting ${amountOut} to individual ${individualId}`);
        // TODO: invoke SOLkit send here, perform the transaction, on success, update the individual's energy.

        return {amountOut, individualId};
    }

    public mate(input: number) {
        console.log(`Mate action invoked with input: ${input}`);
    }

    public move(direction: number, velocity: number) {
        // Normalize the raw inputs into [0, 1]
        const normalizedDir = robustNormalize(direction, this.outputMin, this.outputMax);
        const normalizedVel = robustNormalize(velocity, this.outputMin, this.outputMax);
    
        // Convert normalized direction to an angle in radians (0 to 2π)
        const angle = normalizedDir * 2 * Math.PI;
    
        // Define a maximum speed for scaling the normalized velocity.
        const maxSpeed = 10; // This value can be adjusted according to the environment scale
        const speed = normalizedVel * maxSpeed;
    
        // Compute the displacement in the x and y directions.
        const dx = speed * Math.cos(angle);
        const dy = speed * Math.sin(angle);
    
        // For demonstration: log the computed movement details.
        console.log(`Moving with:
          angle: ${(angle * 180 / Math.PI).toFixed(2)}°,
          speed: ${speed.toFixed(2)},
          displacement: dx=${dx.toFixed(2)}, dy=${dy.toFixed(2)}`);

          return { dx, dy };
    }
}