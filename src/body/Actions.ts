import { Observable } from "../environment/Observable"
import { Body, BodyId } from "./Body"

export type ActionMap = Array<(...args: any[]) => any>


export class Actions {
    public actions: ActionMap = []

    constructor() {
        this.actions = [
            this.wait,
            this.mate,
        ]


    }

    /**
     * Decodes the output of the brain to an action, the first output with the highest value is selected. 
     * 
     * `TODO`: could add a threshold to select the action and confidence levels
     * @param out 
     * @returns the index of the action to perform 
     */
    public static actionFromOutput(out: number[]): number {
        let index = 0;
        for (let i = 1; i < out.length; i++) {
            if (out[i] > out[index]) {
                index = i;
            }
        }
        return index - 1;
    }

    wait() {
        return
    }

    /**
    * `WORK IN PROGRESS` select observables to observe, returns input space
    * @param observables 
    * @param selections TODO: the output of the brain should be decoded to select which observables to observe
    * @returns input space
    */
    observe(observables: Observable[], selections: number[]) {
        // the input nuerons are equal to the total number of observables that a body can observe, 
        // so if we select less than the entire observation space we must pad the input space with zeros
        return observables.map((observable, i) => selections.includes(i) ? observable.observe() : 0);
    }

    mate() {
        // requests mate or accepts an incoming mate request and submits both genomes to the evolution process
        

        return

    }

}