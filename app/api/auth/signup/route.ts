import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, passengers, drivers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['passenger', 'driver']).default('passenger'),
  isPregnant: z.boolean().optional(),
  dueDate: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  licenseNumber: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.number().optional(),
  vehiclePlate: z.string().optional(),
  vehicleColor: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const newUser = await db.insert(users).values({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      phone: validatedData.phone,
      role: validatedData.role,
    }).returning()

    const userId = newUser[0].id

    // Create passenger or driver profile
    if (validatedData.role === 'passenger') {
      await db.insert(passengers).values({
        userId,
        emergencyContactName: validatedData.emergencyContactName,
        emergencyContactPhone: validatedData.emergencyContactPhone,
        isPregnant: validatedData.isPregnant ?? true,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      })
    } else if (validatedData.role === 'driver') {
      if (!validatedData.licenseNumber || !validatedData.vehicleMake || 
          !validatedData.vehicleModel || !validatedData.vehicleYear || 
          !validatedData.vehiclePlate || !validatedData.vehicleColor) {
        return NextResponse.json(
          { error: 'Driver registration requires vehicle information' },
          { status: 400 }
        )
      }

      await db.insert(drivers).values({
        userId,
        licenseNumber: validatedData.licenseNumber,
        vehicleMake: validatedData.vehicleMake,
        vehicleModel: validatedData.vehicleModel,
        vehicleYear: validatedData.vehicleYear,
        vehiclePlate: validatedData.vehiclePlate,
        vehicleColor: validatedData.vehicleColor,
      })
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        role: newUser[0].role,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}