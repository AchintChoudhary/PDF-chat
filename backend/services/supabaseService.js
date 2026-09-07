import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const bucket =
  process.env.SUPABASE_BUCKET || 'pdfs';

if (!supabaseUrl) {
  throw new Error(
    'SUPABASE_URL is missing. Check backend/.env'
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY is missing. Check backend/.env'
  );
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// -------------------------
// Upload PDF
// -------------------------

export const uploadPdf = async ({
  buffer,
  filename,
  userId,
}) => {
  if (!buffer) {
    throw new Error('PDF buffer is required');
  }

  if (!filename) {
    throw new Error('PDF filename is required');
  }

  const safeFilename = filename.replace(
    /[^a-zA-Z0-9._-]/g,
    '_'
  );

  const storagePath =
    `${userId}/${Date.now()}-${safeFilename}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (error) {
    throw new Error(
      `Supabase upload failed: ${error.message}`
    );
  }

  return {
    path: data.path,
    bucket,
  };
};

// -------------------------
// Delete PDF
// -------------------------

export const deletePdf = async (storagePath) => {
  if (!storagePath) return;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([storagePath]);

  if (error) {
    console.error(
      'Supabase delete error:',
      error.message
    );
  }
};

// -------------------------
// Download PDF
// -------------------------

export const downloadPdf = async (storagePath) => {
  if (!storagePath) {
    throw new Error('Storage path is required');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(storagePath);

  if (error) {
    throw new Error(
      `Supabase download failed: ${error.message}`
    );
  }

  return Buffer.from(
    await data.arrayBuffer()
  );
};

// -------------------------
// Signed PDF URL
// -------------------------

export const createSignedPdfUrl = async (
  storagePath,
  expiresIn = 3600
) => {
  if (!storagePath) {
    throw new Error('Storage path is required');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(
      storagePath,
      expiresIn
    );

  if (error) {
    throw new Error(
      `Could not create signed URL: ${error.message}`
    );
  }

  return data.signedUrl;
};