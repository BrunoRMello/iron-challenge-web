type NamePart = "first" | "firstAndSecond" | "initials";

export function formatNamePart(
  displayName?: string | null,
  part: NamePart = "first",
) {
  if (!displayName) return undefined;

  const parts = displayName.trim().split(" ").filter(Boolean);
  const first = parts[0];
  const second = parts[1];
  const last = parts[parts.length - 1];

  switch (part) {
    case "first": {
      return first;
    }

    case "firstAndSecond": {
      return [first, second].filter(Boolean).join(" ");
    }

    case "initials": {
      const firstInitial = first.charAt(0).toUpperCase();
      const lastInitial = last ? last.charAt(0).toUpperCase() : "";
      return `${firstInitial}${lastInitial}`;
    }

    default: {
      return first;
    }
  }
}
