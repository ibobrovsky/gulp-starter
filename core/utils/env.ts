export const IS_DEV: boolean =
  !process.env.NODE_ENV || process.env.NODE_ENV !== 'production'
