import { Timestamp } from "firebase/firestore";

type DateFormat = "short" | "long";

interface FormatFirestoreDateOptions {
  type?: DateFormat;
  timestamp?: Timestamp | null;
}

export function formatDate({
  type = "short",
  timestamp,
}: FormatFirestoreDateOptions): string | null {
  if (!timestamp) return null;

  const date = timestamp.toDate();

  const options: Record<DateFormat, Intl.DateTimeFormatOptions> = {
    short: {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
    long: {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  };

  return date.toLocaleDateString("pt-BR", options[type]);
}
