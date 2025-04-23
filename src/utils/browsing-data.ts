import Bowser from 'bowser'
import type { HTTPHeaders } from 'elysia/types'
import maxmind from 'maxmind'
import type { CityResponse } from 'maxmind'

function getUserAgentDetails(headers: HTTPHeaders) {
  const useragent = headers['user-agent']
  const outlineBrowser = headers['x-outline-browser']
  const browserDetails = Bowser.parse(useragent)
  return {
    browser: outlineBrowser || browserDetails.browser.name || undefined,
    os: browserDetails.os.name || undefined,
    platform: browserDetails.platform.type || undefined
  }
}

async function getLocationFromIp(ip: string) {
  if (ip) {
    const dbPath = Bun.resolveSync('./maxmind/GeoLite2-City.mmdb', process.cwd())
    const lookup = await maxmind.open<CityResponse>(dbPath)
    const ipDetails = lookup.get(ip)
    if (ipDetails) {
      return {
        city: ipDetails.city?.names?.en || undefined,
        country: {
          name: ipDetails.country?.names?.en || undefined,
          code: ipDetails.country?.iso_code || undefined
        },
        continent: ipDetails.continent?.code || undefined,
        coords:
          ipDetails.location?.latitude && ipDetails.location?.longitude
            ? {
                type: 'Point',
                coordinates: [ipDetails.location?.longitude, ipDetails.location?.latitude] as [
                  number,
                  number
                ]
              }
            : undefined,
        timezone: ipDetails.location?.time_zone || undefined
      }
    }
  }
  return null
}

type BrowsingDataProps = {
  browser: string
  os: string
  platform: string
  ipDetails: Awaited<ReturnType<typeof getLocationFromIp>>
}

function getBrowsingData({ browser, os, platform, ipDetails }: BrowsingDataProps) {
  return {
    browser,
    os,
    platform,
    city: ipDetails?.city,
    country: ipDetails?.country,
    continent: ipDetails?.continent,
    coords: ipDetails?.coords,
    timezone: ipDetails?.timezone
  }
}

type Page = {
  fullpath: string
  path: string
  hash?: string
  title: string
  meta?: Record<string, string>
  query?: Record<string, string>
}

function getPageData(pageData: { fullpath: string; title: string; meta?: Record<string, string> }) {
  const pageUrl = new URL(pageData.fullpath)
  const page: Page = {
    fullpath: pageData.fullpath,
    path: pageUrl.pathname,
    hash: pageUrl.hash,
    title: pageData.title,
    meta: pageData.meta
  }
  if (pageUrl.search.trim().length) {
    page.query = Object.fromEntries(pageUrl.searchParams)
  }
  return page
}

type UTM = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

function getUtmData(fullpath: string) {
  const pageUrl = new URL(fullpath)
  if (pageUrl.search.trim().length) {
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
    const utm: UTM = {}
    pageUrl.searchParams.forEach((value, key) => {
      if (utmParams.includes(key)) {
        utm[key] = value
      }
    })
    return utm
  }
  return {} as UTM
}

export { getUserAgentDetails, getLocationFromIp, getBrowsingData, getPageData, getUtmData }
