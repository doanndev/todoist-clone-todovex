"use client";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";

import type { ColorName } from "@/convex/colors";
import { suggestColour, swatchByName, type Swatch } from "@/lib/swatch";
import { Button } from "./button";
import ColorPicker from "./color-picker";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Form, FormControl, FormField, FormItem } from "./form";
import { Input } from "./input";

/**
 * The body of the "new project" and "new label" dialogs: a name, a colour
 * from the palette (pre-selecting one nothing uses yet) and a create button.
 * `onCreate` returns true when it worked, which clears the form.
 */
export default function NameColourDialog({
  title,
  description,
  noun,
  submitLabel,
  taken,
  pool,
  preview,
  onCreate,
}: {
  title: string;
  description: string;
  /** "Project" or "Label": names the input. */
  noun: string;
  submitLabel: string;
  /** Colours already in use, so the suggested one is a free one. */
  taken: Swatch[];
  /** Colours to suggest from, in order. Defaults to the whole palette. */
  pool?: Swatch[];
  /** Optional live preview shown beside the button. */
  preview?: (name: string, colour: Swatch | undefined) => ReactNode;
  onCreate: (name: string, colour: ColorName) => Promise<boolean>;
}) {
  const form = useForm({ defaultValues: { name: "" } });
  const [picked, setPicked] = useState<ColorName | null>(null);
  const [busy, setBusy] = useState(false);
  const colour = picked ?? suggestColour(taken, pool).name;
  const name = form.watch("name");

  const onSubmit = async ({ name }: { name: string }) => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      if (await onCreate(name.trim(), colour)) {
        form.reset({ name: "" });
        setPicked(null);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader className="text-left">
        <DialogTitle className="text-xl font-bold tracking-tight">
          {title}
        </DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="text"
                    autoFocus
                    aria-label={`${noun} name`}
                    placeholder={`${noun} name`}
                    required
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <ColorPicker value={colour} onChange={setPicked} />
          <div className="flex items-center justify-between gap-3">
            <div>{preview?.(name.trim(), swatchByName(colour))}</div>
            <Button disabled={busy} type="submit">
              {busy ? "Adding" : submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
