export type StdinTab = { type: "stdin"; id: string };
export type FileTab = { type: "file"; path: string; id: string };

export type Tab = FileTab | StdinTab;
