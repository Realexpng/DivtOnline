
import { mockDb } from './mockDb';
import { User } from '../types';

export const authService = {
  currentUser: null as User | null,

  getCurrentUser: async (): Promise<User | null> => {
    const saved = localStorage.getItem('diwt_session');
    if (saved) {
      const { login, token } = JSON.parse(saved);
      const users = await mockDb.getUsers();
      const user = users.find(u => u.login === login && u.sessionToken === token);
      return user || null;
    }
    return null;
  },

  login: async (login: string, pass: string, remember: boolean): Promise<User | null> => {
    const users = await mockDb.getUsers();
    const user = users.find(u => u.login === login && u.password === pass);
    if (user) {
      const token = Math.random().toString(36).substring(7);
      user.sessionToken = token;
      
      const idx = users.findIndex(u => u.id === user.id);
      users[idx] = user;
      await mockDb.saveUsers(users);

      if (remember) {
        localStorage.setItem('diwt_session', JSON.stringify({ login, token }));
      }
      return user;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem('diwt_session');
  },

  register: async (userData: Partial<User>): Promise<{ success: boolean, message?: string }> => {
    const users = await mockDb.getUsers();
    if (users.find(u => u.login === userData.login)) {
      return { success: false, message: 'Логін вже зайнятий' };
    }
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      pib: userData.pib!,
      login: userData.login!,
      email: userData.email!,
      phone: userData.phone!,
      password: userData.password!,
      gender: userData.gender || 'male',
      role: 'student'
    };
    await mockDb.saveUsers([...users, newUser]);
    return { success: true };
  },

  invalidateOtherSessions: (userId: string, currentToken: string) => {
    // In a real app, this would be handled on the server by invalidating tokens.
    // Here we just update the user's current token in mock DB.
  }
};
