import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from "@/components/ui/skeleton";

import { lazy, Suspense } from 'react';

import { useAuth } from '@/context/useAuth';
import { FileText, UserPlus } from 'lucide-react';

import { validateSignUpForm } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabaseClient } from '@/supabase/config';
import { getUsersOfOrg } from '@/services/userService';
import type { TeacherUser, StudentUser } from '@/types/adminDashboard';
const CreateUserForm = lazy(() =>
  import('@/components/admin/CreateUserForm').then((comp) => ({ default: comp.CreateUserForm }))
);
export type User = StudentUser | TeacherUser;
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
type UserForm = {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  org_id?: string;
};
function ActionButtons({ setStudents, setTeachers }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();

  const navigate = useNavigate();
  const [userForm, setUserForm] = useState<UserForm>({
    name: '',
    email: '',
    password: '',
    role: 'student',
    org_id: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    org_id: '',
  });

  const fetchUsers = async () => {
    const response = await getUsersOfOrg({
      orgId: currentUser?.user?.organization_id,
    });

    if (response.success) {
      setStudents(response.data.filter((u: User) => u.role === 'student'));
      setTeachers(response.data.filter((u: User) => u.role === 'teacher'));
    }
  };

  const validatePassword = (value: string) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(value)) {
      setErrors((prev) => {
        return {
          ...prev,
          password:
            'Password must be at least 8 characters long and include at least one uppercase (A–Z), one lowercase (a–z), one number (0–9), and one special character (@ $ ! % * ? &).',
        };
      });
      // setPasswordErrorMsg(
      //     "Password must be at least 8 characters long and include at least one uppercase (A–Z), one lowercase (a–z), one number (0–9), and one special character (@ $ ! % * ? &)."
      // );
    } else {
      setErrors((prev) => {
        return { ...prev, password: '' };
      });
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      if (errors?.password) {
        toast.error('Please fix the errors in the form before submitting.');
        return;
      }
      if (!validateSignUpForm(userForm, setErrors, { role: true })) return;

      const session = await supabaseClient?.auth?.getSession();

      const token = session.data.session?.access_token;

      setLoading(true);

      const response = await fetch(`${VITE_SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userForm.email,
          password: userForm.password,
          name: userForm.name,
          role: userForm.role,
          organization_id: currentUser?.user?.organization_id || userForm.org_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`${errorData?.message}`);
        throw new Error(errorData?.message || 'Something went wrong on the server.');
      } else {
        toast.success(`user created successfully`);

        setIsDialogOpen(false);
        setUserForm({
          name: '',
          email: '',
          password: '',
          role: 'student',
          org_id: '',
        });

        fetchUsers();
      }
    } catch (error) {
      toast.error('Creating user failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="flex justify-end sm:justify-end">
        {/* Desktop buttons */}
        <div className="hidden sm:flex gap-2">
          <Button className="gap-2 cursor-pointer" onClick={() => navigate('/teacher/create-test')}>
            <Plus size={18} /> Create Test
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                // Reset form + errors when dialog closes
                setUserForm({
                  name: '',
                  email: '',
                  password: '',
                  org_id: '',
                  role: 'student',
                });
                setErrors({});
                setShowPassword(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2 cursor-pointer">
                <Plus size={18} /> Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md min-h-[400px]">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Enter the user details below.</DialogDescription>
              </DialogHeader>
              <Suspense fallback={
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Skeleton className="h-4 w-16" /> {/* label */}
        <Skeleton className="col-span-3 h-9" /> {/* input */}
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="col-span-3 h-9" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="col-span-3 h-9" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  }>
                <CreateUserForm
                  handleSubmit={handleSubmit}
                  loading={loading}
                  userForm={userForm}
                  setUserForm={setUserForm}
                  errors={errors}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  currentUser={currentUser}
                  validatePassword={validatePassword}
                />
              </Suspense>
            </DialogContent>
          </Dialog>
        </div>

        {/* Mobile floating action button */}
        <div className="sm:hidden fixed bottom-6 right-6 z-50">
          <div className="relative">
            {/* Speed Dial Menu */}
            <div
              className={`absolute bottom-16 right-0 flex flex-col gap-2 mb-2 transition-all duration-200 ease-out ${
                isSpeedDialOpen
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible translate-y-2'
              }`}
            >
              {/* Create Test Button */}
              <button
                onClick={() => {
                  setIsSpeedDialOpen(false);
                  navigate('/teacher/create-test');
                }}
                className="flex items-center justify-center rounded-full w-12 h-12 shadow-md bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col items-center text-gray-700">
                  <FileText className="h-4 w-4" />
                  <span className="text-[10px] mt-0.5">Test</span>
                </div>
              </button>

              {/* Create User Button */}
              <button
                onClick={() => {
                  setIsSpeedDialOpen(false);
                  setIsDialogOpen(true);
                }}
                className="flex items-center justify-center rounded-full w-12 h-12 shadow-md bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col items-center text-gray-700">
                  <UserPlus className="h-4 w-4" />
                  <span className="text-[10px] mt-0.5">User</span>
                </div>
              </button>
            </div>

            {/* Main FAB Button */}
            <button
              onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
              className={`flex items-center justify-center rounded-full w-14 h-14 shadow-lg ${
                isSpeedDialOpen ? 'bg-gray-800' : 'bg-gray-900'
              } text-white transition-all duration-200`}
            >
              <Plus
                className={`transition-transform duration-200 ${
                  isSpeedDialOpen ? 'rotate-45' : ''
                }`}
                size={20}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ActionButtons;
