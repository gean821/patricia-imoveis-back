import { AlertaImovelResponseDto } from '../presentation/dto/alerta-response.dtos';

export function mapAlertaToResponse(): AlertaImovelResponseDto {
  return { recebido: true };
}
