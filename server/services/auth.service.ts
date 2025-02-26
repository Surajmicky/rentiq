import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "../storage";
import { User as SelectUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);

class AuthService {
  async hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  async comparePasswords(supplied: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }

  async getUserByUsername(username: string) {
    return storage.getUserByUsername(username);
  }

  async createUser(userData: any) {
    const hashedPassword = await this.hashPassword(userData.password);
    return storage.createUser({
      ...userData,
      password: hashedPassword,
    });
  }

  async getUser(id: number) {
    return storage.getUser(id);
  }
}

export const authService = new AuthService();
