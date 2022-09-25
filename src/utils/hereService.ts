import axios from 'axios';
import { HERE_API_KEY } from 'config/environments';

const apiKey = HERE_API_KEY;

const sampleViewJson = {
  _type: 'SearchResultsViewType',
  ViewId: 0,
  Result: [
    {
      Relevance: 0.56,
      MatchLevel: 'street',
      MatchQuality: { Country: 1.0, State: 0.87, County: 1.0, City: 1.0, Street: [0.9] },
      Location: {
        LocationId: 'NT_suk6zU9PbiaKZeR4CISumA',
        LocationType: 'point',
        DisplayPosition: { Latitude: -33.53595, Longitude: -70.56172 },
        NavigationPosition: [{ Latitude: -33.53595, Longitude: -70.56172 }],
        MapView: {
          TopLeft: { Latitude: -33.53533, Longitude: -70.56176 },
          BottomRight: { Latitude: -33.53653, Longitude: -70.56152 },
        },
        Address: {
          Label: 'Calle Centro, 8240000 La Florida, Region Santiago Metropolitan, Chile',
          Country: 'CHL',
          State: 'Region Santiago Metropolitan',
          County: 'Santiago',
          City: 'La Florida',
          District: 'La Florida',
          Street: 'Calle Centro',
          PostalCode: '8240000',
          AdditionalData: [
            { value: 'Chile', key: 'CountryName' },
            { value: 'Region Santiago Metropolitan', key: 'StateName' },
            { value: 'Santiago', key: 'CountyName' },
          ],
        },
      },
    },
  ],
};

export async function geoCodeingByHERE(place: string, countryCode: string | undefined) {
  const addressInURI = encodeURIComponent(place);
  const searchQuery_v7 = `q=${addressInURI}&apiKey=${apiKey}`;
  let url_v7 = `https://geocode.search.hereapi.com/v1/geocode??${searchQuery_v7}`;

  const searchQuery_v6 = `languages=en-US&maxresults=1&searchtext=${addressInURI}&apiKey=${apiKey}`;
  let url_v6 = `https://geocoder.ls.hereapi.com/search/6.2/geocode.json?${searchQuery_v6}`;

  try {
    const response = await axios.get(url_v6);
    if (response.status === 200 && response.data.Response.View) {
      // return response.data.items;
      return response.data.Response.View;
    } else {
      console.log('find place by HERE response not OK');
      return [];
    }
  } catch (err) {
    console.log('find place Error', err);
    return undefined;
  }
}

export async function findPlaceById(placeId: string) {
  const url = `https://lookup.search.hereapi.com/v1/lookup?id=${placeId}&apiKey=${apiKey}`;
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      return response.data;
    } else return undefined;
  } catch (err) {
    console.log('findPlaceById Error', err);
    return undefined;
  }
}
