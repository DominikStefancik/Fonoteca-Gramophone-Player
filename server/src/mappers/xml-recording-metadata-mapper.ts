import fs from 'fs';
import { Logger } from 'pino';
import { AudioTrack } from '../model/audio-track';
import { MetadataFileType } from '../model/metadata-file-type';
import { Recording } from '../model/recording';
import { RecordingCarrier } from '../model/recording-carrier';
import { XmlObjectIdentifier } from './xml-object-identifier';

const AUDIO_FILE_RESOURCE_BASE_URL = 'https://www.fonoteca.ch/imgs-mpn';
const IMAGE_FILE_RESOURCE_BASE_URL = 'https://www.fonoteca.ch/imgs-jpg';

export class XmlRecordingMetadataMapper {
  constructor(private readonly logger: Logger) {}

  public map(recordingMetadata: any[]): Recording[] {
    return recordingMetadata.map((metadata) =>
      this.mapSingleRecording(metadata.FNBase32Mono.Objects[0].Obj[0])
    );
  }

  private mapSingleRecording(recordingMetadata: any): Recording {
    const fileIdentifier = recordingMetadata.objCallNbr[0];
    this.logger.debug(`Mapping metadata: ${fileIdentifier}`);

    const title = fileIdentifier.startsWith(MetadataFileType.HR)
      ? this.findObjectDetailValue(recordingMetadata.objDetail, XmlObjectIdentifier.CARRIER_TITLE)
      : undefined;
    const imageFileUrl = fileIdentifier.startsWith(MetadataFileType.HR)
      ? `${IMAGE_FILE_RESOURCE_BASE_URL}/${fileIdentifier}.0.JPG`
      : undefined;

    return {
      id: recordingMetadata.$.uniqueKey,
      title,
      carrier: this.getRecordingCarrier(recordingMetadata),
      recordLabel: this.findObjectDetailValue(
        recordingMetadata.objDetail,
        XmlObjectIdentifier.RECORD_LABEL
      ),
      category: recordingMetadata.objSchema[0].objSchemaExtensionK[0]._,
      productionYear: this.findObjectDetailValue(
        recordingMetadata.objDetail,
        XmlObjectIdentifier.PRODUCTION_YEAR
      ),
      musicalGenre: this.findObjectDetailValue(
        recordingMetadata.objDetail,
        XmlObjectIdentifier.MUSICAL_GENRE
      ),
      tracks: this.getTracks(fileIdentifier, recordingMetadata.objDetail),
      collection: recordingMetadata.objItem[0].objItemCollectionK
        ? recordingMetadata.objItem[0].objItemCollectionK[0]._
        : undefined,
      dimension: this.findObjectDetailValue(
        recordingMetadata.objDetail,
        XmlObjectIdentifier.DIMENSION
      ),
      recordingPlace: this.findObjectDetailValue(
        recordingMetadata.objDetail,
        XmlObjectIdentifier.RECORDING_PLACE
      ),
      recordingLocality: this.findObjectDetailValue(
        recordingMetadata.objDetail,
        XmlObjectIdentifier.RECORDING_LOCALITY
      ),
      imageFileUrl,
    };
  }

  private findObjectDetailValue(
    objectDetailList: any[],
    identifier: XmlObjectIdentifier
  ): string | undefined {
    const detailObject = objectDetailList.find(
      (object) => object.objDetailFieldK[0]._ === identifier
    );

    return detailObject ? detailObject.objDetailValueR[0]._ : undefined;
  }

  private getRecordingCarrier(recordingMetadata: any): RecordingCarrier {
    const fileIdentifier = recordingMetadata.objCallNbr[0];
    const conditionObject = recordingMetadata.objItem.find(
      (itemObject) => itemObject.objItemCondition
    );

    const type2 = fileIdentifier.startsWith(MetadataFileType.HR)
      ? this.findObjectDetailValue(recordingMetadata.objDetail, XmlObjectIdentifier.CARRIER_TYPE)
      : undefined;

    return {
      type1: recordingMetadata.objSchema[0].objSchemaFormatK[0]._,
      type2,
      material: this.findObjectDetailValue(
        recordingMetadata.objDetail,
        XmlObjectIdentifier.MATERIAL
      ),
      condition: conditionObject ? conditionObject.objItemCondition[0] : undefined,
    };
  }

  private getTracks(fileIdentifier: string, objectDetailList: any[]): AudioTrack[] {
    const tracks: AudioTrack[] = [];
    const allAudioTracks = objectDetailList.filter(
      (object) => object.objDetailFieldK[0]._ === XmlObjectIdentifier.AUDIO_TRACK
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
        XmlObjectIdentifier.INDEX_AUDIO
      );
      const audioTrack = this.findObjectDetailValue(
        trackDetailsObjectList,
        XmlObjectIdentifier.AUDIO_TRACK
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
        author: this.findObjectDetailValue(trackDetailsObjectList, XmlObjectIdentifier.AUTHOR),
        musicalWorkTitle: this.findObjectDetailValue(
          trackDetailsObjectList,
          XmlObjectIdentifier.MUSICAL_WORK_TITLE
        ),
        recordingTime: this.findObjectDetailValue(
          trackDetailsObjectList,
          XmlObjectIdentifier.RECORDING_TIME
        ),
        indexAudio,
        audioFileUrls,
      };

      tracks.push(recordingTrack);
    }

    return tracks;
  }
}
