export const UA: string | undefined = window.navigator?.userAgent?.toLowerCase()

export const isIE9 = UA?.indexOf('msie 9.0') > 0
