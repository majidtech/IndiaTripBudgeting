'use server';

export async function loginAction(
  username: string,
  password: string
): Promise<{success: boolean; message?: string}> {
  const validUsername = 'OK-Family-2025';
  const validPassword = 'N)eYL0!p.1:5YfQya}wp';

  if (username === validUsername && password === validPassword) {
    return {success: true};
  } else {
    return {success: false, message: 'Invalid username or password'};
  }
}
