import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { WeightEntry } from "@/types";
import { calculateTimeInfo } from "@/utils";

const weightsRef = collection(db, "weights");

export const useWeight = () => {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      weightsRef,
      (snapshot) => {
        const weightsData: WeightEntry[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            date: data.date,
            timestamp: data.timestamp,
            weight: data.weight,
            weekNumber: data.weekNumber,
          };
        });

        weightsData.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );

        setWeights(weightsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading weights:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const addWeight = async (weight: number, date: string) => {
    const entryDate = new Date(date);
    const { weeks } = calculateTimeInfo(entryDate);

    const newEntry = {
      date,
      timestamp: new Date().toISOString(),
      weight,
      weekNumber: weeks,
    };

    try {
      await addDoc(weightsRef, newEntry);
    } catch (error) {
      console.error("Failed to add weight entry:", error);
      throw error;
    }
  };

  const removeWeight = async (id: string) => {
    try {
      const weightDoc = doc(db, "weights", id);
      await deleteDoc(weightDoc);
    } catch (error) {
      console.error("Failed to remove weight entry:", error);
      throw error;
    }
  };

  return { weights, loading, addWeight, removeWeight };
};

