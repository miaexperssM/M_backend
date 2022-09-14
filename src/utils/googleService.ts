import axios from 'axios';
import { GOOGLE_API_KEY } from 'config/environments';

const apiKey = GOOGLE_API_KEY;

export async function geoCodeing(place: string, countryCode: string | undefined) {
  const addressInURI = encodeURIComponent(place);
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${addressInURI}&key=${apiKey}`;

  if (countryCode) {
    url = `https://maps.googleapis.com/maps/api/geocode/json?components=country:${countryCode}&address=${addressInURI}&key=${apiKey}`;
  }

  try {
    const response = await axios.get(url);
    if (response.status === 200 && response.data.status === 'OK') {
      return response.data.results;
    } else {
      console.log('get geoCoding by Goolge response not 200 or OK');
      return [];
    }
  } catch (err) {
    console.log('geoCoding Error', err);
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
