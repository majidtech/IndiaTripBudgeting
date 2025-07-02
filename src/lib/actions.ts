'use server';

export async function loginAction(
  username: string,
  password: string
): Promise<{success: boolean; message?: string, isAdmin?: boolean}> {
  const groupUsername = 'OK-Family-2025';
  const groupPassword = 'N)eYL0!p.1:5YfQya}wp';
  
  const adminUsername = 'admin';
  const adminPassword = '1Qa38)~j9_xx1U5~B_AJ';

  if (username === adminUsername && password === adminPassword) {
    return {success: true, isAdmin: true};
  }
  
  if (username === groupUsername && password === groupPassword) {
    return {success: true, isAdmin: false};
  }

  return {success: false, message: 'Invalid username or password'};
}
