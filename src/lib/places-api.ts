'use client'

// Types for the new Google Places API
export interface PlaceAutocompleteRequest {
  input: string
  sessionToken: string
  includedPrimaryTypes?: string[]
  includedRegionCodes?: string[]
  locationBias?: {
    circle?: {
      center: { latitude: number; longitude: number }
      radius: number
    }
    rectangle?: {
      low: { latitude: number; longitude: number }
      high: { latitude: number; longitude: number }
    }
  }
  locationRestriction?: {
    circle?: {
      center: { latitude: number; longitude: number }
      radius: number
    }
    rectangle?: {
      low: { latitude: number; longitude: number }
      high: { latitude: number; longitude: number }
    }
  }
  inputOffset?: number
  languageCode?: string
  regionCode?: string
}

export interface PlacePrediction {
  place: string // Place ID
  placeId: string // Place ID (extracted from place resource name)
  text: {
    text: string
    matches: Array<{
      endOffset: number
    }>
  }
  structuredFormat?: {
    mainText: {
      text: string
      matches: Array<{
        endOffset: number
      }>
    }
    secondaryText?: {
      text: string
    }
  }
  types: string[]
}

export interface QueryPrediction {
  text: {
    text: string
    matches: Array<{
      endOffset: number
    }>
  }
}

export interface AutocompleteResponse {
  suggestions: Array<{
    placePrediction?: PlacePrediction
    queryPrediction?: QueryPrediction
  }>
}

export interface PlaceDetailsRequest {
  placeId: string
  sessionToken: string
  languageCode?: string
  regionCode?: string
}

export interface PlaceDetails {
  id: string
  name: string
  displayName: {
    text: string
    languageCode: string
  }
  formattedAddress: string
  addressComponents: Array<{
    longText: string
    shortText: string
    types: string[]
    languageCode: string
  }>
  location: {
    latitude: number
    longitude: number
  }
  types: string[]
}

/**
 * Makes a request to the Google Places API (New) Autocomplete endpoint
 */
export async function fetchAutocomplete(request: PlaceAutocompleteRequest): Promise<AutocompleteResponse> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error('Google Maps API key not configured')
  }

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'suggestions.placePrediction.place,suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.types,suggestions.queryPrediction.text'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Places API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    // Extract place IDs from resource names (format: places/PLACE_ID)
    if (data.suggestions) {
      data.suggestions.forEach((suggestion: { placePrediction?: { place?: string; placeId?: string } }) => {
        if (suggestion.placePrediction?.place) {
          const placeResourceName = suggestion.placePrediction.place
          const placeId = placeResourceName.replace('places/', '')
          suggestion.placePrediction.placeId = placeId
        }
      })
    }

    return data
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error)
    throw error
  }
}

/**
 * Makes a request to the Google Places API (New) Place Details endpoint
 */
export async function fetchPlaceDetails(request: PlaceDetailsRequest): Promise<PlaceDetails> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error('Google Maps API key not configured')
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${request.placeId}`
    const params = new URLSearchParams()
    if (request.sessionToken) {
      params.append('sessionToken', request.sessionToken)
    }
    if (request.languageCode) {
      params.append('languageCode', request.languageCode)
    }
    if (request.regionCode) {
      params.append('regionCode', request.regionCode)
    }

    const fullUrl = params.toString() ? `${url}?${params.toString()}` : url

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,name,displayName,formattedAddress,addressComponents,location,types'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Place Details API error: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching place details:', error)
    throw error
  }
}

/**
 * Debounce utility for API requests
 */
export function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}