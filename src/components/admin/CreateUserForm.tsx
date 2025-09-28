// src/components/CreateUserForm.tsx

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface CreateUserFormProps {
  handleSubmit: (e: React.FormEvent) => void;
  userForm: any;
  setUserForm: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: any;
  validatePassword: (password: string) => void;
  loading: boolean;
}

export function CreateUserForm({
  handleSubmit,
  userForm,
  setUserForm,
  errors,
  showPassword,
  setShowPassword,
  currentUser,
  validatePassword,
  loading,
}: CreateUserFormProps) {
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        {/* Name */}
        <div className="items-center gap-4">
          <div className="grid grid-cols-4 ">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              placeholder="Full Name"
              className="col-span-3"
              value={userForm.name}
              required
              onChange={(e) => setUserForm((prev: any) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="items-center gap-4">
          <div className="grid grid-cols-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              className="col-span-3"
              value={userForm.email}
              required
              onChange={(e) => setUserForm((prev: any) => ({ ...prev, email: e.target.value }))}
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="items-center gap-4">
          <div className="relative grid grid-cols-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="col-span-3"
              value={userForm.password}
              required
              onChange={(e) => {
                setUserForm((prev: any) => ({
                  ...prev,
                  password: e.target.value,
                }));
                validatePassword(e.target.value);
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-muted-foreground"
              aria-label="Toggle Password"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Org Id (only for superadmin) */}
        {currentUser?.user?.role === 'superadmin' && (
          <div className="items-center gap-4">
            <div className="grid grid-cols-4">
              <Label htmlFor="org_id" className="text-right">
                Org Id
              </Label>
              <Input
                id="org_id"
                type="text"
                placeholder="org_id"
                className="col-span-3"
                value={userForm.org_id}
                onChange={(e) =>
                  setUserForm((prev: any) => ({
                    ...prev,
                    org_id: e.target.value,
                  }))
                }
              />
            </div>
            {errors.org_id && <p className="text-red-500 text-xs mt-1">{errors.org_id}</p>}
          </div>
        )}

        {/* Role */}
        <div className="items-center gap-4">
          <div className="grid grid-cols-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <select
              id="role"
              className="col-span-3 bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground"
              value={userForm.role}
              onChange={(e) =>
                setUserForm((prev: any) => ({
                  ...prev,
                  role: e.target.value as 'admin' | 'student' | 'teacher',
                }))
              }
            >
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button disabled={loading} type="submit">
          Submit
        </Button>
      </div>
    </form>
  );
}
