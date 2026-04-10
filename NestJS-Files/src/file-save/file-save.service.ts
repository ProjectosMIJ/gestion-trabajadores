import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fsPromise from 'fs/promises';
import * as fs from 'fs';
import path, { join } from 'path';
@Injectable()
export class FileSaveService {
  async saveOneFile(file: Express.Multer.File, folderId: string) {
    try {
      const folderOriginTemp = join(__dirname, '..', '..', 'uploads', 'temp');
      const dest = join(__dirname, '..', '..', 'uploads', folderId);
      const destFinal = join(dest, file.originalname);
      await fsPromise.mkdir(dest, { recursive: true });
      await fsPromise.rename(
        join(folderOriginTemp, file.originalname),
        destFinal,
      );
    } catch (error) {
      throw new HttpException(
        'Error Al Mover El Archivo',
        HttpStatus.AMBIGUOUS,
      );
    }
    return { message: 'Archivo Guardado', status: HttpStatus.OK };
  }

  async saveProfile(file: Express.Multer.File, folderId: string) {
    try {
      const folderOriginTemp = join(__dirname, '..', '..', 'uploads', 'temp');
      const dest = join(__dirname, '..', '..', 'uploads', folderId, 'profile');
      const destFinal = join(dest, file.originalname);
      await fsPromise.mkdir(dest, { recursive: true });
      await fsPromise.rename(
        join(folderOriginTemp, file.originalname),
        destFinal,
      );
    } catch (error) {
      throw new HttpException(
        'Error Al Mover El Archivo',
        HttpStatus.AMBIGUOUS,
      );
    }
    return { message: 'Archivo Guardado', status: HttpStatus.OK };
  }
}
