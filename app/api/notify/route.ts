// app/api/notify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendPushToAllDevices } from '@/app/actions/push-actions';

export async function POST(request: NextRequest) {
  try {
    const { testMessage } = await request.json();
    
    const result = await sendPushToAllDevices({
      title: `Cross-Device Test! 📱`,
      body: testMessage || "This is a test notification sent to all your devices!",
      data: { 
        type: 'test',
        timestamp: new Date().toISOString()
      },
      tag: 'cross-device-test'
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in notify webhook:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send notifications' 
    }, { status: 500 });
  }
}