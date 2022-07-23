import axios from 'axios';
import { GOOGLE_API_KEY } from 'config/environments';

const apiKey = GOOGLE_API_KEY;

export async function geoCodeing(place: string) {
  const addressInURI = encodeURIComponent(place)
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${addressInURI}&key=${apiKey}`;

  console.log("url", addressInURI, url)

  try {
    const response = await axios.get(url);
    if (response.status === 200 && response.data.status === 'OK') {
        console.log("result", JSON.stringify(response.data.results))
      return response.data.results;
    } else return undefined;
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
    console.log('geoCoding Error', err);
    return undefined;
  }
}
