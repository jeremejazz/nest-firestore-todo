import { Module } from '@nestjs/common';

import { Firestore } from '@google-cloud/firestore';

export const FIRESTORE_PROVIDER = 'FIRESTORE_INJECT_TOKEN';

const firestoreProvider = {
    provide: FIRESTORE_PROVIDER,

  useFactory: () => {
    // The Firestore constructor automatically looks for the 
    // GOOGLE_APPLICATION_CREDENTIALS environment variable.
    // It is initialized here once.
    return new Firestore({
        databaseId: "my-firebase"
    });
  },
};

@Module({
    providers: [firestoreProvider],
    exports: [FIRESTORE_PROVIDER]
})
export class FirestoreModule {}
