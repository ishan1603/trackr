"use client";

import { useAuth } from "@clerk/nextjs";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect } from "react";

export function FirebaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const signInToFirebase = async () => {
      if (!isSignedIn) {
        console.log("User is not signed in to Clerk");
        return;
      }

      try {
        console.log("Getting Firebase token from API...");
        
        // Get a Firebase token from our API endpoint
        const response = await fetch('/api/firebase-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { token } = await response.json();
        
        if (!token) {
          console.error("No token received from API");
          return;
        }
        
        console.log("Firebase token received, signing in...");
        
        // Sign in to Firebase with the custom token
        const result = await signInWithCustomToken(auth, token);
        console.log("Successfully signed in to Firebase:", result.user.uid);
        
      } catch (error) {
        console.error("Detailed Firebase sign-in error:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
        }
      }
    };

    signInToFirebase();
  }, [isSignedIn]);

  return <>{children}</>;
}