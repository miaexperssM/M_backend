import axios from 'axios';
import { GOOGLE_API_KEY } from 'config/environments';

const apiKey = GOOGLE_API_KEY;

export async function geoCodeingByGoogle(place: string, countryCode: string | undefined) {
  const addressInURI = encodeURIComponent(place);
  const searchQuery = `address=${addressInURI}&inputtype=textquery&${
    countryCode !== undefined ? `region=${countryCode}` : ``
  }&key=${apiKey}`;
  let url = `https://maps.googleapis.com/maps/api/geocode/json?${searchQuery}`;

  try {
    const response = await axios.get(url);
    if (response.status === 200 && response.data.status === 'OK') {
      return response.data.results;
    } else {
      console.log('geoCode by Goolge response not 200 or OK');
      return [];
    }
  } catch (err) {
    console.log('geoCode Error', err);
    return undefined;
  }
}

export async function findPlaceByGoogle(place: string, countryCode: string | undefined) {
  const addressInURI = encodeURIComponent(place);
  const searchQuery = `fields=formatted_address%2Cplace_id%2Cgeometry&input=${addressInURI}&inputtype=textquery&key=${apiKey}`;
  let url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${searchQuery}`;

  try {
    const response = await axios.get(url);
    if (response.status === 200 && response.data.status === 'OK') {
      return response.data.candidates;
    } else {
      console.log('find place by Goolge response not 200 or OK');
      return [];
    }
  } catch (err) {
    console.log('find place Error', err);
    return undefined;
  }
}

export async function findPlaceById(placeId: string) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
  try {
    const response = await axios.get(url);
    if (response.status === 200 && response.data.status === 'OK') {
      return response.data.results;
    } else return undefined;
  } catch (err) {
    console.log('findPlaceById Error', err);
    return undefined;
  }
}
