export type View = "home" | "services" | "booking" | "scanner" | "status" | "admin" | "admin-login" | "brand-settings" | "admin-services" | "admin-schedule";

export type UserRole = "owner" | "manager" | "attendant" | "technician";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  photoUrl?: string;
}

export type PriceOption = {
  id: string;
  label: string;
  sublabel?: string;
  price: number;
  installmentLabel?: string;
  active: boolean;
};

export type Service = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;

  shortDescription: string;
  fullDescription: string;

  includes: string[];
  benefits: string[];
  recommendedFor: string[];

  priceOptions: PriceOption[];

  addOnsAllowed: boolean;
  allowedAddOnIds: string[];

  durationMinutes: number;
  durationDays: number;
  deliveryLabel: string;

  schedulingMode: "hours" | "days";
  requiresManualApproval: boolean;

  imageUrl?: string;
  icon?: string;

  active: boolean;
  featuredOnHome: boolean;
  availableForBooking: boolean;
  availableInScanner: boolean;

  displayOrder: number;

  createdAt: string;
  updatedAt: string;
};

export type ScannerRule = {
  id: string;
  vehicleType?: string;
  problem: string;
  careLevel?: string;
  recommendedServiceId: string;
  alternativeServiceIds: string[];
  explanation: string;
  active: boolean;
};

export type BusinessSettings = {
  businessName: string;
  slogan: string;
  headline: string;
  subheadline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  address: string;
  city: string;
  state: string;
  whatsapp: string;
  instagram: string;
  googleMapsUrl: string;
  workingHoursText: string;
};

export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  active: boolean;
};

export interface AddOn {
  id: string;
  name: string;
  category: string;
  price: number;
  active: boolean;
}

export enum RequestStatus {
  REQUESTED = "Agendamento solicitado",
  ANALYSIS = "Em análise",
  CONFIRMED = "Confirmado",
  RECEIVED = "Veículo recebido",
  EXECUTING = "Em execução",
  READY_FOR_PICKUP = "Pronto para retirada",
  FINISHED = "Finalizado",
  CANCELED = "Cancelado"
}

export interface BookingAddOn {
  id: string;
  name: string;
  price: number;
}

export interface BookingRequest {
  id: string;
  protocol: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  plate?: string;
  carCondition?: string;
  serviceId: string;
  serviceName: string;
  serviceDurationMinutes?: number;
  serviceDurationDays?: number;
  selectedPriceLabel: string;
  servicePrice: number;
  addOns: BookingAddOn[];
  totalPrice: number;
  date: string;
  time: string;
  startTime?: string;
  endTime?: string;
  notes: string;
  status: RequestStatus;
  createdAt: string;
  photoUrl?: string; // Simulação
  serviceSnapshot?: {
    serviceId: string;
    serviceName: string;
    priceOptionLabel: string;
    price: number;
    deliveryLabel: string;
    durationMinutes: number;
    durationDays: number;
  };
}

export interface BlockedTimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface ScheduleSettings {
  businessHours: {
    start: string;
    end: string;
  };
  workingDays: number[];
  slotIntervalMinutes: number;
  bufferBetweenBookingsMinutes: number;
  teamsCapacity: number;
  allowSameDayBooking: boolean;
  minimumNoticeMinutes: number;
  maxBookingsPerDay: number | null;
  blockedDates: string[];
  blockedTimeSlots: BlockedTimeSlot[];
}

export interface QuizOption {
  id: string;
  label: string;
  recommendation: string;
  reason: string;
}

