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
  total_value_formatted: string;
  items: Item[];
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
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
  construction_company: string;
}

export interface OrderWork {
  id: number;
  Quotes: Quote;
  start_date: string;
  end_date: string;
}

export interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}