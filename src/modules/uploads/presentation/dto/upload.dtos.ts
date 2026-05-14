import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteFileDto {
  @IsString()
  @IsNotEmpty()
  key: string;
}

export class UploadFileResponseDto {
  key: string;
  url: string;
}
