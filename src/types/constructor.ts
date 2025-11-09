/** Constructor type */
export type constructor<T> = {
  new (...args: any[]): T;
};

