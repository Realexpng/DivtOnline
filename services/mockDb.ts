
import { User, CertificateRequest, ChatSession } from '../types';
import { supabase } from './supabase';

export const mockDb = {
  getUsers: async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase.from('users').select('*');
      
      if (error) {
        console.error("Supabase error fetching users:", error);
        return [];
      }
      
      const users = data.map((u: any) => ({
        id: u.id,
        pib: u.pib,
        login: u.login,
        password: u.password,
        email: u.email,
        phone: u.phone,
        gender: u.gender,
        role: u.role,
        sessionToken: u.session_token
      }));

      // Check if admin exists, if not - create it
      if (!users.find(u => u.login === 'admin')) {
        console.log("Admin not found, attempting to create...");
        const adminUser = {
          id: 'admin-id',
          pib: 'Адміністратор Системи',
          login: 'admin',
          password: 'dfmrtduit2023',
          email: 'admin@diwt.edu.ua',
          phone: '+380000000000',
          gender: 'male',
          role: 'admin'
        };

        const { error: insertError } = await supabase.from('users').insert({
          id: adminUser.id,
          pib: adminUser.pib,
          login: adminUser.login,
          password: adminUser.password,
          email: adminUser.email,
          phone: adminUser.phone,
          gender: adminUser.gender,
          role: adminUser.role
        });

        if (!insertError) {
          console.log("Admin created successfully");
          users.push(adminUser);
        } else {
          console.error("Failed to auto-create admin. Tables might be missing.", insertError);
        }
      }

      return users;
    } catch (e) {
      console.error("Failed to fetch users", e);
      return [];
    }
  },

  saveUsers: async (users: User[]) => {
    try {
      // Upsert users
      const dbUsers = users.map(u => ({
        id: u.id,
        pib: u.pib,
        login: u.login,
        password: u.password,
        email: u.email,
        phone: u.phone,
        gender: u.gender,
        role: u.role,
        session_token: u.sessionToken
      }));
      
      const { error } = await supabase.from('users').upsert(dbUsers);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to sync users", e);
    }
  },

  getCertificates: async (): Promise<CertificateRequest[]> => {
    try {
      const { data, error } = await supabase.from('certificates').select('*');
      if (error) throw error;

      return data.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        userPib: c.user_pib,
        userPhone: c.user_phone,
        type: c.type,
        status: c.status,
        createdAt: Number(c.created_at),
        fileName: c.file_name,
        fileUrl: c.file_url
      }));
    } catch (e) {
      console.error("Failed to fetch certificates", e);
      return [];
    }
  },

  saveCertificates: async (certs: CertificateRequest[]) => {
    try {
      const dbCerts = certs.map(c => ({
        id: c.id,
        user_id: c.userId,
        user_pib: c.userPib,
        user_phone: c.userPhone,
        type: c.type,
        status: c.status,
        created_at: c.createdAt,
        file_name: c.fileName,
        file_url: c.fileUrl
      }));
      
      const { error } = await supabase.from('certificates').upsert(dbCerts);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to sync certificates", e);
    }
  },

  getChats: async (): Promise<ChatSession[]> => {
    try {
      const { data, error } = await supabase.from('chats').select('*');
      if (error) throw error;
      
      return data.map((c: any) => ({
        userId: c.user_id,
        userPib: c.user_pib,
        isActive: c.is_active,
        messages: c.messages || [],
        hasUnreadAdmin: c.has_unread_admin,
        hasUnreadUser: c.has_unread_user
      }));
    } catch (e) {
      console.error("Failed to fetch chats", e);
      return [];
    }
  },

  saveChats: async (chats: ChatSession[]) => {
    try {
      const dbChats = chats.map(c => ({
        user_id: c.userId,
        user_pib: c.userPib,
        is_active: c.isActive,
        messages: c.messages,
        has_unread_admin: c.hasUnreadAdmin,
        has_unread_user: c.hasUnreadUser
      }));
      
      const { error } = await supabase.from('chats').upsert(dbChats);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to sync chats", e);
    }
  }
};
