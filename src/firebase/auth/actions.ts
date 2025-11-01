'use server';

import { initializeFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const SignUpSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signUpWithEmail(values: z.infer<typeof SignUpSchema>): Promise<{ success: boolean; error?: string }> {
  const { auth, firestore } = initializeFirebase();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    const user = userCredential.user;

    // Update user profile in Firebase Auth
    await updateProfile(user, {
      displayName: values.fullName,
    });
    
    // Create user document in Firestore
    const userDocRef = doc(firestore, 'users', user.uid);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: values.fullName,
      createdAt: serverTimestamp(),
    };
    
    setDoc(userDocRef, userData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: userData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    return { success: true };
  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email address is already in use by another account.';
    } else if (error.code) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function signInWithEmail(values: z.infer<typeof SignInSchema>): Promise<{ success: boolean; error?: string }> {
  const { auth } = initializeFirebase();
  try {
    await signInWithEmailAndPassword(auth, values.email, values.password);
    return { success: true };
  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred.';
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      errorMessage = 'Invalid email or password. Please try again.';
    } else if (error.code) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
