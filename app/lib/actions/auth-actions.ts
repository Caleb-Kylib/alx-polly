'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginFormData, RegisterFormData } from '../types';
import { validateEmail, validatePassword, validateName } from '@/lib/security';

export async function login(data: LoginFormData) {
  const supabase = await createClient();

  // Validate inputs
  const emailValidation = validateEmail(data.email);
  const passwordValidation = validatePassword(data.password);

  if (emailValidation.errors.length > 0) {
    return { error: emailValidation.errors[0] };
  }

  if (passwordValidation.errors.length > 0) {
    return { error: passwordValidation.errors[0] };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: emailValidation.sanitized,
    password: data.password,
  });

  if (error) {
    return { error: "Invalid email or password" };
  }

  // Success: no error
  return { error: null };
}

export async function register(data: RegisterFormData) {
  const supabase = await createClient();

  // Validate inputs
  const emailValidation = validateEmail(data.email);
  const passwordValidation = validatePassword(data.password);
  const nameValidation = validateName(data.name);

  if (emailValidation.errors.length > 0) {
    return { error: emailValidation.errors[0] };
  }

  if (passwordValidation.errors.length > 0) {
    return { error: passwordValidation.errors[0] };
  }

  if (nameValidation.errors.length > 0) {
    return { error: nameValidation.errors[0] };
  }

  const { error } = await supabase.auth.signUp({
    email: emailValidation.sanitized,
    password: data.password,
    options: {
      data: {
        name: nameValidation.sanitized,
      },
    },
  });

  if (error) {
    return { error: "Failed to create account. Please try again." };
  }

  // Success: no error
  return { error: null };
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}
