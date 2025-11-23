import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Get JWT secret from environment or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Generate JWT token for magic link
    const token = jwt.sign(
      { email, purpose: 'magic-link' },
      JWT_SECRET,
      { expiresIn: '15m' } // Token expires in 15 minutes
    );

    // Create magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    (request.headers.get('host') ? 
                      `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}` : 
                      'http://localhost:3000');
    
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

    // For test@example.com, return the token directly for testing
    if (email === 'test@example.com') {
      return NextResponse.json({
        message: 'Test mode: Magic link generated successfully',
        magicLink,
        token,
        note: 'In production, this would be sent via email. Click the link or use the token to authenticate.',
      });
    }

    // In a real application, you would send an email here
    // For now, we'll just return the magic link in the response
    console.log(`Magic link for ${email}: ${magicLink}`);

    // In production, uncomment this and set up email service
    // await sendEmail(email, magicLink);

    return NextResponse.json({
      message: 'Magic link sent successfully! (Check console in dev mode)',
      magicLink, // Remove this in production
    });
  } catch (error) {
    console.error('Error generating magic link:', error);
    return NextResponse.json(
      { error: 'Failed to generate magic link' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
