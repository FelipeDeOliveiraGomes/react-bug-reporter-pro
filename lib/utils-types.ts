// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GetFnParamType<T> = T extends (...args: (infer U)[]) => any
    ? U
    : never
