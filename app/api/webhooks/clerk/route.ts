import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created':
      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url, last_sign_in_at } = evt.data;
        const email = email_addresses?.[0]?.email_address;
        const name = first_name && last_name ? `${first_name} ${last_name}` : first_name || email?.split('@')[0];

        await prisma.user.upsert({
          where: { clerkId: id },
          update: {
            email,
            name,
            image: image_url,
            lastSignInAt: last_sign_in_at ? new Date(last_sign_in_at) : undefined,
          },
          create: {
            clerkId: id,
            email,
            name,
            image: image_url,
            emailVerified: new Date(),
            lastSignInAt: last_sign_in_at ? new Date(last_sign_in_at) : undefined,
          },
        });
        break;
      }
      case 'user.deleted': {
        const { id } = evt.data;
        await prisma.user.deleteMany({
          where: { clerkId: id },
        });
        break;
      }
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response('', { status: 200 });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}

export async function GET() {
  return new Response('Hello, World!', {
    status: 200,
  });
}
