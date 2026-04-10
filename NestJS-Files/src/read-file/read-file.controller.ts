import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ReadFileService } from './read-file.service';
import { Response, Request } from 'express';
@Controller('read-file')
export class ReadFileController {
  constructor(private readonly readServiceFile: ReadFileService) {
    this.readServiceFile = readServiceFile;
  }
  @Get(':folderId')
  async findFile(@Param('folderId') folderId: string) {
    return await this.readServiceFile.findFile(folderId);
  }
  @Get('profile/:folderId')
  async findProfile(@Param('folderId') folderId: string) {
    return await this.readServiceFile.findProfile(folderId);
  }
}
