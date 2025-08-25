import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditableFieldProps {
  label: string;
  value: string | number | boolean;
  onChange: (value: string) => void;
  isEditing: boolean;
  type?: "text" | "date" | "number" | "email" | "tel";
}

export const EditableField = ({
  label,
  value,
  onChange,
  isEditing,
  type = "text",
}: EditableFieldProps) => {
  const displayValue =
    typeof value === "boolean" ? (value ? "Yes" : "No") : String(value || "");

  if (!isEditing) {
    return (
      <div className="flex justify-between items-center py-2 border-b border-border/50">
        <Label className="font-medium capitalize text-sm">{label}:</Label>
        <span className="text-muted-foreground text-sm text-right max-w-[60%] break-words">
          {displayValue}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2 py-2">
      <Label htmlFor={label} className="font-medium capitalize text-sm">
        {label}
      </Label>
      <Input
        id={label}
        type={type}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    </div>
  );
};
