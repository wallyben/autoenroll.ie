import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      purpose: string;
    };

    if (decoded.purpose !== 'magic-link') {
      return NextResponse.json(
        { error: 'Invalid token purpose' },
        { status: 400 }
      );
    }

    // Create a session token (valid for longer)
    const sessionToken = jwt.sign(
      { email: decoded.email, purpose: 'session' },
      JWT_SECRET,
      { expiresIn: '7d' } // Session lasts 7 days
    );

    // In production, set this as an HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      email: decoded.email,
      // sessionToken removed from body for security - available via HTTP-only cookie
    });

    // Set session cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 401 }
      );
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
