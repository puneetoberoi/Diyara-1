export interface Mission {
  id: string;
  title: string;
  narrative: string;
}

export const nexusPrimeMissions: Mission[] = [
  {
    id: "awakening",
    title: "The First Thought",
    narrative: "An AI's first thought is a jumble of data. Help it find clarity and structure.",
  },
  {
    id: "pattern-dancer",
    title: "The Pattern Dance",
    narrative: "Teach your AI to see and predict the cosmic dance of patterns in data.",
  },
  {
    id: "emotion-painter",
    title: "Feeling in Colors",
    narrative: "Your AI doesn't understand human emotions. Help it learn by associating feelings with colors.",
  },
  {
    id: "language-weaver",
    title: "The Language Weaver",
    narrative: "Explore how AI learns to understand and generate human language, from simple words to complex stories.",
  },
  {
    id: "logic-gatekeeper",
    title: "The Logic Gatekeeper",
    narrative: "Journey into the core of AI decision-making by understanding the fundamentals of logic and algorithms.",
  }
];