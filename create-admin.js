const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
global.WebSocket = WebSocket;

const supabase = createClient(
  'https://kpikdnpcezdoffdnhuyl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwaWtkbnBjZXpkb2ZmZG5odXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5Mjc2ODMsImV4cCI6MjA5MzUwMzY4M30.VDA622cCHlQkKmQmarNhE-Xa2PTufMgOWkS9kNpzXbk'
);

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@quizmaster.com',
    password: 'password123',
    options: {
      data: {
        role: 'admin',
        first_name: 'Admin',
        last_name: 'User'
      }
    }
  });

  if (error) {
    console.error('Error creating admin:', error);
  } else {
    console.log('Admin user created successfully:', data.user?.email || 'User already exists');
  }
}

createAdmin();
