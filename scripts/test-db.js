const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pufyhgdfgvfxwzhpjkjh.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1ZnloZ2RmZ3ZmeHd6aHBqa2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMjc3MjQsImV4cCI6MjA5NjYwMzcyNH0.VD2CEYiY3ibj4l0ib07qYTC__YCsMoDLIGQdx0wtSAg'
);

async function test() {
  const { data, error } = await supabase.from('user').select('*').limit(1);
  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } else {
    console.log('Success:', data);
    process.exit(0);
  }
}

test();
