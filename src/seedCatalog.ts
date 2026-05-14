import { Service } from './types.ts';

export const CATALOG: Service[] = [
  {
    id: "lavagem-tecnica",
    name: "Lavagem Técnica",
    slug: "lavagem-tecnica",
    categoryId: "lavagens",
    categoryName: "Lavagens",
    shortDescription: "Lavagem técnica com pré-lavagem, limpeza detalhada, limpeza interna e acabamento cuidadoso.",
    fullDescription: "Serviço técnico de limpeza para veículos que precisam de uma lavagem mais cuidadosa, com atenção a detalhes internos e externos.",
    includes: ["Pré-lavagem", "Limpeza detalhada", "Limpeza interna e externa", "Cera líquida/blend"],
    benefits: ["Remove sujeiras superficiais", "Melhora o acabamento visual", "Ideal para manutenção de limpeza", "Entrega mais cuidadosa que lavagem comum"],
    recommendedFor: [],
    priceOptions: [
      { id: "pop", label: "Popular", price: 150, active: true },
      { id: "suv", label: "SUV", price: 200, active: true },
      { id: "cam", label: "Caminhonete", price: 250, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 240, durationDays: 1, deliveryLabel: "Entrega em 4 horas", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: true, availableForBooking: true, availableInScanner: true, displayOrder: 1,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "lavagem-detalhada",
    name: "Lavagem Detalhada",
    slug: "lavagem-detalhada",
    categoryId: "lavagens",
    categoryName: "Lavagens",
    shortDescription: "Limpeza completa e minuciosa com atenção aos cantos, rodas, detalhes internos e acabamento externo.",
    fullDescription: "Lavagem mais completa para quem deseja um cuidado superior no veículo, incluindo áreas normalmente esquecidas em lavagens comuns.",
    includes: ["Pré-lavagem", "Limpeza externa", "Limpeza detalhada interna", "Limpeza de rodas", "Cera blend líquida", "Limpeza de emblemas, grades e borrachas", "Revitalização de plásticos externos", "Revitalizador premium", "Revitalização da caixa de rodas"],
    benefits: ["Acabamento superior", "Limpeza mais profunda", "Valoriza o visual do veículo", "Ideal para carros com uso intenso"],
    recommendedFor: [],
    priceOptions: [
      { id: "pop", label: "Popular", price: 300, active: true },
      { id: "suv", label: "SUV", price: 350, active: true },
      { id: "cam", label: "Caminhonete", price: 400, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 240, durationDays: 1, deliveryLabel: "Entrega em 4 horas", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: true, availableForBooking: true, availableInScanner: true, displayOrder: 2,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "lavagem-manutencao",
    name: "Lavagem de Manutenção",
    slug: "lavagem-manutencao",
    categoryId: "lavagens",
    categoryName: "Lavagens",
    shortDescription: "Ideal para veículos com revestimento cerâmico ou manutenção periódica do acabamento.",
    fullDescription: "Lavagem rápida e técnica para manter veículos já tratados, vitrificados ou bem conservados.",
    includes: ["Pré-lavagem", "Limpeza externa", "Limpeza interna básica", "Secagem sem toque", "Acabamento de caixa de roda", "Revitalização de pneus", "Revitalização de plásticos externos"],
    benefits: ["Manutenção rápida", "Preserva proteção existente", "Ideal para rotina de cuidado", "Ajuda a manter brilho e acabamento"],
    recommendedFor: [],
    priceOptions: [
      { id: "pop", label: "Popular", price: 80, active: true },
      { id: "suv", label: "SUV", price: 100, active: true },
      { id: "cam", label: "Caminhonete", price: 150, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 60, durationDays: 1, deliveryLabel: "Entrega em 1 hora", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 3,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "lavagem-moto",
    name: "Lavagem Moto",
    slug: "lavagem-moto",
    categoryId: "motos",
    categoryName: "Motos",
    shortDescription: "Limpeza técnica para motocicletas com revitalização de plásticos e envernização de motor.",
    fullDescription: "Limpeza técnica para motocicletas com revitalização de plásticos e envernização de motor.",
    includes: ["Limpeza técnica", "Revitalização de plásticos", "Envernização de motor"],
    benefits: ["Visual renovado da moto", "Cuidado técnico", "Melhor acabamento de plásticos e motor"],
    recommendedFor: [],
    priceOptions: [
      { id: "moto", label: "Moto", sublabel: "A partir de", price: 70, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 60, durationDays: 1, deliveryLabel: "Entrega em 1 hora", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 4,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "pacote-sr-motos",
    name: "Pacote SR.Moto's",
    slug: "pacote-sr-motos",
    categoryId: "motos",
    categoryName: "Motos",
    shortDescription: "Pacote completo para motos com lavagem detalhada, polimento, revitalização, vitrificação e higienização.",
    fullDescription: "Pacote completo para motos com lavagem detalhada, polimento, revitalização, vitrificação e higienização.",
    includes: ["Lavagem detalhada", "Polimento técnico", "Revitalização plástica", "Vitrificação", "Higienização de banco", "Hidratação de couro", "Envernização de motor"],
    benefits: ["Cuidado completo para moto", "Renovação visual", "Proteção e acabamento premium"],
    recommendedFor: [],
    priceOptions: [
      { id: "moto", label: "Moto", sublabel: "A partir de", price: 250, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 240, durationDays: 1, deliveryLabel: "Entrega em 4 horas", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 5,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "interna-detalhada",
    name: "Interna Detalhada",
    slug: "interna-detalhada",
    categoryId: "interior",
    categoryName: "Interior",
    shortDescription: "Limpeza detalhada das superfícies internas como couro ou estofados, carpete, porta-malas e painel.",
    fullDescription: "Limpeza detalhada das superfícies internas como couro ou estofados, carpete, porta-malas e painel.",
    includes: ["Limpeza detalhada nas superfícies", "Couro ou estofados", "Carpete", "Porta-malas", "Painel"],
    benefits: ["Interior mais limpo", "Melhor sensação de uso", "Acabamento interno renovado"],
    recommendedFor: [],
    priceOptions: [
      { id: "pop", label: "Popular", price: 100, active: true },
      { id: "suv", label: "SUV", price: 100, active: true },
      { id: "cam", label: "Caminhonete", price: 150, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 240, durationDays: 1, deliveryLabel: "Entrega em 4 horas", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 6,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "higienizacao-tecidos",
    name: "Higienização de Tecidos",
    slug: "higienizacao-tecidos",
    categoryId: "interior",
    categoryName: "Interior",
    shortDescription: "Limpeza profunda dos tecidos com remoção de sujeiras difíceis, odores e bactérias.",
    fullDescription: "Limpeza profunda dos tecidos com remoção de sujeiras difíceis, odores e bactérias.",
    includes: ["Limpeza detalhada de tecido", "Remoção de sujeiras difíceis", "Tratamento contra odores desagradáveis e bactérias", "Finalização para restaurar aparência original do tecido"],
    benefits: ["Remove sujeira profunda", "Melhora odor interno", "Ajuda na renovação dos tecidos", "Ideal para bancos manchados ou uso intenso"],
    recommendedFor: [],
    priceOptions: [
      { id: "5Lug", label: "5 lugares", price: 400, active: true },
      { id: "7Lug", label: "7 lugares", price: 450, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 0, durationDays: 2, deliveryLabel: "Entrega em 2 dias", schedulingMode: "days", requiresManualApproval: true,
    active: true, featuredOnHome: true, availableForBooking: true, availableInScanner: true, displayOrder: 7,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "tratamento-motor",
    name: "Tratamento do Motor",
    slug: "tratamento-motor",
    categoryId: "motor",
    categoryName: "Motor",
    shortDescription: "Limpeza especializada do motor com isolamento de partes sensíveis e proteção duradoura.",
    fullDescription: "Limpeza especializada do motor com isolamento de partes sensíveis e proteção duradoura.",
    includes: ["Inspeção técnica e isolamento de partes sensíveis", "Limpeza especializada com proteção duradoura"],
    benefits: ["Melhora visual do motor", "Cuidado técnico", "Proteção das áreas sensíveis", "Ideal para motor visualmente sujo"],
    recommendedFor: [],
    priceOptions: [
      { id: "lavagem", label: "Lavagem", sublabel: "A partir de", price: 150, active: true },
      { id: "detalhada", label: "Detalhada", price: 200, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 240, durationDays: 1, deliveryLabel: "Entrega em 4 horas", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 8,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "tratamento-couro",
    name: "Tratamento de Couro",
    slug: "tratamento-couro",
    categoryId: "interior",
    categoryName: "Interior",
    shortDescription: "Tratamento para eliminar manchas, sujeiras e bactérias, devolvendo aspecto original e hidratação ao couro.",
    fullDescription: "Tratamento para eliminar manchas, sujeiras e bactérias, devolvendo aspecto original e hidratação ao couro.",
    includes: ["Eliminação de manchas", "Remoção de sujeiras encrustadas", "Redução de bactérias", "Hidratação do couro", "Prevenção contra ressecamento e rachaduras"],
    benefits: ["Couro mais limpo e hidratado", "Previne rachaduras", "Melhora acabamento interno", "Valoriza o interior"],
    recommendedFor: [],
    priceOptions: [
      { id: "5lug", label: "5 lugares", price: 350, active: true },
      { id: "7lug", label: "7 lugares", price: 400, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 180, durationDays: 1, deliveryLabel: "Entrega em 3 horas", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 9,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "polimento-tecnico",
    name: "Polimento Técnico",
    slug: "polimento-tecnico",
    categoryId: "pintura",
    categoryName: "Pintura",
    shortDescription: "Processo técnico para descontaminação da pintura, correção do verniz e aplicação de proteção.",
    fullDescription: "Processo técnico para descontaminação da pintura, correção do verniz e aplicação de proteção.",
    includes: ["Lavagem", "Descontaminação da pintura", "Correção completa do verniz", "Aplicação de proteção"],
    benefits: ["Recupera brilho", "Reduz marcas superficiais", "Melhora acabamento da pintura", "Valoriza o veículo"],
    recommendedFor: [],
    priceOptions: [
      { id: "pop", label: "Popular", price: 800, active: true },
      { id: "suv", label: "SUV", price: 1000, active: true },
      { id: "cam", label: "Caminhonete", price: 1200, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 0, durationDays: 2, deliveryLabel: "Entrega em 2 dias", schedulingMode: "days", requiresManualApproval: true,
    active: true, featuredOnHome: true, availableForBooking: true, availableInScanner: true, displayOrder: 10,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "vitrificacao",
    name: "Vitrificação",
    slug: "vitrificacao",
    categoryId: "protecao",
    categoryName: "Proteção",
    shortDescription: "Proteção máxima para pintura com brilho de showroom e resistência prolongada.",
    fullDescription: "Proteção máxima para pintura com brilho de showroom e resistência prolongada.",
    includes: ["Lavagem detalhada", "Polimento técnico", "Proteção da pintura contra sujeiras, riscos e agentes externos", "Segurança intensificada", "Brilho intenso na manutenção do veículo"],
    benefits: ["Alta proteção da pintura", "Brilho intenso", "Facilita manutenção", "Ideal para proteção premium"],
    recommendedFor: [],
    priceOptions: [
      { id: "unico", label: "Único", sublabel: "A partir de", price: 2200, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 0, durationDays: 5, deliveryLabel: "Entrega em 5 dias", schedulingMode: "days", requiresManualApproval: true,
    active: true, featuredOnHome: true, availableForBooking: true, availableInScanner: true, displayOrder: 11,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "sr-start",
    name: "SR.Detail's Start",
    slug: "sr-start",
    categoryId: "pacotes",
    categoryName: "Pacotes",
    shortDescription: "Pacote básico para dar uma cara nova no veículo, ideal para uso ou venda gastando pouco.",
    fullDescription: "Pacote básico para dar uma cara nova no veículo, ideal para uso ou venda gastando pouco.",
    includes: ["Limpeza premium", "Polimento técnico", "Higienização interna", "Revitalização plástica"],
    benefits: ["Ideal para renovar o visual", "Bom custo-benefício", "Indicado para preparação de venda", "Combina interior e pintura"],
    recommendedFor: [],
    priceOptions: [
      { id: "pop", label: "Popular", price: 150, active: true },
      { id: "suv", label: "SUV", price: 180, active: true },
      { id: "cam", label: "Caminhonete", price: 250, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 0, durationDays: 2, deliveryLabel: "Entrega em 2 dias", schedulingMode: "days", requiresManualApproval: true,
    active: true, featuredOnHome: true, availableForBooking: true, availableInScanner: true, displayOrder: 12,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "sr-plus",
    name: "SR.Detail's Plus",
    slug: "sr-plus",
    categoryId: "pacotes",
    categoryName: "Pacotes",
    shortDescription: "Pacote completo para resultado satisfatório na parte externa e interna, com proteção prolongada.",
    fullDescription: "Pacote completo para resultado satisfatório na parte externa e interna, com proteção prolongada.",
    includes: ["Limpeza detalhada", "Polimento técnico", "Vitrificação até 3 anos", "Higienização de bancos", "Higienização de couro", "Revitalização plástica"],
    benefits: ["Cuidado completo interno e externo", "Proteção prolongada", "Excelente para valorização do veículo", "Resultado premium"],
    recommendedFor: [],
    priceOptions: [
      { id: "pop", label: "Popular", price: 2000, active: true },
      { id: "suv", label: "SUV", price: 2500, active: true },
      { id: "cam", label: "Caminhonete", price: 3200, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 0, durationDays: 2, deliveryLabel: "Entrega em 2 dias", schedulingMode: "days", requiresManualApproval: true,
    active: true, featuredOnHome: true, availableForBooking: true, availableInScanner: true, displayOrder: 13,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "sr-pro",
    name: "SR.Detail's Pro",
    slug: "sr-pro",
    categoryId: "pacotes",
    categoryName: "Pacotes",
    shortDescription: "Pacote voltado a entregar limpeza profunda interna e externa junto com proteção prolongada da pintura.",
    fullDescription: "Pacote voltado a entregar limpeza profunda interna e externa junto com proteção prolongada da pintura.",
    includes: ["Limpeza detalhada", "Polimento técnico", "Vitrificação de 3 anos", "Higienização interna", "Limpeza do motor", "Limpeza chassi", "Vitrificação", "Plásticos externos"],
    benefits: ["Limpeza profunda", "Proteção prolongada", "Cuidado completo", "Ideal para clientes exigentes"],
    recommendedFor: [],
    priceOptions: [
      { id: "pop", label: "Popular", price: 2200, active: true },
      { id: "suv", label: "SUV", price: 2650, active: true },
      { id: "cam", label: "Caminhonete", price: 2700, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 0, durationDays: 2, deliveryLabel: "Entrega em 2 dias", schedulingMode: "days", requiresManualApproval: true,
    active: true, featuredOnHome: true, availableForBooking: true, availableInScanner: true, displayOrder: 14,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "sr-premium",
    name: "SR.Detail's Premium",
    slug: "sr-premium",
    categoryId: "pacotes",
    categoryName: "Pacotes",
    shortDescription: "Pacote para proteção extrema do veículo com soluções de proteção nanocerâmica.",
    fullDescription: "Pacote para proteção extrema do veículo com soluções de proteção nanocerâmica.",
    includes: ["Limpeza detalhada", "Polimento técnico", "Vitrificação pintura 3 anos", "Vitrificação plásticos externos", "Vitrificação vidros", "Vitrificação rodas", "Vitrificação para-brisa", "Vitrificação farol"],
    benefits: ["Proteção extrema", "Acabamento premium", "Alta valorização visual", "Ideal para quem quer máxima proteção"],
    recommendedFor: [],
    priceOptions: [
      { id: "pop", label: "Popular", price: 2500, active: true },
      { id: "suv", label: "SUV", price: 3000, active: true },
      { id: "cam", label: "Caminhonete", price: 3000, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 0, durationDays: 3, deliveryLabel: "Entrega em 3 dias", schedulingMode: "days", requiresManualApproval: true,
    active: true, featuredOnHome: true, availableForBooking: true, availableInScanner: true, displayOrder: 15,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "sr-diamond",
    name: "SR.Detail's Diamond Finish",
    slug: "sr-diamond",
    categoryId: "pacotes",
    categoryName: "Pacotes",
    shortDescription: "Pacote máximo de proteção externa com proteção nanocerâmica e Paint Protection Film.",
    fullDescription: "Pacote máximo de proteção externa com proteção nanocerâmica e Paint Protection Film.",
    includes: ["Polimento técnico", "Vitrificação pintura 3 a 5 anos", "Vitrificação plásticos externos", "Vitrificação plásticos internos", "Vitrificação farol", "Vitrificação bancos de couro", "Vitrificação rodas", "Vitrificação para-brisa", "PPF quina/concha/soleira", "Limpeza completa do ar"],
    benefits: ["Proteção máxima", "Acabamento de alto padrão", "Indicado para clientes premium", "Combina vitrificação e PPF"],
    recommendedFor: [],
    priceOptions: [
      { id: "pop", label: "Popular", price: 3000, active: true },
      { id: "suv", label: "SUV", price: 4200, active: true },
      { id: "cam", label: "Caminhonete", price: 5400, active: true }
    ],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 0, durationDays: 3, deliveryLabel: "Entrega em 3 dias", schedulingMode: "days", requiresManualApproval: true,
    active: true, featuredOnHome: true, availableForBooking: true, availableInScanner: true, displayOrder: 16,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "asp-interna-comp",
    name: "Aspiração interna completa",
    slug: "asp-interna-comp",
    categoryId: "servicos-individuais",
    categoryName: "Serviços Individuais",
    shortDescription: "Aspiração interna completa",
    fullDescription: "Aspiração interna completa",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "Único", price: 50, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 30, durationDays: 1, deliveryLabel: "Serviço adicional", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 17,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "higien-plasticos",
    name: "Higienização de plásticos internos",
    slug: "higien-plasticos",
    categoryId: "servicos-individuais",
    categoryName: "Serviços Individuais",
    shortDescription: "Higienização de plásticos internos",
    fullDescription: "Higienização de plásticos internos",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "Único", price: 100, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 60, durationDays: 1, deliveryLabel: "Serviço adicional", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 18,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "limpeza-vidros",
    name: "Limpeza de vidros",
    slug: "limpeza-vidros",
    categoryId: "servicos-individuais",
    categoryName: "Serviços Individuais",
    shortDescription: "Limpeza de vidros",
    fullDescription: "Limpeza de vidros",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "Único", price: 20, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 20, durationDays: 1, deliveryLabel: "Serviço adicional", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 19,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "descont-pintura",
    name: "Descontaminação de pintura",
    slug: "descont-pintura",
    categoryId: "servicos-individuais",
    categoryName: "Serviços Individuais",
    shortDescription: "Descontaminação de pintura",
    fullDescription: "Descontaminação de pintura",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "Único", price: 150, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 60, durationDays: 1, deliveryLabel: "Serviço adicional", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 20,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "enceramento-manual",
    name: "Enceramento manual",
    slug: "enceramento-manual",
    categoryId: "cuidados-pintura",
    categoryName: "Cuidados com a Pintura",
    shortDescription: "Enceramento manual",
    fullDescription: "Enceramento manual",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "Único", price: 70, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 60, durationDays: 1, deliveryLabel: "Proteção manual", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 21,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "selante-sintetico",
    name: "Aplicação de selante sintético",
    slug: "selante-sintetico",
    categoryId: "cuidados-pintura",
    categoryName: "Cuidados com a Pintura",
    shortDescription: "Aplicação de selante sintético",
    fullDescription: "Aplicação de selante sintético",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "Único", price: 120, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 60, durationDays: 1, deliveryLabel: "Proteção de 6 a 12 meses", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 22,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "revitalizacao-plasticos",
    name: "Revitalização de plásticos externos",
    slug: "revitalizacao-plasticos",
    categoryId: "cuidados-pintura",
    categoryName: "Cuidados com a Pintura",
    shortDescription: "Revitalização de plásticos externos",
    fullDescription: "Revitalização de plásticos externos",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "Único", price: 80, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 40, durationDays: 1, deliveryLabel: "Serviço adicional", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 23,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "hidratacao-couro",
    name: "Hidratação de couro",
    slug: "hidratacao-couro",
    categoryId: "cuidados-internos",
    categoryName: "Cuidados Internos",
    shortDescription: "Hidratação de couro",
    fullDescription: "Hidratação de couro",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "Único", price: 100, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 60, durationDays: 1, deliveryLabel: "Couros e volantes", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 24,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "remocao-manchas",
    name: "Remoção de manchas leves em estofados",
    slug: "remocao-manchas",
    categoryId: "cuidados-internos",
    categoryName: "Cuidados Internos",
    shortDescription: "Remoção de manchas leves em estofados",
    fullDescription: "Remoção de manchas leves em estofados",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "Único", price: 50, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 60, durationDays: 1, deliveryLabel: "Serviço adicional", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 25,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "cristalizacao-vidros-1",
    name: "Cristalização de vidros — 5 vidros",
    slug: "cristalizacao-vidros-1",
    categoryId: "protecao-estetica",
    categoryName: "Proteção e Estética",
    shortDescription: "Cristalização de 5 vidros",
    fullDescription: "Cristalização de 5 vidros",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "5 vidros", price: 200, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 60, durationDays: 1, deliveryLabel: "Proteção 90 dias", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 26,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "cristalizacao-vidros-2",
    name: "Cristalização de vidros — 10 vidros",
    slug: "cristalizacao-vidros-2",
    categoryId: "protecao-estetica",
    categoryName: "Proteção e Estética",
    shortDescription: "Cristalização de 10 vidros",
    fullDescription: "Cristalização de 10 vidros",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "10 vidros", price: 250, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 60, durationDays: 1, deliveryLabel: "Proteção 1 ano", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 27,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "cristalizacao-vidros-3",
    name: "Cristalização de vidros — 2 zonas",
    slug: "cristalizacao-vidros-3",
    categoryId: "protecao-estetica",
    categoryName: "Proteção e Estética",
    shortDescription: "Cristalização de 2 zonas",
    fullDescription: "Cristalização de 2 zonas",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "2 zonas", price: 350, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 60, durationDays: 1, deliveryLabel: "Proteção 2 anos", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 28,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "enceramento-descont-1",
    name: "Enceramento Manual + Descontaminação — 30 dias",
    slug: "enceramento-descont-1",
    categoryId: "protecao-estetica",
    categoryName: "Proteção e Estética",
    shortDescription: "Enceramento Manual + Descontaminação — 30 dias",
    fullDescription: "Enceramento Manual + Descontaminação — 30 dias",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "30 dias", price: 250, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 90, durationDays: 1, deliveryLabel: "Proteção 90 dias", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 29,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "enceramento-descont-2",
    name: "Enceramento Manual + Descontaminação — 10 meses",
    slug: "enceramento-descont-2",
    categoryId: "protecao-estetica",
    categoryName: "Proteção e Estética",
    shortDescription: "Enceramento Manual + Descontaminação — 10 meses",
    fullDescription: "Enceramento Manual + Descontaminação — 10 meses",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "10 meses", price: 500, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 90, durationDays: 1, deliveryLabel: "Proteção 1 ano", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 30,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "enceramento-descont-3",
    name: "Enceramento Manual + Descontaminação — 2 anos",
    slug: "enceramento-descont-3",
    categoryId: "protecao-estetica",
    categoryName: "Proteção e Estética",
    shortDescription: "Enceramento Manual + Descontaminação — 2 anos",
    fullDescription: "Enceramento Manual + Descontaminação — 2 anos",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "2 anos", price: 600, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 90, durationDays: 1, deliveryLabel: "Proteção 2 anos", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 31,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "cera-express",
    name: "Aplicação de cera líquida express",
    slug: "cera-express",
    categoryId: "protecao-estetica",
    categoryName: "Proteção e Estética",
    shortDescription: "Aplicação de cera líquida express",
    fullDescription: "Aplicação de cera líquida express",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "Único", price: 80, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 20, durationDays: 1, deliveryLabel: "No ato da lavagem", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 32,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "coating-rodas",
    name: "Coating de rodas",
    slug: "coating-rodas",
    categoryId: "protecao-estetica",
    categoryName: "Proteção e Estética",
    shortDescription: "Coating de rodas",
    fullDescription: "Coating de rodas",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "Único", price: 200, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 60, durationDays: 1, deliveryLabel: "Serviço adicional", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 33,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "coating-plasticos",
    name: "Coating de plásticos",
    slug: "coating-plasticos",
    categoryId: "protecao-estetica",
    categoryName: "Proteção e Estética",
    shortDescription: "Coating de plásticos",
    fullDescription: "Coating de plásticos",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "Único", price: 300, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 60, durationDays: 1, deliveryLabel: "Proteção de até 2 anos", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 34,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: "coating-farois",
    name: "Coating de lanternas e faróis",
    slug: "coating-farois",
    categoryId: "protecao-estetica",
    categoryName: "Proteção e Estética",
    shortDescription: "Coating de lanternas e faróis",
    fullDescription: "Coating de lanternas e faróis",
    includes: [], benefits: [], recommendedFor: [],
    priceOptions: [{ id: "unico", label: "Único", price: 100, active: true }],
    addOnsAllowed: false, allowedAddOnIds: [],
    durationMinutes: 60, durationDays: 1, deliveryLabel: "Serviço adicional", schedulingMode: "hours", requiresManualApproval: false,
    active: true, featuredOnHome: false, availableForBooking: true, availableInScanner: true, displayOrder: 35,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  }
];

export async function seedFirebaseIfEmpty(force = false) {
  const { db } = await import('./lib/firebase');
  const { getDocs, collection, doc, setDoc } = await import('firebase/firestore');

  if (!force) {
    const servicesSnap = await getDocs(collection(db, 'services'));
    if (!servicesSnap.empty) {
      return CATALOG;
    }
  }

  // Seed services
  for (const svc of CATALOG) {
    await setDoc(doc(db, 'services', svc.id), svc);
  }

  // Seed categories
  const categories = [
    { id: "lavagens", name: "Lavagens", slug: "lavagens", displayOrder: 1, active: true },
    { id: "motos", name: "Motos", slug: "motos", displayOrder: 2, active: true },
    { id: "interior", name: "Interior", slug: "interior", displayOrder: 3, active: true },
    { id: "motor", name: "Motor", slug: "motor", displayOrder: 4, active: true },
    { id: "pintura", name: "Pintura", slug: "pintura", displayOrder: 5, active: true },
    { id: "protecao", name: "Proteção", slug: "protecao", displayOrder: 6, active: true },
    { id: "pacotes", name: "Pacotes", slug: "pacotes", displayOrder: 7, active: true },
    { id: "servicos-individuais", name: "Serviços Individuais", slug: "servicos-individuais", displayOrder: 8, active: true },
    { id: "cuidados-pintura", name: "Cuidados com a Pintura", slug: "cuidados-pintura", displayOrder: 9, active: true },
    { id: "cuidados-internos", name: "Cuidados Internos", slug: "cuidados-internos", displayOrder: 10, active: true },
    { id: "protecao-estetica", name: "Proteção e Estética", slug: "protecao-estetica", displayOrder: 11, active: true }
  ];

  for (const cat of categories) {
    await setDoc(doc(db, 'serviceCategories', cat.id), cat);
  }

  // Seed business settings
  const settings = {
    businessName: 'SR Details',
    slogan: 'A Estética que Valoriza a Sua Vida',
    headline: 'Eleve o padrão do seu veículo.',
    subheadline: 'Estética automotiva premium desenhada para os donos mais exigentes.',
    primaryColor: '#FFD000',
    secondaryColor: '#B8860B',
    logoUrl: '',
    whatsapp: '34999999999',
    address: 'R. Paulo L. Rotelli, 100',
    city: 'Uberlândia',
    state: 'MG',
    instagram: '@srdetails',
    googleMapsUrl: '',
    workingHoursText: 'Seg a Sáb - 08:00 às 18:00'
  };
  await setDoc(doc(db, 'businessSettings', 'main'), settings);

  // Seed schedule settings
  const sched = {
    businessHours: { start: "08:00", end: "18:00" },
    workingDays: [1, 2, 3, 4, 5, 6],
    slotIntervalMinutes: 30,
    bufferBetweenBookingsMinutes: 30,
    teamsCapacity: 1,
    allowSameDayBooking: true,
    minimumNoticeMinutes: 120,
    maxBookingsPerDay: null,
    blockedDates: [],
    blockedTimeSlots: []
  };
  await setDoc(doc(db, 'scheduleSettings', 'main'), sched);

  // Seed Scanner rules
  const rules = [
    {
      id: "rule1",
      vehicleType: "Qualquer",
      problem: "Sujeira leve do dia a dia, apenas poeira",
      careLevel: "Manutenção",
      recommendedServiceId: "lavagem-manutencao",
      alternativeServiceIds: ["lavagem-tecnica"],
      explanation: "A Lavagem de Manutenção é rápida e ideal para carros com sujeira leve ou vitrificados.",
      active: true
    },
    {
      id: "rule2",
      vehicleType: "Qualquer",
      problem: "Sujeira pesada, barro, rodas muito sujas",
      careLevel: "Cuidado Profundo",
      recommendedServiceId: "lavagem-detalhada",
      alternativeServiceIds: ["sr-plus"],
      explanation: "A Lavagem Detalhada foca em todos os cantos, ideal para sujeira pesada.",
      active: true
    }
  ];
  for (const rule of rules) {
    await setDoc(doc(db, 'scannerRules', rule.id), rule);
  }

  // Seed home sections
  await setDoc(doc(db, 'homeSections', 'main'), {
    hero: { active: true },
    services: { active: true },
    scanner: { active: true }
  });

  return CATALOG;
}
