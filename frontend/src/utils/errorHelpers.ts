export const isErrorLike = (
  error: unknown,
): error is { message: string; name: string; stack?: string } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "name" in error
  );
};

export const errorToString = (error: unknown): string => {
  if (isErrorLike(error)) {
    return `${error.name}: ${error.message}${
      error.stack ? `\n${error.stack}` : ""
    }`;
  }
  return "Unknown error: [" + String(error) + "]";
};
