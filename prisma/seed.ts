import {
  PrismaClient,
  Role,
  TipoImovel,
  Finalidade,
  StatusImovel,
  TipoInteracao,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Foto servida pelo front em /public/images/imoveis (caminho relativo —
 * o next/image carrega do próprio domínio da vitrine).
 */
function foto(n: number, ordem: number, legenda: string) {
  const file = `imovel-${String(n).padStart(2, '0')}.jpeg`;
  return {
    url: `/images/imoveis/${file}`,
    storageKey: `seed/${file}`,
    legenda,
    ordem,
    isCapa: ordem === 0,
  };
}

interface ImovelSeed {
  codigo: string;
  titulo: string;
  descricao: string;
  tipo: TipoImovel;
  finalidade: Finalidade;
  status: StatusImovel;
  destaque: boolean;
  endereco: string;
  numero?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep?: string;
  valor: number;
  valorCondominio?: number;
  valorIptu?: number;
  area: number;
  areaTotal?: number;
  quartos?: number;
  suites?: number;
  banheiros?: number;
  vagas?: number;
  anoConstrucao?: number;
  mobiliado?: boolean;
  caracteristicas: string[];
  fotos: ReturnType<typeof foto>[];
}

const imoveis: ImovelSeed[] = [
  {
    // Imóvel real da Patricia (Zona 03) — fotos enviadas pela cliente.
    codigo: 'CO203',
    titulo: 'Cobertura 3 suítes com lazer de resort na Zona 03',
    descricao:
      'Uma cobertura perfeita pra quem sonha viver no topo! 147 m² privativos (273 m² total), 3 suítes, 3 vagas e pé-direito elevado. Lazer completo: quadra de beach tênis, piscina externa, piscina coberta e aquecida, garden gourmet com piscina privativa, espaço gourmet com churrasqueira, sports bar, fitness center, playground externo, brinquedoteca, quadra poliesportiva e espaço cross. Localização nobre na Zona 03 de Maringá.',
    tipo: TipoImovel.COBERTURA,
    finalidade: Finalidade.VENDA,
    status: StatusImovel.DISPONIVEL,
    destaque: true,
    endereco: 'Avenida São Paulo',
    bairro: 'Zona 03',
    cidade: 'Maringá',
    estado: 'PR',
    cep: '87013-000',
    valor: 2295000,
    area: 147,
    areaTotal: 273,
    quartos: 3,
    suites: 3,
    banheiros: 4,
    vagas: 3,
    anoConstrucao: 2023,
    caracteristicas: [
      'Pé-direito elevado',
      'Quadra de beach tênis',
      'Piscina externa',
      'Piscina coberta e aquecida',
      'Garden gourmet com piscina privativa',
      'Espaço gourmet com churrasqueira',
      'Sports bar',
      'Fitness center',
      'Playground externo',
      'Brinquedoteca',
      'Quadra poliesportiva',
      'Espaço cross',
    ],
    fotos: [
      foto(1, 0, 'Living com pé-direito elevado'),
      foto(2, 1, 'Ambientes integrados'),
      foto(3, 2, 'Cozinha gourmet'),
      foto(4, 3, 'Suíte master'),
      foto(5, 4, 'Garden gourmet com piscina privativa'),
      foto(6, 5, 'Piscina externa'),
      foto(7, 6, 'Piscina coberta e aquecida'),
      foto(8, 7, 'Espaço gourmet'),
      foto(9, 8, 'Fitness center'),
      foto(10, 9, 'Quadra de beach tênis'),
    ],
  },
  {
    codigo: 'AP1001',
    titulo: 'Apartamento 3 quartos com lazer completo na Zona 7',
    descricao:
      'Apartamento amplo e arejado na Zona 7, com 3 quartos sendo 1 suíte, sacada com churrasqueira e vista livre. Condomínio com piscina, academia e portaria 24h. Próximo a comércios, escolas e ao Parque do Ingá.',
    tipo: TipoImovel.APARTAMENTO,
    finalidade: Finalidade.VENDA,
    status: StatusImovel.DISPONIVEL,
    destaque: true,
    endereco: 'Av. Mandacaru',
    numero: '1450',
    bairro: 'Zona 7',
    cidade: 'Maringá',
    estado: 'PR',
    cep: '87020-000',
    valor: 650000,
    valorCondominio: 480,
    valorIptu: 1200,
    area: 92,
    areaTotal: 110,
    quartos: 3,
    suites: 1,
    banheiros: 2,
    vagas: 2,
    anoConstrucao: 2019,
    caracteristicas: ['Piscina', 'Academia', 'Portaria 24h', 'Salão de festas', 'Sacada gourmet'],
    fotos: [
      foto(11, 0, 'Sala de estar integrada'),
      foto(12, 1, 'Cozinha'),
      foto(13, 2, 'Quarto'),
    ],
  },
  {
    codigo: 'CA1002',
    titulo: 'Casa térrea 3 quartos com edícula no Jardim Alvorada',
    descricao:
      'Casa térrea bem conservada no Jardim Alvorada, 3 quartos (1 suíte), ampla área de churrasqueira e edícula nos fundos. Quintal espaçoso, ideal para famílias. Garagem para 4 carros.',
    tipo: TipoImovel.CASA,
    finalidade: Finalidade.VENDA,
    status: StatusImovel.DISPONIVEL,
    destaque: true,
    endereco: 'Rua Néo Alves Martins',
    numero: '320',
    bairro: 'Jardim Alvorada',
    cidade: 'Maringá',
    estado: 'PR',
    cep: '87045-000',
    valor: 890000,
    valorIptu: 1800,
    area: 180,
    areaTotal: 250,
    quartos: 3,
    suites: 1,
    banheiros: 3,
    vagas: 4,
    anoConstrucao: 2012,
    caracteristicas: ['Churrasqueira', 'Edícula', 'Quintal amplo', 'Garagem coberta'],
    fotos: [
      foto(14, 0, 'Fachada'),
      foto(15, 1, 'Área de churrasqueira'),
      foto(16, 2, 'Quintal'),
    ],
  },
  {
    codigo: 'AP1004',
    titulo: 'Apartamento 2 quartos mobiliado para alugar na Zona 1',
    descricao:
      'Apartamento mobiliado e pronto para morar na Zona 1, 2 quartos, 1 vaga. Ótima localização no centro, próximo à Catedral e ao comércio. Condomínio com portaria 24h.',
    tipo: TipoImovel.APARTAMENTO,
    finalidade: Finalidade.ALUGUEL,
    status: StatusImovel.DISPONIVEL,
    destaque: false,
    endereco: 'Av. Getúlio Vargas',
    numero: '210',
    bairro: 'Zona 1',
    cidade: 'Maringá',
    estado: 'PR',
    cep: '87013-000',
    valor: 2200,
    valorCondominio: 350,
    valorIptu: 600,
    area: 65,
    quartos: 2,
    suites: 0,
    banheiros: 1,
    vagas: 1,
    anoConstrucao: 2015,
    mobiliado: true,
    caracteristicas: ['Mobiliado', 'Portaria 24h', 'Elevador'],
    fotos: [foto(17, 0, 'Sala mobiliada'), foto(18, 1, 'Quarto')],
  },
  {
    codigo: 'TE1006',
    titulo: 'Terreno de esquina 450m² na Gleba Patrimônio',
    descricao:
      'Excelente terreno plano de esquina na Gleba Patrimônio, 450m², pronto para construir. Ótima topografia e localização em região de valorização.',
    tipo: TipoImovel.TERRENO,
    finalidade: Finalidade.VENDA,
    status: StatusImovel.DISPONIVEL,
    destaque: false,
    endereco: 'Rua Projetada A',
    bairro: 'Gleba Patrimônio',
    cidade: 'Maringá',
    estado: 'PR',
    cep: '87065-000',
    valor: 380000,
    area: 450,
    areaTotal: 450,
    caracteristicas: ['Plano', 'Esquina', 'Pronto para construir'],
    fotos: [foto(19, 0, 'Vista do terreno')],
  },
];

async function seedUser() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@patricia-imoveis.com';
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';
  const name = process.env.ADMIN_NAME ?? 'Patricia Lima';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, role: Role.ADMIN, isActive: true },
    create: { email, passwordHash, name, role: Role.ADMIN },
  });

  console.log(`[seed] login pronto → e-mail: ${email} | senha: ${password}`);
}

