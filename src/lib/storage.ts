import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { HealthMetric, Goal, UserProfile } from "./types";

// Assume a single, hardcoded user for now.
// In a real app, you'd get this from Firebase Auth.
const FAKE_USER_ID = "test-user";

// --- Metrics ---

export async function saveMetric(
  userId: string,
  metric: Omit<HealthMetric, "id" | "userId">
): Promise<HealthMetric> {
  const newMetricData = {
    ...metric,
    userId,
    date: Timestamp.fromDate(metric.date),
  };
  const docRef = await addDoc(
    collection(db, "users", userId, "metrics"),
    newMetricData
  );
  return { ...newMetricData, date: newMetricData.date.toDate(), id: docRef.id };
}

export async function getMetrics(userId: string): Promise<HealthMetric[]> {
  const q = query(collection(db, "users", userId, "metrics"));
  const querySnapshot = await getDocs(q);
  const metrics: HealthMetric[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    metrics.push({
      id: doc.id,
      ...data,
      date: (data.date as Timestamp).toDate(),
    } as HealthMetric);
  });
  return metrics.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function deleteMetric(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "metrics", id));
}

// --- User Profile ---

export async function saveProfile(
  userId: string,
  profile: Omit<UserProfile, "userId">
): Promise<void> {
  const profileRef = doc(db, "users", userId, "profile", "data");
  await setDoc(profileRef, { ...profile, userId }, { merge: true });
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const profileRef = doc(db, "users", userId, "profile", "data");
  const docSnap = await getDoc(profileRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    return null; // Onboarding flow will handle profile creation
  }
}

// --- Goals ---

export async function saveGoal(
  userId: string,
  goal: Omit<Goal, "id" | "createdAt" | "userId">
): Promise<Goal> {
  const newGoalData = {
    ...goal,
    userId,
    createdAt: Timestamp.now(),
    deadline: goal.deadline ? Timestamp.fromDate(goal.deadline) : undefined,
  };
  const docRef = await addDoc(
    collection(db, "users", userId, "goals"),
    newGoalData
  );
  return {
    ...newGoalData,
    id: docRef.id,
    createdAt: newGoalData.createdAt.toDate(),
    deadline: newGoalData.deadline?.toDate(),
  };
}

export async function getGoals(userId: string): Promise<Goal[]> {
  const q = query(collection(db, "users", userId, "goals"));
  const querySnapshot = await getDocs(q);
  const goals: Goal[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    goals.push({
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
      deadline: data.deadline
        ? (data.deadline as Timestamp).toDate()
        : undefined,
    } as Goal);
  });
  return goals;
}

export async function updateGoal(
  userId: string,
  id: string,
  updates: Partial<Goal>
): Promise<void> {
  const goalRef = doc(db, "users", userId, "goals", id);
  await updateDoc(goalRef, updates);
}

export async function deleteGoal(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "goals", id));
}

// --- Sample Data Generation ---

export async function generateSampleData(userId: string): Promise<void> {
  const metrics = await getMetrics(userId);
  if (metrics.length > 0) {
    console.log("Sample data already exists. Skipping generation.");
    return;
  }

  console.log("Generating sample data...");
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const variance = (Math.random() - 0.5) * 10;
    const trend = i * 0.1;

    const sampleMetric: Omit<HealthMetric, "id" | "userId"> = {
      date,
      bloodPressureSystolic: Math.round(118 + variance + (i > 20 ? 15 : 0)),
      bloodPressureDiastolic: Math.round(78 + variance * 0.5),
      heartRate: Math.round(72 + variance),
      weight: Math.round(170 - trend + variance * 0.3),
      bloodSugar: Math.round(95 + variance * 1.5),
      sleep: Math.max(4, Math.min(10, 7.5 + (Math.random() - 0.5) * 2)),
      steps: Math.round(8500 + variance * 100),
      notes: i % 5 === 0 ? "Feeling good today" : undefined,
    };
    await saveMetric(userId, sampleMetric);
  }
  console.log("Sample data generation complete.");
}
