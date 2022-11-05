import * as fs from 'fs';
import { Logger } from 'pino';
import * as xml2js from 'xml2js';

export class XmlFileTransformer {
  public constructor(private readonly logger: Logger) {}

  public transformFiles(filePathList: string[]): any[] {
    const xmlParser = new xml2js.Parser();
    const parserFiles = [];

    for (const filePath of filePathList) {
      this.logger.debug(`Parsing file: ${filePath}`);

      const xml = fs.readFileSync(filePath, { encoding: 'utf8' });

      xmlParser.parseString(xml, (error, data) => {
        if (error) {
          this.logger.error(error);
        }

        parserFiles.push(data);
      });
    }

    this.logger.debug(`Parsing files finished. Number of parsed files: ${parserFiles.length}`);

    return parserFiles;
  }
}
