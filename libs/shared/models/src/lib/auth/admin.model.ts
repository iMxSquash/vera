/**
 * Admin user model - shared between frontend and backend
 */
export class Admin {
  id!: string;
  email!: string;
  role!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
