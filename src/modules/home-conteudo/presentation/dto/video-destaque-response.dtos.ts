export class VideoDestaqueResponseDto {
  id: string;
  titulo: string;
  url: string;
  storageKey: string;
  capaUrl: string | null;
  ordem: number;
  ativo: boolean;
  createdAt: Date;
}
