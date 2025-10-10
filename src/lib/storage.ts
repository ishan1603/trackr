import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { HealthMetric, Goal, UserProfile } from "./types";

// Storage keys
const STORAGE_KEY = "healthtrackr_metrics";
const PROFILE_KEY = "healthtrackr_profile";
const GOALS_KEY = "healthtrackr_goals";

// Helper: detect permission-denied errors
function isPermissionError(err: unknown) {
  try {
    const e = err as unknown as { code?: string; message?: string };
    return (
      e?.code === "permission-denied" ||
      String(e?.message || "").includes("Missing or insufficient permissions")
    );
  } catch {
    return false;
  }
}

// Helper: remove undefined fields recursively from objects so Firestore won't reject them
function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return (obj.map((v) => (v && typeof v === "object" ? stripUndefined(v as unknown) : v)) as unknown) as T;
  }
  if (typeof obj === "object") {
    const out: Record<string, unknown> = {};
    const entries = Object.entries(obj as Record<string, unknown>);
    for (const [k, v] of entries) {
      if (v === undefined) continue;
      if (v === null) {
        out[k] = null;
        continue;
      }
      if (typeof v === "object") {
        out[k] = stripUndefined(v as unknown);
      } else {
        out[k] = v;
      }
    }
    return out as unknown as T;
  }
  return obj;
}

// --- LocalStorage fallback implementations ---
function readLocal<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function metricsFromLocal(userId: string): HealthMetric[] {
  const all = readLocal<Array<Record<string, unknown>>>(STORAGE_KEY) || [];
  const list = all
    .filter((m) => String(m.userId) === userId)
    .map((m) => {
      const rec = m as Record<string, unknown>;
      return ({ ...(rec as Record<string, unknown>), date: new Date(String(rec.date)) } as HealthMetric);
    });
  return list.sort((a, b) => b.date.getTime() - a.date.getTime());
}

function toDateSafe(val: unknown): Date | undefined {
  if (val === null || val === undefined) return undefined;
  // Firestore Timestamp-like
  if (typeof val === "object") {
    const v = val as { toDate?: () => Date };
    if (typeof v.toDate === "function") return v.toDate();
  }
  if (typeof val === "string") return new Date(val);
  if (val instanceof Date) return val;
  return undefined;
}

function saveMetricLocal(
  userId: string,
  metric: Omit<HealthMetric, "id" | "userId">
): HealthMetric {
  const all = readLocal<Array<Record<string, unknown>>>(STORAGE_KEY) || [];
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const entry: Record<string, unknown> = { id, userId, ...(metric as unknown as Record<string, unknown>), date: metric.date.toISOString() };
  all.push(entry);
  writeLocal(STORAGE_KEY, all);
  const out = entry as Record<string, unknown>;
  return ({
    id: String(out.id),
    userId: String(out.userId),
    date: new Date(String(out.date)),
    bloodPressureSystolic: out.bloodPressureSystolic as number | undefined,
    bloodPressureDiastolic: out.bloodPressureDiastolic as number | undefined,
    heartRate: out.heartRate as number | undefined,
    weight: out.weight as number | undefined,
    bloodSugar: out.bloodSugar as number | undefined,
    sleep: out.sleep as number | undefined,
    steps: out.steps as number | undefined,
    waterIntake: out.waterIntake as number | undefined,
    exercise: out.exercise as number | undefined,
    calories: out.calories as number | undefined,
    mood: out.mood as number | undefined,
    notes: out.notes as string | undefined,
  } as HealthMetric);
}

function deleteMetricLocal(userId: string, id: string): void {
  const all = readLocal<Array<Record<string, unknown>>>(STORAGE_KEY) || [];
  const filtered = all.filter((m) => !(String(m.userId) === userId && String(m.id) === id));
  writeLocal(STORAGE_KEY, filtered);
}

function saveProfileLocal(userId: string, profile: Omit<UserProfile, "userId">) {
  const payload: Record<string, unknown> = { userId, ...(profile as unknown as Record<string, unknown>) };
  writeLocal(PROFILE_KEY + "_" + userId, payload);
}

