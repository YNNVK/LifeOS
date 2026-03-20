import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, signIn, signOut } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: () => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Ensure profile exists in Firestore
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (!profileSnap.exists()) {
          const newProfile = {
            id: user.uid,
            email: user.email,
            fullName: user.displayName,
            avatarUrl: user.photoURL,
            onboardingCompleted: false,
            plan: 'free',
            preferences: {
              currency: 'EUR',
              theme: 'dark'
            },
            updatedAt: new Date().toISOString()
          };
          await setDoc(profileRef, newProfile);
          setProfile(newProfile);
        } else {
          setProfile(profileSnap.data());
        }

        // Listen for profile changes
        onSnapshot(profileRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data());
          }
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
