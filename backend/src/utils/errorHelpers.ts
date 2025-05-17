export function hasStringMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

export function getErrorMessage(error: unknown): string {
  if (hasStringMessage(error)) {
    return error.message;
  }
  return "Unknown error";
}
