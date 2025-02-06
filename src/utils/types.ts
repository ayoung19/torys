export type StringifyValues<T> = {
  [K in keyof T]: string;
};

export type ActionResult = {
  status: "success" | "info" | "error";
  message: string;
} | null;
