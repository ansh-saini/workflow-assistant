import { supabase } from '@/lib/supabase';

export const getLeaves = async () => {
  let { data }: { data: any } = await supabase.from('LeaveDirectory').select(`
  date,
  EmployeeDirectory (
    email, full_name
  )
`);

  if (data) {
    data = data?.map((leave: any) => ({
      leaveDate: leave.date,
      employee: leave.EmployeeDirectory,
    }));
  }

  return data;
};

export const createLeave = async ({ name, date }: any) => {
  const { data: EmployeeDirectory } = await supabase
    .from('EmployeeDirectory')
    .select('*');

  if (!EmployeeDirectory) return { message: 'Unable to process your request' };

  const employee = EmployeeDirectory.find((x) =>
    x.full_name.toLowerCase().includes(name.toLowerCase())
  );

  if (!employee) return { message: 'Unable to process your request' };

  const { error } = await supabase.from('LeaveDirectory').insert([
    {
      employee: employee.id,
      date,
    },
  ]);

  if (error) return { message: 'Unable to process your request' };
  return { message: 'Leave created successfully' };
};
