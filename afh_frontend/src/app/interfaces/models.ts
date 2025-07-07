export interface Item {
  id: number;
  description: string;
  units: string;
  total_value: number;
  amount: number;
  unit_value: number;
}

export interface Option {
  id: number;
  name: string;
  total_value: number;
  subtotal: string;
  items: Item[];
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  post: string;
  representative: string;
}

export interface Quote {
  id: number;
  customer: Customer;
  code: string;
  description: string;
  issue_date: number;
  options: Option;
  state: number;
  tasks: string[];
  administration: number;
  unforeseen: number;
  utility: number;
  iva: number;
  method_of_payment: string;
  administration_value: string;
  unforeseen_value: string;
  utility_value: string;
  iva_value: string;
  construction: string;
  total_value: string;
  contractor_materials: string[];
  contracting_materials: string[];
  delivery_time: string;
}

export interface OrderWork {
  id: number;
  quote: Quote;
  description: string;
  start_date: string;
  end_date: string;
  workplace: number;
  number_technicians: number;
  number_officers: number;
  number_auxiliaries: number;
  number_supervisors: number;
  activity: number;
  permissions: [];
}

export interface WorkReport {
  id: number;
  work_order: OrderWork;
  exhibit: exhibit[];
  date: string;
  observations: string;
  recommendations: string;
  description: string;
  development: string;
  tasks: { titulo: string; subdescripciones: string[] }[];
}

export interface exhibit {
  id: number;
  tittle: string;
  images: string[];
}

export interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

export interface income {
  id: number;
  amount: number;
  payment_method: number;
  target_account: string;
  date: string;
}

export interface expense {
  id: number;
  amount: number;
  payment_method: number;
  target_account: string;
  date: string;
}
