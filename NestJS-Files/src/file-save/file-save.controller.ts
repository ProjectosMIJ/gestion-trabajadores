import {
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import * as fsPromise from 'fs/promises';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { FileSaveService } from './file-save.service';
import { FileValidationPipePipe } from './file-validation-pipe/file-validation-pipe.pipe';
import { diskStorage } from 'multer';
import { join } from 'path';

@Controller('file-save')
export class FileSaveController {
  constructor(private readonly fileSaveService: FileSaveService) {
    this.fileSaveService = fileSaveService;
  }
  @Post('/upload/:folderId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: `./uploads/temp`,
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  async saveOneFile(
    @UploadedFile(new FileValidationPipePipe()) file: Express.Multer.File,
    @Param('folderId') folderId: string,
  ) {
    return this.fileSaveService.saveOneFile(file, folderId);
  }
  @Post('/upload/profile/:folderId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: `./uploads/temp`,
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  async saveProfile(file: Express.Multer.File, folderId: string) {
    try {
      const uploadsBase = process.cwd();
      const folderOriginTemp = join(uploadsBase, 'uploads', 'temp');
      const dest = join(uploadsBase, 'uploads', folderId, 'profile');

      console.log(
        'Origen temporal:',
        join(folderOriginTemp, file.originalname),
      );
      console.log('Destino final:', join(dest, file.originalname));

      // Asegurar que el directorio temporal existe
      await fsPromise.mkdir(folderOriginTemp, { recursive: true });

      // Asegurar que el directorio destino existe
      await fsPromise.mkdir(dest, { recursive: true });

      const tempFilePath = join(folderOriginTemp, file.originalname);
      const destFinal = join(dest, file.originalname);

      // Verificar si el archivo existe en temp
      try {
        await fsPromise.access(tempFilePath);
      } catch (error) {
        console.error('Archivo temporal no encontrado:', tempFilePath);
        // Si no está en temp, podría estar en otro lugar (depende de tu config de Multer)
        // Intentar buscar en el path donde Multer lo guardó
        if (file.path) {
          // file.path es donde Multer guardó temporalmente el archivo
          await fsPromise.rename(file.path, destFinal);
          return { message: 'Archivo Guardado', status: HttpStatus.OK };
        }
        throw new HttpException(
          'Archivo temporal no encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      // Mover el archivo
      await fsPromise.rename(tempFilePath, destFinal);

      console.log('Archivo movido exitosamente');

      return {
        message: 'Archivo Guardado',
        status: HttpStatus.OK,
        path: destFinal,
      };
    } catch (error) {
      console.error('Error detallado en saveProfile:', error);
      throw new HttpException(
        `Error Al Mover El Archivo: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/upload/:folderId/recipe/delivery')
  @UseInterceptors(
    FilesInterceptor('delivery', 1, {
      storage: diskStorage({
        destination: `./uploads/temp/arrayFiles`,
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  async saveArrayFileDelivery(
    @UploadedFiles(new FileValidationPipePipe())
    delivery: Array<Express.Multer.File>,
    @Param('folderId') folderId: string,
  ) {
    return this.fileSaveService.saveArrayFilesDelivery(delivery, folderId);
  }

  @Post('/upload/:folderId/recipe-medical')
  @UseInterceptors(
    FilesInterceptor('recipe', 5, {
      storage: diskStorage({
        destination: `./uploads/temp/arrayFiles`,
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  async saveArrayFileMedical(
    @UploadedFiles(new FileValidationPipePipe())
    recipe: Array<Express.Multer.File>,
    @Param('folderId') folderId: string,
  ) {
    return this.fileSaveService.saveArrayFilesMedical(recipe, folderId);
  }

  @Post('/upload/:folderId/recipe/delivery-medical')
  @UseInterceptors(
    FilesInterceptor('delivery', 1, {
      storage: diskStorage({
        destination: `./uploads/temp/arrayFiles`,
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  async saveArrayFileDeliveryMedical(
    @UploadedFiles(new FileValidationPipePipe())
    delivery: Array<Express.Multer.File>,
    @Param('folderId') folderId: string,
  ) {
    return this.fileSaveService.saveArrayFileDeliveryMedical(
      delivery,
      folderId,
    );
  }
}
