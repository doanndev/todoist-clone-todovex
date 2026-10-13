import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { LABEL_COLOURS, assignLabelColours } from "@/lib/swatch";
import LabelTag from "../todos/label-tag";
import NameColourDialog from "../ui/name-colour-dialog";
import { useToast } from "../ui/use-toast";

export default function AddLabelDialog() {
  const createLabel = useMutation(api.labels.createALabel);
  const labels = useQuery(api.labels.getLabels);
  const { toast } = useToast();

  return (
    <NameColourDialog
      title="New label"
      description="Labels tag a task; pick one when you add it."
      noun="Label"
      submitLabel="Create label"
      taken={Array.from(assignLabelColours(labels ?? []).values())}
      pool={LABEL_COLOURS}
      preview={(name, colour) => (
        <LabelTag
          label={{ _id: "preview", name: name || "Preview" }}
          colour={colour}
        />
      )}
      onCreate={async (name, color) => {
        const labelId = await createLabel({ name, color });
        if (labelId) {
          toast({ title: "Label created", description: name, duration: 3000 });
        }
        return !!labelId;
      }}
    />
  );
}
