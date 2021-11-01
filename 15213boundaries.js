const csv = require('csv-parse');
const fs = require('fs/promises');
const parseCSV = require('util').promisify(csv);
const wkt = require('wkt');

const getCSVFile = (filename) => fs.readFile(filename).then(parseCSV);

const main = () => {
  return Promise.all([ getCSVFile('./15213parcels.csv'), getCSVFile('./alleghenycounty_parcels202109.csv') ])
  .then(([ parcels, parcelBoundaries ]) => {
    const parcelIDs = parcels.map((p) => p[0]);

    const oaklandBoundaries = parcelBoundaries
    .filter((boundary) => parcelIDs.includes(boundary[0]))
    .map((b) => {
      return {
        type: "Feature",
        properties: {
          name: b[0],
          ownerAddress: parcels.find((p) => p[0] === b[0])[1]
        },
        geometry: wkt.parse(b[8])
      };

    });

    return fs.writeFile('15213boundaries.json', JSON.stringify(oaklandBoundaries));
  });
};

main().then(() => console.log('Done!'));
