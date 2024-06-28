import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';


//This Function is for reading the Files for the Learn Page
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');

  if (!topic) {
    return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(),'src','app','infosec', `${topic}.txt`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return new Response(content, { headers: { 'Content-Type': 'text/plain' }});
}
