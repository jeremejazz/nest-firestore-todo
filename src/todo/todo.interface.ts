export interface Todo {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: Date; // Firestore Timestamp objects are usually converted to JS Date
  updatedAt: Date;
}