import type { Product, Order, Job, Service, Visit } from "./types";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const PRODUCTS_FILE = join(DATA_DIR, "products.json");
const ORDERS_FILE = join(DATA_DIR, "orders.json");
const JOBS_FILE = join(DATA_DIR, "jobs.json");
const SERVICES_FILE = join(DATA_DIR, "services.json");
const VISITS_FILE = join(DATA_DIR, "visits.json");
const MAX_VISITS = 500;

const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Classic Wireless Headphones",
    description: "Premium sound with 30-hour battery. Comfortable over-ear design.",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    category: "Electronics",
    stock: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Minimalist Watch",
    description: "Sleek analog watch with leather strap. Water resistant.",
    price: 129.0,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    category: "Electronics",
    stock: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Organic Cotton T-Shirt",
    description: "Soft, sustainable cotton. Available in multiple colors.",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    category: "Men's Clothing",
    stock: 100,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Portable Power Bank",
    description: "20,000 mAh. Fast charging for phones and tablets.",
    price: 45.0,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
    category: "Electronics",
    stock: 75,
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Women's Summer Dress",
    description: "Light, breathable fabric. Perfect for warm weather.",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400",
    category: "Women's Clothing",
    stock: 60,
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Kids Sneakers",
    description: "Comfortable and durable for everyday play.",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    category: "Kids",
    stock: 80,
    createdAt: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Industrial Pump Seal Kit",
    description: "High-quality spare parts for oil & gas pumps. Durable and reliable.",
    price: 125.0,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
    category: "Oil & Gas Equipment",
    stock: 25,
    createdAt: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Valve Gasket Set",
    description: "Spare parts for industrial valves. Compatible with standard fittings.",
    price: 45.0,
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400",
    category: "Spare Parts",
    stock: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: "9",
    name: "Interior Wall Paint — White",
    description: "Premium matte finish. Easy to apply, long-lasting.",
    price: 38.99,
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400",
    category: "Paint",
    stock: 120,
    createdAt: new Date().toISOString(),
  },
  {
    id: "10",
    name: "Premium Crop Seeds — Wheat",
    description: "High-yield wheat seeds for agriculture. Certified quality.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400",
    category: "Seeds",
    stock: 200,
    createdAt: new Date().toISOString(),
  },
  {
    id: "11",
    name: "Tractor Replacement Filter",
    description: "Air and oil filter for agricultural machinery.",
    price: 42.0,
    image: "https://images.unsplash.com/photo-1625245488614-25e37e2f2e0f?w=400",
    category: "Agriculture",
    stock: 65,
    createdAt: new Date().toISOString(),
  },
  {
    id: "12",
    name: "2018 Toyota Camry — Used",
    description: "Well maintained, single owner. Full service history. Low kilometres.",
    price: 18500.0,
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400",
    category: "Used Car",
    stock: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "13",
    name: "Gold Bracelet — Pre-owned",
    description: "18K gold link bracelet. Authenticated. Excellent condition.",
    price: 420.0,
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=400",
    category: "Used Jewellery",
    stock: 1,
    createdAt: new Date().toISOString(),
  },
];

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readProducts(): Product[] {
  ensureDataDir();
  if (!existsSync(PRODUCTS_FILE)) {
    writeFileSync(PRODUCTS_FILE, JSON.stringify(defaultProducts, null, 2));
    return defaultProducts;
  }
  return JSON.parse(readFileSync(PRODUCTS_FILE, "utf-8"));
}

