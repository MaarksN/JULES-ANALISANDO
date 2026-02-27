import { QueryDocumentSnapshot } from "firebase/firestore";
import { Session, Template } from "../types";

// Item 17: Data Converters
export const sessionConverter = {
    toFirestore: (data: Session) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as Session
};

export const templateConverter = {
    toFirestore: (data: Template) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as Template
};
