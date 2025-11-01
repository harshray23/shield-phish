'use client';

import React from 'react';
import { FirebaseProvider, initializeFirebase } from '@/firebase';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebaseApp, setFirebaseApp] = React.useState<any>(null);
  const [firestore, setFirestore] = React.useState<any>(null);
  const [auth, setAuth] = React.useState<any>(null);
  
  React.useEffect(() => {
    const { firebaseApp, firestore, auth } = initializeFirebase();
    setFirebaseApp(firebaseApp);
    setFirestore(firestore);
    setAuth(auth);
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
    >
      {children}
    </FirebaseProvider>
  );
}
