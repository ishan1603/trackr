"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { saveMetric } from "@/lib/storage";
import { HealthMetric } from "@/lib/types";

interface MetricFormProps {
  onMetricAdded: () => void;
  userId?: string | null;
}

export default function MetricForm({ onMetricAdded, userId }: MetricFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    weight: "",
    bloodSugar: "",
    sleep: "",
    steps: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      console.warn("Cannot save metric without a user id");
      return;
    }

    const metric: Omit<HealthMetric, "id" | "userId"> = {
      date: new Date(),
      bloodPressureSystolic: formData.bloodPressureSystolic
        ? Number(formData.bloodPressureSystolic)
        : undefined,
      bloodPressureDiastolic: formData.bloodPressureDiastolic
        ? Number(formData.bloodPressureDiastolic)
        : undefined,
      heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      bloodSugar: formData.bloodSugar ? Number(formData.bloodSugar) : undefined,
      sleep: formData.sleep ? Number(formData.sleep) : undefined,
      steps: formData.steps ? Number(formData.steps) : undefined,
      notes: formData.notes || undefined,
    };

    try {
      await saveMetric(userId, metric);

      // Reset form
      setFormData({
        bloodPressureSystolic: "",
        bloodPressureDiastolic: "",
        heartRate: "",
        weight: "",
        bloodSugar: "",
        sleep: "",
        steps: "",
        notes: "",
      });

      setOpen(false);
      onMetricAdded();
    } catch (error) {
      console.error("Failed to save metric", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2" disabled={!userId}>
          <Plus className="h-5 w-5" />
          Log Health Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Your Health Metrics</DialogTitle>
          <DialogDescription>
            Enter your current health data. You don&apos;t need to fill all
            fields.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bpSystolic">Blood Pressure (Systolic)</Label>
              <Input
                id="bpSystolic"
                type="number"
                placeholder="120"
                value={formData.bloodPressureSystolic}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bloodPressureSystolic: e.target.value,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">mmHg</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bpDiastolic">Blood Pressure (Diastolic)</Label>
              <Input
                id="bpDiastolic"
                type="number"
                placeholder="80"
                value={formData.bloodPressureDiastolic}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bloodPressureDiastolic: e.target.value,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">mmHg</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heartRate">Heart Rate</Label>
              <Input
                id="heartRate"
                type="number"
                placeholder="72"
                value={formData.heartRate}
                onChange={(e) =>
                  setFormData({ ...formData, heartRate: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">bpm</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="150"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">lbs</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodSugar">Blood Sugar</Label>
              <Input
                id="bloodSugar"
                type="number"
                placeholder="95"
                value={formData.bloodSugar}
                onChange={(e) =>
                  setFormData({ ...formData, bloodSugar: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">mg/dL</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sleep">Sleep Duration</Label>
              <Input
                id="sleep"
                type="number"
                step="0.5"
                placeholder="7.5"
                value={formData.sleep}
                onChange={(e) =>
                  setFormData({ ...formData, sleep: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">hours</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="steps">Daily Steps</Label>
              <Input
                id="steps"
                type="number"
                placeholder="10000"
                value={formData.steps}
                onChange={(e) =>
                  setFormData({ ...formData, steps: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">steps</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="How are you feeling today?"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Metrics</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
