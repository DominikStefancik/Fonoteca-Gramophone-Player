import * as fs from 'fs';
import * as path from 'path';

import { getLogger } from './logging/logger';
import { XmlRecordingMetadataMapper } from './mappers/xml-recording-metadata-mapper';
import { FNBase32Mono } from './models/xml-metadata/root-element';
import { XmlFileTransformer } from './transformers/xml-file-transformer';

const logger = getLogger(process.env.MODULE_NAME);

const xmlFileTransformer = new XmlFileTransformer(
  {
    attrkey: 'attributes',
    normalize: true,
    charkey: 'value',
  },
  logger
);
const mapper = new XmlRecordingMetadataMapper(logger);
const folder = '';
const outputFile = 'gramophone_recordings.json';

const fileList = fs
  .readdirSync(path.join(folder, 'EN'))
  .map((file) => path.join(folder, 'EN', file));
fileList.shift();

const metadataObjects = xmlFileTransformer.transformFiles<FNBase32Mono>(fileList, 'FNBase32Mono');
const recordingList = mapper.map(metadataObjects);

fs.writeFileSync(path.join(folder, outputFile), JSON.stringify(recordingList, null, 2));

logger.info(`Finished processing of metadata files into JSON format. Output file: ${outputFile}`);
