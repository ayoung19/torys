export type StringifyValues<T> = {
  [K in keyof T]: string;
};
