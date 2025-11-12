import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear auth_token cookie by setting it to an empty value with past expiration
  res.setHeader('Set-Cookie', 'auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');

  return res.status(200).json({
    message: 'Logged out successfully'
  });
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};
