const DEV_IN_PTS = 1000000000000

export function devToPts(amountInDev) {
  return amountInDev * DEV_IN_PTS
}

export function ptsToDev(amountInPts) {
  return 1.0 * amountInPts / DEV_IN_PTS
}