function getProfileLocal(userId: string): UserProfile | null {
  const p = readLocal<UserProfile>(PROFILE_KEY + "_" + userId);
  return p || null;
}

function saveGoalLocal(userId: string, goal: Omit<Goal, "id" | "createdAt" | "userId">): Goal {
  const all = readLocal<Array<Record<string, unknown>>>(GOALS_KEY) || [];
  const id = `local-goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const entry: Record<string, unknown> = { id, userId, ...(goal as unknown as Record<string, unknown>), createdAt: new Date().toISOString() };
  all.push(entry);
  writeLocal(GOALS_KEY, all);
  const out = entry as Record<string, unknown>;
  return ({
    id: String(out.id),
    userId: String(out.userId),
    type: out.type as Goal['type'],
    targetValue: Number(out.targetValue),
    currentValue: Number(out.currentValue),
    deadline: out.deadline ? new Date(String(out.deadline)) : undefined,
    createdAt: new Date(String(out.createdAt)),
    status: out.status as Goal['status'],
  } as Goal);
}

function getGoalsLocal(userId: string): Goal[] {
  const all = readLocal<Array<Record<string, unknown>>>(GOALS_KEY) || [];
  return all
    .filter((g) => String(g.userId) === userId)
    .map((g) => {
      const rec = g as Record<string, unknown>;
      return ({
        ...(rec as Record<string, unknown>),
        id: String(rec.id),
        userId: String(rec.userId),
        type: rec.type as Goal['type'],
        targetValue: Number(rec.targetValue),
        currentValue: Number(rec.currentValue),
        createdAt: new Date(String(rec.createdAt)),
        deadline: rec.deadline ? new Date(String(rec.deadline)) : undefined,
        status: rec.status as Goal['status'],
      } as Goal);
    });
}

function updateGoalLocal(userId: string, id: string, updates: Partial<Goal>) {
  const all = readLocal<Array<Record<string, unknown>>>(GOALS_KEY) || [];
  const idx = all.findIndex((g) => String(g.userId) === userId && String(g.id) === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...(updates as Record<string, unknown>) };
  writeLocal(GOALS_KEY, all);
}

function deleteGoalLocal(userId: string, id: string) {
  const all = readLocal<Array<Record<string, unknown>>>(GOALS_KEY) || [];
  const filtered = all.filter((g) => !(String(g.userId) === userId && String(g.id) === id));
  writeLocal(GOALS_KEY, filtered);
}

// --- Firestore-backed operations with fallback ---

export async function saveMetric(
  userId: string,
  metric: Omit<HealthMetric, "id" | "userId">
): Promise<HealthMetric> {
  try {
    const newMetricData = stripUndefined({
      ...metric,
      userId,
      date: Timestamp.fromDate(metric.date),
    });
    const docRef = await addDoc(collection(db, "users", userId, "metrics"), newMetricData);
  return { ...newMetricData, date: toDateSafe(newMetricData.date)!, id: docRef.id } as HealthMetric;
  } catch (err) {
    if (isPermissionError(err)) {
      // Fallback to localStorage
      return saveMetricLocal(userId, metric);
    }
    throw err;
  }
}

export async function getMetrics(userId: string): Promise<HealthMetric[]> {
  try {
    const q = query(collection(db, "users", userId, "metrics"));
    const querySnapshot = await getDocs(q);
    const metrics: HealthMetric[] = [];
    querySnapshot.forEach((d) => {
      const raw = d.data() as Record<string, unknown>;
      metrics.push({
        id: d.id,
        userId: String(raw.userId),
        date: toDateSafe(raw.date)!,
        bloodPressureSystolic: raw.bloodPressureSystolic as number | undefined,
        bloodPressureDiastolic: raw.bloodPressureDiastolic as number | undefined,
        heartRate: raw.heartRate as number | undefined,
        weight: raw.weight as number | undefined,
        bloodSugar: raw.bloodSugar as number | undefined,
        sleep: raw.sleep as number | undefined,
        steps: raw.steps as number | undefined,
        waterIntake: raw.waterIntake as number | undefined,
        exercise: raw.exercise as number | undefined,
        calories: raw.calories as number | undefined,
        mood: raw.mood as number | undefined,
        notes: raw.notes as string | undefined,
      } as HealthMetric);
    });
    return metrics.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (err) {
    if (isPermissionError(err)) {
      return metricsFromLocal(userId);
    }
    throw err;
  }
}

export async function deleteMetric(userId: string, id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "users", userId, "metrics", id));
  } catch (err) {
    if (isPermissionError(err)) {
      deleteMetricLocal(userId, id);
      return;
    }
    throw err;
  }
}

// --- Profile ---
export async function saveProfile(userId: string, profile: Omit<UserProfile, "userId">): Promise<void> {
  try {
    const profileRef = doc(db, "users", userId, "profile", "data");
    await setDoc(profileRef, stripUndefined({ ...profile, userId }), { merge: true });
  } catch (err) {
    if (isPermissionError(err)) {
      saveProfileLocal(userId, profile);
      return;
    }
    throw err;
  }
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const profileRef = doc(db, "users", userId, "profile", "data");
    const docSnap = await getDoc(profileRef);
    if (docSnap.exists()) return docSnap.data() as UserProfile;
    return null;
  } catch (err) {
    if (isPermissionError(err)) return getProfileLocal(userId);
    throw err;
  }
}

// --- Goals ---
export async function saveGoal(
  userId: string,
  goal: Omit<Goal, "id" | "createdAt" | "userId">
): Promise<Goal> {
  try {
    const newGoalData = stripUndefined({
      ...goal,
      userId,
      createdAt: Timestamp.now(),
      deadline: goal.deadline ? Timestamp.fromDate(goal.deadline) : undefined,
    });
    const docRef = await addDoc(collection(db, "users", userId, "goals"), newGoalData);
    const raw = newGoalData as unknown as Record<string, unknown>;
    return {
      id: docRef.id,
      userId: String(raw.userId),
      type: raw.type as Goal['type'],
      targetValue: Number(raw.targetValue),
      currentValue: Number(raw.currentValue),
      createdAt: toDateSafe(raw.createdAt)!,
      deadline: raw.deadline ? toDateSafe(raw.deadline) : undefined,
      status: raw.status as Goal['status'],
    } as Goal;
  } catch (err) {
    if (isPermissionError(err)) return saveGoalLocal(userId, goal);
    throw err;
  }
}

export async function getGoals(userId: string): Promise<Goal[]> {
  try {
    const q = query(collection(db, "users", userId, "goals"));
    const querySnapshot = await getDocs(q);
    const goals: Goal[] = [];
    querySnapshot.forEach((d) => {
      const raw = d.data() as Record<string, unknown>;
      goals.push({
        id: d.id,
        userId: String(raw.userId),
        type: raw.type as Goal['type'],
        targetValue: Number(raw.targetValue),
        currentValue: Number(raw.currentValue),
        createdAt: toDateSafe(raw.createdAt)!,
        deadline: raw.deadline ? toDateSafe(raw.deadline) : undefined,
        status: raw.status as Goal['status'],
      } as Goal);
    });
    return goals;
  } catch (err) {
    if (isPermissionError(err)) return getGoalsLocal(userId);
    throw err;
  }
}

export async function updateGoal(userId: string, id: string, updates: Partial<Goal>): Promise<void> {
  try {
    const goalRef = doc(db, "users", userId, "goals", id);
    await updateDoc(goalRef, updates);
  } catch (err) {
    if (isPermissionError(err)) {
      updateGoalLocal(userId, id, updates);
      return;
    }
    throw err;
  }
}

export async function deleteGoal(userId: string, id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "users", userId, "goals", id));
  } catch (err) {
    if (isPermissionError(err)) {
      deleteGoalLocal(userId, id);
      return;
    }
    throw err;
  }
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