function writeProducts(products: Product[]) {
  ensureDataDir();
  writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

function readOrders(): Order[] {
  ensureDataDir();
  if (!existsSync(ORDERS_FILE)) return [];
  return JSON.parse(readFileSync(ORDERS_FILE, "utf-8"));
}

function writeOrders(orders: Order[]) {
  ensureDataDir();
  writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

export function getProducts(): Product[] {
  return readProducts();
}

export function getProductById(id: string): Product | undefined {
  return readProducts().find((p) => p.id === id);
}

export function saveProduct(product: Product) {
  const products = readProducts();
  const i = products.findIndex((p) => p.id === product.id);
  if (i >= 0) products[i] = product;
  else products.push(product);
  writeProducts(products);
  return product;
}

export function deleteProduct(id: string) {
  const products = readProducts().filter((p) => p.id !== id);
  writeProducts(products);
}

export function getOrders(): Order[] {
  return readOrders();
}

export function addOrder(order: Order) {
  const orders = readOrders();
  orders.unshift(order);
  writeOrders(orders);
  return order;
}

export function updateOrderStatus(orderId: string, status: Order["status"]) {
  const orders = readOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    writeOrders(orders);
  }
  return order;
}

function readVisits(): Visit[] {
  ensureDataDir();
  if (!existsSync(VISITS_FILE)) return [];
  return JSON.parse(readFileSync(VISITS_FILE, "utf-8"));
}

function writeVisits(visits: Visit[]) {
  ensureDataDir();
  writeFileSync(VISITS_FILE, JSON.stringify(visits, null, 2));
}

export function addVisit(visit: Omit<Visit, "id" | "createdAt">) {
  const visits = readVisits();
  const entry: Visit = {
    ...visit,
    id: `v-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  visits.unshift(entry);
  if (visits.length > MAX_VISITS) visits.length = MAX_VISITS;
  try {
    writeVisits(visits);
  } catch {
    // Read-only filesystem (e.g. Vercel serverless); visits won't persist.
  }
  return entry;
}

export function getVisits(): Visit[] {
  return readVisits();
}

const defaultJobs: Job[] = [
  {
    id: "1",
    title: "Sales Associate",
    company: "Miaha international market",
    location: "Remote",
    type: "full-time",
    description: "Support customers and drive sales for our product catalog.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Marketing Coordinator",
    company: "Miaha international market",
    location: "Remote",
    type: "part-time",
    description: "Help with digital marketing and social media.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Warehouse Assistant",
    company: "Miaha international market",
    location: "On-site",
    type: "full-time",
    description: "Manage inventory and fulfill orders.",
    createdAt: new Date().toISOString(),
  },
];

function readJobs(): Job[] {
  ensureDataDir();
  if (!existsSync(JOBS_FILE)) {
    writeFileSync(JOBS_FILE, JSON.stringify(defaultJobs, null, 2));
    return defaultJobs;
  }
  return JSON.parse(readFileSync(JOBS_FILE, "utf-8"));
}

function writeJobs(jobs: Job[]) {
  ensureDataDir();
  writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
}

export function getJobs(): Job[] {
  return readJobs();
}

export function getJobById(id: string): Job | undefined {
  return readJobs().find((j) => j.id === id);
}

export function saveJob(job: Job) {
  const jobs = readJobs();
  const i = jobs.findIndex((j) => j.id === job.id);
  if (i >= 0) jobs[i] = job;
  else jobs.push(job);
  writeJobs(jobs);
  return job;
}

export function deleteJob(id: string) {
  const jobs = readJobs().filter((j) => j.id !== id);
  writeJobs(jobs);
}

const defaultServices: Service[] = [
  {
    id: "1",
    trade: "Plumber",
    businessName: "Quick Fix Plumbing",
    description: "Residential and commercial plumbing. Repairs, installations, emergency call-outs.",
    phone: "+1 555-0101",
    email: "contact@quickfix.example",
    location: "Downtown",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    trade: "Electrical",
    businessName: "SafeWire Electric",
    description: "Licensed electricians. Wiring, panels, lighting, and repairs.",
    phone: "+1 555-0102",
    email: "info@safewire.example",
    location: "City wide",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    trade: "Painter",
    businessName: "Fresh Coat Painters",
    description: "Interior and exterior painting. Residential and commercial.",
    phone: "+1 555-0103",
    email: "hello@freshcoat.example",
    location: "Greater area",
    createdAt: new Date().toISOString(),
  },
];

function readServices(): Service[] {
  ensureDataDir();
  if (!existsSync(SERVICES_FILE)) {
    writeFileSync(SERVICES_FILE, JSON.stringify(defaultServices, null, 2));
    return defaultServices;
  }
  return JSON.parse(readFileSync(SERVICES_FILE, "utf-8"));
}

function writeServices(services: Service[]) {
  ensureDataDir();
  writeFileSync(SERVICES_FILE, JSON.stringify(services, null, 2));
}

export function getServices(): Service[] {
  return readServices();
}

export function getServiceById(id: string): Service | undefined {
  return readServices().find((s) => s.id === id);
}

export function saveService(service: Service) {
  const services = readServices();
  const i = services.findIndex((s) => s.id === service.id);
  if (i >= 0) services[i] = service;
  else services.push(service);
  writeServices(services);
  return service;
}

export function deleteService(id: string) {
  const services = readServices().filter((s) => s.id !== id);
  writeServices(services);
}
