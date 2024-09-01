import { supabase } from '@/lib/supabase';

export const listEmployees = async () => {
  const { data } = await supabase.from('EmployeeDirectory').select('*');
  return data;
};

export const getEmployee = async (name: string) => {
  const data = await listEmployees();

  if (data) {
    const employee = data.find((x) =>
      x.full_name.toLowerCase().includes(name.toLowerCase())
    );

    return employee;
  }

  return null;
};
