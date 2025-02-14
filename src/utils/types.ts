export type StringifyValues<T> = {
  [K in keyof T]: string;
};

export type Nullable<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | null : T[P];
};

export type ActionResult = {
  status: "success" | "info" | "error";
  message: string;
} | null;
