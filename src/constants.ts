import { Service, AddOn } from './types.ts';

export const ADDONS: AddOn[] = [
  { id: "add-asp", name: "Aspiração interna completa", category: "Individual", price: 50, active: true },
  { id: "add-hig-plas", name: "Higienização de plásticos internos", category: "Individual", price: 100, active: true },
  { id: "add-vidros", name: "Limpeza de vidros", category: "Individual", price: 20, active: true },
  { id: "add-descont", name: "Descontaminação de pintura", category: "Individual", price: 150, active: true },
  { id: "add-cera-man", name: "Enceramento manual", category: "Individual", price: 70, active: true },
  { id: "add-selante", name: "Aplicação de selante sintético", category: "Individual", price: 120, active: true },
  { id: "add-revit-plas", name: "Revitalização de plásticos externos", category: "Individual", price: 50, active: true },
  { id: "add-hidra", name: "Hidratação de couro", category: "Individual", price: 100, active: true },
  { id: "add-manchas", name: "Remoção de manchas leves em estofados", category: "Individual", price: 50, active: true },
  { id: "add-crist-90d", name: "Cristalização de vidros 90 dias", category: "Individual", price: 190, active: true },
  { id: "add-crist-1a", name: "Cristalização de vidros 1 ano", category: "Individual", price: 150, active: true },
  { id: "add-crist-2a", name: "Cristalização de vidros 2 anos", category: "Individual", price: 250, active: true },
  { id: "add-cera-desc-90d", name: "Enceramento Manual + Descont. 90 dias", category: "Individual", price: 250, active: true },
  { id: "add-cera-desc-1a", name: "Enceramento Manual + Descont. 1 ano", category: "Individual", price: 350, active: true },
  { id: "add-cera-desc-2a", name: "Enceramento Manual + Descont. 2 anos", category: "Individual", price: 400, active: true },
  { id: "add-cera-exp", name: "Aplicação de cera líquida express", category: "Individual", price: 50, active: true },
  { id: "add-coat-rodas", name: "Coating de rodas", category: "Individual", price: 200, active: true },
  { id: "add-coat-plas", name: "Coating de plásticos", category: "Individual", price: 300, active: true },
  { id: "add-coat-farois", name: "Coating de lanternas e faróis", category: "Individual", price: 100, active: true }
];

