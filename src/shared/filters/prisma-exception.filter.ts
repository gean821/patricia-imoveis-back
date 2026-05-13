import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro inesperado no banco de dados';
    let error = 'DatabaseError';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[] | undefined)?.join(', ');
        message = target ? `Já existe um registro com ${target}` : 'Registro duplicado';
        error = 'ConflictError';
        break;
      }
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Registro não encontrado';
        error = 'NotFoundError';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Violação de chave estrangeira';
        error = 'ForeignKeyError';
        break;
      case 'P2014':
        status = HttpStatus.BAD_REQUEST;
        message = 'Relação inválida';
        error = 'RelationError';
        break;
      default:
        this.logger.error(`Prisma ${exception.code}: ${exception.message}`);
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      code: exception.code,
    });
  }
}