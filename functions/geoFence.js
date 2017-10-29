const getDist = (location1, location2, radiusUnits) => {

  flatSet = [];
  flatSet.push(...Object.values(location1));
  flatSet.push(...Object.values(location2));
  flatSet.push(radiusUnits);

  const haversineDistance = (lat1, long1, lat2, long2, radiusUnits) => {

    const radius = {
      'feet' : 20908800,
      'yards' : 6969600,
      'miles' : 3960,
      'mi': 3960,
      'kilometers' : 6371,
      'km' : 6371,
      'meters' : 6371000
    }

    radiusVal = radius[radiusUnits];


    const toRadians = (degree) => (degree * (Math.PI / 180))
    let radianLat1 = toRadians(lat1);
		let radianLong1 = toRadians(long1);
		let radianLat2 = toRadians(lat2);
		let radianLong2 = toRadians(long2);
		let radianDistanceLat = radianLat1 - radianLat2;
		let radianDistanceLong = radianLong1 - radianLong2;
		let sinLat = Math.sin(radianDistanceLat / 2.0);
		let sinLong = Math.sin(radianDistanceLong / 2.0);
		let a = Math.pow(sinLat, 2.0) + Math.cos(radianLat1) * Math.cos(radianLat2) * Math.pow(sinLong, 2.0);
		let distance = radiusVal * 2 * Math.asin(Math.min(1, Math.sqrt(a)));

		return distance;
  }

  return haversineDistance(...flatSet);
}

const rc = {lat: 40.720720, lon: -74.000850} // RC location
const osaka = {lat: 34.6603, lon: 135.5232} // japan osaka location
const duaneReadeRC = {lat: 40.720968, lon: -74.00090} // duane reade by RC location


console.log(
  getDist(rc, duaneReadeRC, 'feet'), //=> 91.55243800126743 ft
  getDist(rc, osaka, 'feet') //=> 36445881.399097115 ft
);
