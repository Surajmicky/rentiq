import session from "express-session";
import createMemoryStore from "memorystore";
import { User, InsertUser, Tenant, InsertTenant, Bill, InsertBill } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTenants(userId: number): Promise<Tenant[]>;
  getTenant(id: number): Promise<Tenant | undefined>;
  createTenant(userId: number, tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: number, tenant: Partial<InsertTenant>): Promise<Tenant>;
  deleteTenant(id: number): Promise<void>;
  
  getBills(tenantId: number): Promise<Bill[]>;
  getBill(id: number): Promise<Bill | undefined>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: number, bill: Partial<Bill>): Promise<Bill>;
  deleteBill(id: number): Promise<void>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tenants: Map<number, Tenant>;
  private bills: Map<number, Bill>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.tenants = new Map();
    this.bills = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTenants(userId: number): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).filter(
      (tenant) => tenant.userId === userId && tenant.active
    );
  }

  async getTenant(id: number): Promise<Tenant | undefined> {
    return this.tenants.get(id);
  }

  async createTenant(userId: number, tenant: InsertTenant): Promise<Tenant> {
    const id = this.currentId++;
    const newTenant: Tenant = { ...tenant, id, userId, active: true };
    this.tenants.set(id, newTenant);
    return newTenant;
  }

  async updateTenant(id: number, tenant: Partial<InsertTenant>): Promise<Tenant> {
    const existing = await this.getTenant(id);
    if (!existing) throw new Error("Tenant not found");
    const updated = { ...existing, ...tenant };
    this.tenants.set(id, updated);
    return updated;
  }

  async deleteTenant(id: number): Promise<void> {
    const tenant = await this.getTenant(id);
    if (!tenant) throw new Error("Tenant not found");
    tenant.active = false;
    this.tenants.set(id, tenant);
  }

  async getBills(tenantId: number): Promise<Bill[]> {
    return Array.from(this.bills.values()).filter(
      (bill) => bill.tenantId === tenantId
    );
  }

  async getBill(id: number): Promise<Bill | undefined> {
    return this.bills.get(id);
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const id = this.currentId++;
    const newBill: Bill = {
      ...bill,
      id,
      rentPaid: false,
      electricityAmount: bill.electricityReading ? bill.electricityReading * 1 : null,
      electricityPaid: false,
      createdAt: new Date(),
    };
    this.bills.set(id, newBill);
    return newBill;
  }

  async updateBill(id: number, bill: Partial<Bill>): Promise<Bill> {
    const existing = await this.getBill(id);
    if (!existing) throw new Error("Bill not found");
    const updated = { ...existing, ...bill };
    this.bills.set(id, updated);
    return updated;
  }

  async deleteBill(id: number): Promise<void> {
    this.bills.delete(id);
  }
}

export const storage = new MemStorage();