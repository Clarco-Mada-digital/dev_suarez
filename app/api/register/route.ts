import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, name, role, jobTitle, company, skills } = await req.json();

    if (!email || !password || !name || !role) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse('User already exists', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        role,
        profile: {
          create: {
            jobTitle: role === 'FREELANCER' ? jobTitle : null,
            company: role === 'CLIENT' ? company : null,
            skills: role === 'FREELANCER' ? skills : null,
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}