async function seedImoveis() {
  let criados = 0;
  for (const def of imoveis) {
    const existing = await prisma.imovel.findUnique({ where: { codigo: def.codigo } });
    if (existing) {
      continue;
    }
    const { fotos, ...dados } = def;
    await prisma.imovel.create({
      data: { ...dados, fotos: { create: fotos } },
    });
    criados += 1;
  }
  console.log(`[seed] imóveis: ${criados} criados (${imoveis.length} no total).`);
}

async function seedClientesEInteracoes() {
  const totalClientes = await prisma.cliente.count();
  if (totalClientes > 0) {
    console.log('[seed] clientes já existem, pulando.');
    return;
  }

  const casa = await prisma.imovel.findUnique({ where: { codigo: 'CA1002' } });
  const apto = await prisma.imovel.findUnique({ where: { codigo: 'AP1004' } });

  const maria = await prisma.cliente.create({
    data: {
      nome: 'Maria Oliveira',
      telefone: '(44) 99811-2233',
      email: 'maria.oliveira@email.com',
      origem: 'Site',
      observacoes: 'Procura casa para a família, prioriza bairro tranquilo.',
      tipoDesejado: [TipoImovel.CASA, TipoImovel.SOBRADO],
      finalidadeDesejada: Finalidade.VENDA,
      cidadeDesejada: 'Maringá',
      valorMin: 600000,
      valorMax: 950000,
      quartosMin: 3,
      vagasMin: 2,
    },
  });

  const joao = await prisma.cliente.create({
    data: {
      nome: 'João Pereira',
      telefone: '(44) 99744-5566',
      email: 'joao.pereira@email.com',
      origem: 'Indicação',
      observacoes: 'Quer alugar apartamento mobiliado no centro.',
      tipoDesejado: [TipoImovel.APARTAMENTO],
      finalidadeDesejada: Finalidade.ALUGUEL,
      cidadeDesejada: 'Maringá',
      valorMax: 2500,
      quartosMin: 2,
      vagasMin: 1,
    },
  });

  if (casa) {
    await prisma.clienteImovel.create({
      data: { clienteId: maria.id, imovelId: casa.id, interesse: 4, nota: 'Gostou da edícula.' },
    });
    await prisma.interacao.createMany({
      data: [
        {
          clienteId: maria.id,
          tipo: TipoInteracao.CONTATO,
          titulo: 'Primeiro contato pelo site',
          descricao: 'Cliente preencheu formulário interessada em casas até R$ 950 mil.',
        },
        {
          clienteId: maria.id,
          imovelId: casa.id,
          tipo: TipoInteracao.VISITA_AGENDADA,
          titulo: 'Visita à casa do Jardim Alvorada',
          descricao: 'Visita agendada para o próximo sábado às 10h.',
        },
      ],
    });
  }

  if (apto) {
    await prisma.clienteImovel.create({
      data: { clienteId: joao.id, imovelId: apto.id, interesse: 5, nota: 'Quer fechar rápido.' },
    });
    await prisma.interacao.createMany({
      data: [
        {
          clienteId: joao.id,
          imovelId: apto.id,
          tipo: TipoInteracao.VISITA_REALIZADA,
          titulo: 'Visita ao apartamento da Zona 1',
          descricao: 'Aprovou o imóvel, vai analisar a documentação.',
        },
        {
          clienteId: joao.id,
          imovelId: apto.id,
          tipo: TipoInteracao.PROPOSTA,
          titulo: 'Proposta de locação',
          descricao: 'Proposta enviada para análise do proprietário.',
        },
      ],
    });
  }

  console.log('[seed] 2 clientes + vínculos + interações criados.');
}

async function main() {
  await seedUser();
  await seedImoveis();
  await seedClientesEInteracoes();
  console.log('[seed] concluído.');
}

main()
  .catch((e) => {
    console.error('[seed] erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
