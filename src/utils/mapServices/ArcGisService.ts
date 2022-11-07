import axios from 'axios';
import { ARCGIS_API_KEY } from 'config/environments';

const apiKey = ARCGIS_API_KEY;

const sampleReturnJson = {
  spatialReference: { wkid: 4326, latestWkid: 4326 },
  candidates: [
    {
      address: 'Calle Santos Dumont 560, Recoleta, Santiago, Región Metropolitana de Santiago, 8420000',
      location: { x: -70.644199297963112, y: -33.422179530380369 },
      score: 98.569999999999993,
      attributes: {},
      extent: {
        xmin: -70.645199297963117,
        ymin: -33.423179530380366,
        xmax: -70.643199297963108,
        ymax: -33.421179530380371,
      },
    },
    {
      address: 'Calle Santos Dumont, Independencia, Santiago, Región Metropolitana de Santiago, 8380000',
      location: { x: -70.653925455171333, y: -33.420913411071766 },
      score: 86.650000000000006,
      attributes: {},
      extent: {
        xmin: -70.654925455171337,
        ymin: -33.421913411071763,
        xmax: -70.652925455171328,
        ymax: -33.419913411071768,
      },
    },
    {
      address: 'Calle Santos, San Miguel, Santiago, Región Metropolitana de Santiago, 8900000',
      location: { x: -70.640242373720625, y: -33.509652627339008 },
      score: 83.890000000000001,
      attributes: {},
      extent: {
        xmin: -70.64124237372063,
        ymin: -33.510652627339006,
        xmax: -70.63924237372062,
        ymax: -33.508652627339011,
      },
    },
    {
      address: 'Recoleta, Santiago, Región Metropolitana de Santiago',
      location: { x: -70.642939999999953, y: -33.401689999999974 },
      score: 83.859999999999999,
      attributes: {},
      extent: {
        xmin: -70.669939999999954,
        ymin: -33.428689999999975,
        xmax: -70.615939999999952,
        ymax: -33.374689999999973,
      },
    },
  ],
};

export async function searchAddressByARCGIS(place: string, countryCode: string | undefined) {
  const addressInURI = encodeURIComponent(place);
  const searchQuery = `singleLine=${addressInURI}&f=json&${
    countryCode !== undefined ? `countryCode=${countryCode}` : ``
  }&token=${apiKey}`;
  let url = `https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?${searchQuery}`;

  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const json = response.data.candidates
        .sort((a, b) => b.score - a.score)
        .map(candidate => {
          return {
            Location: {
              DisplayPosition: { Latitude: candidate.location.y, Longitude: candidate.location.x },
              Extent: candidate.extent,
            },
            address: candidate.address || '',
            score: candidate.score || 0,
          };
        });
      return json;
    } else {
      console.log('placeSearch by ARCGIS response not 200');
      return [];
    }
  } catch (err) {
    console.log('placeSearch Error', err);
    return undefined;
  }
}
