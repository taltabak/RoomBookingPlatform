import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.utils';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@roombooking.com',
      password: adminPassword,
      role: 'ADMIN',
      registrationStatus: 'APPROVED',
      canBookMultipleRooms: true,
      maxBookingDuration: 24,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create room owner
  // const ownerPassword = await hashPassword('owner123');
  // const owner = await prisma.user.create({
  //   data: {
  //     firstName: 'Room',
  //     lastName: 'Owner',
  //     email: 'owner@roombooking.com',
  //     password: ownerPassword,
  //     role: 'ROOM_OWNER',
  //     registrationStatus: 'APPROVED',
  //     canBookMultipleRooms: false,
  //     maxBookingDuration: 8,
  //   },
  // });
  // console.log('Created room owner:', owner.email);

  // // Create regular user
  // const userPassword = await hashPassword('user123');
  // const user = await prisma.user.create({
  //   data: {
  //     firstName: 'Regular',
  //     lastName: 'User',
  //     email: 'user@roombooking.com',
  //     password: userPassword,
  //     role: 'USER',
  //     registrationStatus: 'APPROVED',
  //     canBookMultipleRooms: false,
  //     maxBookingDuration: 2,
  //   },
  // });
  // console.log('Created regular user:', user.email);

  // // Create pending users for admin approval
  // const pendingUser1Password = await hashPassword('pending123');
  // const pendingUser1 = await prisma.user.create({
  //   data: {
  //     firstName: 'John',
  //     lastName: 'Doe',
  //     email: 'john.doe@example.com',
  //     password: pendingUser1Password,
  //     role: 'USER',
  //     registrationStatus: 'PENDING',
  //     canBookMultipleRooms: false,
  //     maxBookingDuration: 2,
  //   },
  // });
  // console.log('Created pending user:', pendingUser1.email);

  // const pendingUser2Password = await hashPassword('pending456');
  // const pendingUser2 = await prisma.user.create({
  //   data: {
  //     firstName: 'Jane',
  //     lastName: 'Smith',
  //     email: 'jane.smith@example.com',
  //     password: pendingUser2Password,
  //     role: 'ROOM_OWNER',
  //     registrationStatus: 'PENDING',
  //     canBookMultipleRooms: false,
  //     maxBookingDuration: 8,
  //   },
  // });
  // console.log('Created pending room owner:', pendingUser2.email);

  // // Create sample rooms
  // const room1 = await prisma.room.create({
  //   data: {
  //     name: 'Conference Room A',
  //     description: 'Large conference room with projector and whiteboard',
  //     location: 'New York',
  //     capacity: 20,
  //     amenities: ['Projector', 'Whiteboard', 'Video Conference', 'WiFi'],
  //     ownerId: owner.id,
  //   },
  // });
  // console.log('Created room:', room1.name);

  // const room2 = await prisma.room.create({
  //   data: {
  //     name: 'Meeting Room B',
  //     description: 'Small meeting room for team discussions',
  //     location: 'New York',
  //     capacity: 8,
  //     amenities: ['Whiteboard', 'TV Screen', 'WiFi'],
  //     ownerId: owner.id,
  //   },
  // });
  // console.log('Created room:', room2.name);

  // const room3 = await prisma.room.create({
  //   data: {
  //     name: 'Executive Boardroom',
  //     description: 'Premium boardroom with full amenities',
  //     location: 'San Francisco',
  //     capacity: 15,
  //     amenities: ['Video Conference', 'Projector', 'Sound System', 'Catering', 'WiFi'],
  //     ownerId: owner.id,
  //   },
  // });
  // console.log('Created room:', room3.name);

  // // Create time slots for today and next 7 days
  // const today = new Date();
  // today.setHours(0, 0, 0, 0);

  // const rooms = [room1, room2, room3];

  // for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
  //   const date = new Date(today);
  //   date.setDate(date.getDate() + dayOffset);

  //   for (const room of rooms) {
  //     // Create slots from 8 AM to 6 PM (10 hours)
  //     for (let hour = 8; hour < 18; hour++) {
  //       const startTime = new Date(date);
  //       startTime.setHours(hour, 0, 0, 0);

  //       const endTime = new Date(date);
  //       endTime.setHours(hour + 1, 0, 0, 0);

  //       await prisma.slot.create({
  //         data: {
  //           roomId: room.id,
  //           date: date,
  //           startTime: startTime.toISOString(),
  //           endTime: endTime.toISOString(),
  //           version: 0,
  //         },
  //       });
  //     }
  //   }

  //   console.log(`Created slots for day ${dayOffset + 1}`);
  // }

  console.log('Database seeding completed successfully!');
  console.log('\nTest Credentials:');
  console.log('Admin - Email: admin@roombooking.com, Password: admin123');
  // console.log('Owner - Email: owner@roombooking.com, Password: owner123');
  // console.log('User  - Email: user@roombooking.com, Password: user123');
  // console.log('\nPending Users for Approval:');
  // console.log('Pending User - Email: john.doe@example.com');
  // console.log('Pending Owner - Email: jane.smith@example.com');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
