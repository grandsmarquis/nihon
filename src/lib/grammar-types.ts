export const jlptLevels = ["N5", "N4", "N3", "N2", "N1"] as const;

export type JLPTLevel = (typeof jlptLevels)[number];
