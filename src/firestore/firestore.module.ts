import { Module } from '@nestjs/common';

import { Firestore } from '@google-cloud/firestore';


const firestoreProvider = {

  useFactory: () => {
    // The Firestore constructor automatically looks for the 
    // GOOGLE_APPLICATION_CREDENTIALS environment variable.
    // It is initialized here once.
    return new Firestore();
  },
};

@Module({})
export class FirestoreModule {}
