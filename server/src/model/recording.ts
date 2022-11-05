import { RecordingCarrier } from './recording-carrier';
import { AudioTrack } from './audio-track';

export interface Recording {
  id: string;
  carrier: RecordingCarrier;
  title?: string;
  recordLabel: string;
  category?: string;
  productionYear?: string;
  musicalGenre: string;
  tracks?: AudioTrack[];
  collection: string;
  dimension?: string;
  recordingLocality?: string;
  recordingPlace?: string;
  imageFileUrl?: string;
}
