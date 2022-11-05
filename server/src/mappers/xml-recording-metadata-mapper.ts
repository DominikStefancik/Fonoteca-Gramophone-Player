import { Logger } from 'pino';
import { AudioTrack } from '../models/audio-track';
import { MetadataType } from '../models/xml-metadata/metadata-type';
import { Recording } from '../models/recording';
import { RecordingCarrier } from '../models/recording-carrier';
import { ObjElement } from '../models/xml-metadata/obj-element';
import { ObjDetailElement } from '../models/xml-metadata/objDetail-element';
import { FNBase32Mono } from '../models/xml-metadata/root-element';
import { XmlElementIdentifier } from './xml-element-identifier';

const AUDIO_FILE_RESOURCE_BASE_URL = 'https://www.fonoteca.ch/imgs-mpn';
const IMAGE_FILE_RESOURCE_BASE_URL = 'https://www.fonoteca.ch/imgs-jpg';

export class XmlRecordingMetadataMapper {
  constructor(private readonly logger: Logger) {}

  public map(recordingMetadata: FNBase32Mono[]): Recording[] {
    return recordingMetadata.map((metadata) => {
      return this.mapSingleRecording(metadata.Objects[0].Obj[0]);
    });
  }

  private mapSingleRecording(recordingMetadata: ObjElement): Recording {
    const fileIdentifier = recordingMetadata.objCallNbr[0];
    this.logger.debug(`Mapping metadata: ${fileIdentifier}`);

    const title = fileIdentifier.startsWith(MetadataType.HR)
      ? this.findObjectDetailValue(recordingMetadata.objDetail, XmlElementIdentifier.CARRIER_TITLE)
      : undefined;
    const imageFileUrl = fileIdentifier.startsWith(MetadataType.HR)
      ? `${IMAGE_FILE_RESOURCE_BASE_URL}/${fileIdentifier}.0.JPG`
      : undefined;

    return {
      id: recordingMetadata.attributes.uniqueKey,
      title,
      carrier: this.getRecordingCarrier(recordingMetadata),
      recordLabel: this.findObjectDetailValue(
        recordingMetadata.objDetail,
        XmlElementIdentifier.RECORD_LABEL
      ),
      category: recordingMetadata.objSchema[0].objSchemaExtensionK[0].value,
      productionYear: this.findObjectDetailValue(
        recordingMetadata.objDetail,
        XmlElementIdentifier.PRODUCTION_YEAR
      ),
      musicalGenre: this.findObjectDetailValue(
        recordingMetadata.objDetail,
        XmlElementIdentifier.MUSICAL_GENRE
      ),
      tracks: this.getTracks(fileIdentifier, recordingMetadata.objDetail),
      collection: recordingMetadata.objItem[0].objItemCollectionK
        ? recordingMetadata.objItem[0].objItemCollectionK[0].value
        : undefined,
      dimension: this.findObjectDetailValue(
        recordingMetadata.objDetail,
        XmlElementIdentifier.DIMENSION
      ),
      recordingPlace: this.findObjectDetailValue(
        recordingMetadata.objDetail,
        XmlElementIdentifier.RECORDING_PLACE
      ),
      recordingLocality: this.findObjectDetailValue(
        recordingMetadata.objDetail,
        XmlElementIdentifier.RECORDING_LOCALITY
      ),
      imageFileUrl,
    };
  }

  private findObjectDetailValue(
    objectDetailList: ObjDetailElement[],
    identifier: XmlElementIdentifier
  ): string | undefined {
    const detailObject = objectDetailList.find(
      (object) => object.objDetailFieldK[0].value === identifier
    );

    return detailObject ? detailObject.objDetailValueR[0].value : undefined;
  }

  private getRecordingCarrier(objElement: ObjElement): RecordingCarrier {
    const fileIdentifier = objElement.objCallNbr[0];
    const conditionObject = objElement.objItem.find((itemObject) => itemObject.objItemCondition);

    const type2 = fileIdentifier.startsWith(MetadataType.HR)
      ? this.findObjectDetailValue(objElement.objDetail, XmlElementIdentifier.CARRIER_TYPE)
      : undefined;

    return {
      type1: objElement.objSchema[0].objSchemaFormatK[0].value,
      type2,
      material: this.findObjectDetailValue(objElement.objDetail, XmlElementIdentifier.MATERIAL),
      condition: conditionObject ? conditionObject.objItemCondition[0] : undefined,
    };
  }

  private getTracks(fileIdentifier: string, objectDetailList: ObjDetailElement[]): AudioTrack[] {
    const tracks: AudioTrack[] = [];
    const allAudioTracks = objectDetailList.filter(
      (object) => object.objDetailFieldK[0].value === XmlElementIdentifier.AUDIO_TRACK
    );
    const groupIdList = allAudioTracks.map((trackObject) => {
      const value = trackObject.objDetailGrp[0];

      return value.split('.')[0];
    });

    for (const id of groupIdList) {
      const trackDetailsObjectList = objectDetailList.filter((object) =>
        object.objDetailGrp[0].startsWith(id)
      );

      const indexAudio = this.findObjectDetailValue(
        trackDetailsObjectList,
        XmlElementIdentifier.INDEX_AUDIO
      );
      const audioTrack = this.findObjectDetailValue(
        trackDetailsObjectList,
        XmlElementIdentifier.AUDIO_TRACK
      );

      const audioFileUrls: string[] = [];

      if (indexAudio) {
        const indices = indexAudio.split(';').map((index) => index.trim());

        for (const index of indices) {
          audioFileUrls.push(`${AUDIO_FILE_RESOURCE_BASE_URL}/${fileIdentifier}_${index}.mp3`);
        }
      } else {
        audioFileUrls.push(`${AUDIO_FILE_RESOURCE_BASE_URL}/${fileIdentifier}_${audioTrack}.mp3`);
      }

      const recordingTrack = {
        author: this.findObjectDetailValue(trackDetailsObjectList, XmlElementIdentifier.AUTHOR),
        musicalWorkTitle: this.findObjectDetailValue(
          trackDetailsObjectList,
          XmlElementIdentifier.MUSICAL_WORK_TITLE
        ),
        recordingTime: this.findObjectDetailValue(
          trackDetailsObjectList,
          XmlElementIdentifier.RECORDING_TIME
        ),
        indexAudio,
        audioFileUrls,
      };

      tracks.push(recordingTrack);
    }

    return tracks;
  }
}
