import Bowser from 'bowser'
import maxmind from 'maxmind'

function getUserAgentDetails(headers) {
  const useragent = headers['user-agent']
  const outlineBrowser = headers['x-outline-browser']
  const browserDetails = Bowser.parse(useragent)
  return {
    browser: {
      name: outlineBrowser || browserDetails.browser.name,
      version: browserDetails.browser.version
    },
    os: browserDetails.os,
    platform: browserDetails.platform
  }
}

async function getLocationFromIp(ip) {
  if (ip) {
    const dbPath = Bun.resolveSync('./maxmind/GeoLite2-City.mmdb', process.cwd())
    const lookup = await maxmind.open(dbPath)
    const ipDetails = lookup.get(ip)
    if (ipDetails) {
      return {
        city: ipDetails.city?.names?.en || null,
        country: {
          name: ipDetails.country?.names?.en || null,
          code: ipDetails.country?.iso_code || null
        },
        continent: {
          name: ipDetails.continent?.names?.en || null,
          code: ipDetails.continent?.code || null
        },
        coords:
          ipDetails.location?.latitude && ipDetails.location?.longitude
            ? {
                type: 'Point',
                coordinates: [ipDetails.location?.longitude, ipDetails.location?.latitude]
              }
            : null,
        timezone: ipDetails.location?.time_zone || null
      }
    }
  }
  return null
}

function getBrowsingData({ browser, os, meta, platform, ipDetails }) {
  return {
    browser,
    os,
    platform,
    city: ipDetails?.city,
    country: ipDetails?.country,
    continent: ipDetails?.continent,
    coords: ipDetails?.coords,
    timezone: ipDetails?.timezone,
    meta
  }
}

function getPageData(requestBody) {
  const pageUrl = new URL(requestBody.page.fullpath)
  const page = {
    fullpath: requestBody.page.fullpath,
    path: pageUrl.pathname,
    hash: pageUrl.hash,
    title: requestBody.page.title,
    meta: requestBody.page.meta
  }
  if (pageUrl.search.trim().length) {
    page.query = Object.fromEntries(pageUrl.searchParams)
  }
  return page
}

function getUtmData(requestBody) {
  const pageUrl = new URL(requestBody.page.fullpath)
  if (pageUrl.search.trim().length) {
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
    const utm = {}
    pageUrl.searchParams.forEach((value, key) => {
      if (utmParams.includes(key)) {
        utm[key] = value
      }
    })
    return utm
  }
  return {}
}

export { getUserAgentDetails, getLocationFromIp, getBrowsingData, getPageData, getUtmData }
