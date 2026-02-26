import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export interface KickEntry {
  id: string;
  timestamp: string;
  date: string;
}

const kicksRef = collection(db, "kicks");

export const useKicks = () => {
  const [kicks, setKicks] = useState<KickEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      kicksRef,
      (snapshot) => {
        const kicksData: KickEntry[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            timestamp: data.timestamp,
            date: data.date,
          };
        });

        kicksData.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

        setKicks(kicksData);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading kicks:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const addKick = async (): Promise<string> => {
    const now = new Date();
    const newKick = {
      timestamp: now.toISOString(),
      date: now.toISOString().split("T")[0],
    };

    try {
      const docRef = await addDoc(kicksRef, newKick);
      return docRef.id;
    } catch (error) {
      console.error("Failed to add kick:", error);
      throw error;
    }
  };

  const removeKick = async (id: string) => {
    try {
      const kickDoc = doc(db, "kicks", id);
      await deleteDoc(kickDoc);
    } catch (error) {
      console.error("Failed to remove kick:", error);
      throw error;
    }
  };

  return { kicks, loading, addKick, removeKick };
};
