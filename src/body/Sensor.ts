/** Expression of Sense Genes, maps an environment's observable to an input neuron. */
export class Sensor {
  /** The index of the observable from the environment this sensor observes */
  sensitivty: number = 0
  constructor(sensitivity: number) {
    this.sensitivty = sensitivity
  }

  /** Encode the observable and return value */
  sense(input: any): number {
    return Math.random()
  }
}