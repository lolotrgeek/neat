
// BRAIN
/** One Million Max Nodes */
export const MAX_NODES = 1_000_000;

// GENOME
/** Set the importance of excess genes */
export const EXCESS_IMPORTANCE = 1
/** Set the Importance of Disjoint Genes */
export const DISJOINT_IMPORTANCE = 1
/** Set the importance of weight differences */
export const WEIGHT_DIFFERENCE_IMPORTANCE = 0.4

// MUTATIONS
/** Strength of weight shifting mutation */
export const WEIGHT_SHIFT_STRENGTH = 0.3
/** Strength of weight random mutation */
export const WEIGHT_RANDOM_STRENGTH = 1
/** Number of times to randomly search and perform link mutations */
export const MUTATE_LINK_PERMUTATIONS = 100
/** An offset on the y axis for node placement */
export const NODE_Y_OFFSET = Math.random() * 0.1 - 0.05

export const PROABILITY_MUTATE_LINK = 0.1
export const PROABILITY_MUTATE_NODE = 0.001
export const PROABILITY_MUTATE_WEIGHT_SHIFT = 0.1
export const PROABILITY_MUTATE_WEIGHT_RANDOM = 0.1
export const PROABILITY_MUTATE_TOGGLE = 0.1

// SPECIATION
export const MAX_SPECIES = 10
/** Distance factor for determining if individual is in Species */
export const SPECIATION_THRESHOLD = 3
/** Percent of population to kill during culling */
export const CULL_THRESHOLD = 0.01
/** Percent of population to be born during reproduction */
export const BIRTH_RATE = 0.02