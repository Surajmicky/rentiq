import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTenantSchema, insertBillSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Tenant routes
  app.get("/api/tenants", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tenants = await storage.getTenants(req.user.id);
    res.json(tenants);
  });

  app.post("/api/tenants", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const data = insertTenantSchema.parse(req.body);
    const tenant = await storage.createTenant(req.user.id, data);
    res.status(201).json(tenant);
  });

  app.patch("/api/tenants/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tenant = await storage.getTenant(parseInt(req.params.id));
    if (!tenant || tenant.userId !== req.user.id) return res.sendStatus(404);
    const updated = await storage.updateTenant(tenant.id, req.body);
    res.json(updated);
  });

  app.delete("/api/tenants/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tenant = await storage.getTenant(parseInt(req.params.id));
    if (!tenant || tenant.userId !== req.user.id) return res.sendStatus(404);
    await storage.deleteTenant(tenant.id);
    res.sendStatus(200);
  });

  // Bill routes
  app.get("/api/tenants/:id/bills", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tenant = await storage.getTenant(parseInt(req.params.id));
    if (!tenant || tenant.userId !== req.user.id) return res.sendStatus(404);
    const bills = await storage.getBills(tenant.id);
    res.json(bills);
  });

  app.post("/api/tenants/:id/bills", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tenant = await storage.getTenant(parseInt(req.params.id));
    if (!tenant || tenant.userId !== req.user.id) return res.sendStatus(404);

    // Check if bill already exists for this month
    const existingBills = await storage.getBills(tenant.id);
    const monthExists = existingBills.some(bill => bill.month === req.body.month);
    if (monthExists) {
      return res.status(400).json({ message: "Bill already exists for this month" });
    }

    const data = insertBillSchema.parse({ ...req.body, tenantId: tenant.id });
    const bill = await storage.createBill(data);
    res.status(201).json(bill);
  });

  app.patch("/api/bills/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const bill = await storage.getBill(parseInt(req.params.id));
    if (!bill) return res.sendStatus(404);
    const tenant = await storage.getTenant(bill.tenantId);
    if (!tenant || tenant.userId !== req.user.id) return res.sendStatus(404);
    const updated = await storage.updateBill(bill.id, req.body);
    res.json(updated);
  });

  app.delete("/api/bills/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const bill = await storage.getBill(parseInt(req.params.id));
    if (!bill) return res.sendStatus(404);
    const tenant = await storage.getTenant(bill.tenantId);
    if (!tenant || tenant.userId !== req.user.id) return res.sendStatus(404);
    await storage.deleteBill(bill.id);
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}