import * as fs from 'fs';
import { Logger } from 'pino';
import * as xml2js from 'xml2js';

interface XmlFileTransformerConfig {
  attrkey: string;
  normalize: boolean;
  charkey: string;
}

export class XmlFileTransformer {
  public constructor(
    private readonly config: XmlFileTransformerConfig,
    private readonly logger: Logger
  ) {}

  public transformFiles<T>(filePathList: string[], rootElement?: string): T[] {
    const xmlParser = new xml2js.Parser(this.config);
    const parserFiles: T[] = [];

    for (const filePath of filePathList) {
      this.logger.debug(`Parsing file: ${filePath}`);

      const xml = fs.readFileSync(filePath, { encoding: 'utf8' });

      xmlParser.parseString(xml, (error, data) => {
        if (error) {
          this.logger.error(error);
        }

        parserFiles.push(rootElement ? data[rootElement] : data);
      });
    }

    this.logger.debug(`Parsing files finished. Number of parsed files: ${parserFiles.length}`);

    return parserFiles;
  }
}
